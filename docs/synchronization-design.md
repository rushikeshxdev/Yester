# Yester Synchronization & Offline-First Design

**Document Version:** 1.0.0  
**Target:** Future Offline-First Sync Architecture (Stage 2+)  
**Primitives:** Client-Minted UUIDs, Atomic Revisions, Deletion Tombstones  

---

## 1. Synchronization Philosophy

Yester is designed for sovereign personal archiving. A user writing a reflection in a plane, logging a workout in a gym without cellular reception, or capturing a quick idea offline must never be blocked by network connectivity.

The database and API are architected with foundational offline-first primitives:

```
Client Device (Offline Storage)
       │
       │ Generates Client-Minted UUIDs
       │ Writes Local Changes & Increments Local Revision
       ▼
[Network Reconnects]
       │
       │ POST /api/v1/sync/push (Batch of Changes with Base Revisions)
       ▼
Server Transaction Boundary
       │
       ├── Optimistic Concurrency Check:
       │     WHERE id = :id AND revision = :baseRevision
       │
       ├── Success:
       │     Apply Update, revision = revision + 1
       │
       └── Conflict Detected (Server revision > baseRevision):
             Invoke Conflict Resolution Engine (Latest Update Wins / Field-Level Merge)
```

---

## 2. Foundational Primitives

### 2.1 Client-Minted UUIDs
* Traditional auto-increment integer IDs fail in distributed offline systems because the server must assign the ID before child relationships can be formed.
* In Yester, all entities (`DailyRecord`, `DailyEntry`, `LifePlan`, `PlanMilestone`) use **UUID v4** generated directly by the client at the instant of creation.
* When the client creates an entry linked to a plan or daily record, the foreign key relationships are established immediately offline.

### 2.2 Atomic Revisions (`revision: Int`)
* Every independently editable model maintains an integer `revision`, initialized at `1`.
* During updates, the database enforces optimistic concurrency checks:
  ```sql
  UPDATE daily_entries 
  SET title = :newTitle, 
      payload = :newPayload, 
      revision = revision + 1, 
      updated_at = NOW() 
  WHERE id = :id AND revision = :clientExpectedRevision;
  ```
* If the row count affected is `0`, a concurrency conflict has occurred, preventing silent data overwrite.

### 2.3 Deletion Tombstones (`deletedAt`)
* Physical row deletion (`DELETE FROM table`) breaks synchronization because offline devices cannot learn about rows that no longer exist on the server.
* All core entities use **Soft Deletion** via `deletedAt: DateTime?`.
* When an entity is deleted, `deletedAt` is stamped with the timestamp and `revision` is incremented.
* When offline clients synchronize, they receive tombstone records where `deletedAt IS NOT NULL`, allowing them to safely purge local records.

---

## 3. Conflict Resolution Strategy

| Conflict Scenario | Resolution Rule | Behavior |
| :--- | :--- | :--- |
| **Non-Conflicting Edits** | Automatic Merge | Client edited Day A, Server has changes for Day B -> Both applied. |
| **Concurrent Entry Update** | Optimistic Revision Check | If server revision matches client base revision -> update accepted. If mismatch -> server returns 409 Conflict with current server state. |
| **Concurrent Daily Record Edit** | Field-Level Resolution | If Client updated `headline` and Server updated `reflection` -> both non-overlapping fields merge cleanly. |
| **Edit vs. Delete** | Tombstone Wins | If one client deletes an entry while another edits it offline -> deletion tombstone takes precedence; entry remains deleted. |

---

## 4. Derived Values Consistency During Sync

Because `LifePlan.currentValue` and `PlanMilestone.isReached` are **strictly derived** from linked entries (Architectural Rules #3 & #4):
1. No sync conflicts can ever arise on `currentValue` or milestone states.
2. When historical entries are synchronized, added, or deleted, plan totals recalculate with 100% mathematical consistency across all devices.
