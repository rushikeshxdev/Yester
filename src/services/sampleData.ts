import { DailyRecord } from '../types';
import { formatDateKey } from '../utils/dateUtils';

export function generateSampleRecords(): Record<string, DailyRecord> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const records: Record<string, DailyRecord> = {};

  // Sample 1: Today
  const todayKey = formatDateKey(currentYear, currentMonth, currentDay);
  records[todayKey] = {
    id: todayKey,
    date: todayKey,
    isSampleData: true,
    summary: 'Distributed pipeline architecture review, heavy upper strength session, and Raft consensus study.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    work: [
      {
        id: 'work-sample-1',
        date: todayKey,
        organization: 'Helios Cloud Infrastructure',
        project: 'Event Broker Engine v2',
        role: 'Principal Systems Architect',
        tasksPerformed: [
          'Profiled memory footprint in zero-copy socket buffer allocation during peak throughput.',
          'Re-architected partition balancing algorithm to prevent rebalance storm during node scaling.',
          'Conducted cross-team architectural sign-off with the storage and telemetry squads.',
        ],
        problemsIdentified: 'Partition rebalancing was triggering 12-second p99 latency spikes during pod restarts.',
        rootCauses: 'Eager partition assignment revoked all assignments simultaneously before acquiring new partitions.',
        approachTaken: 'Transitioned to incremental cooperative rebalancing with epoch-based lease validation.',
        solutionImplemented: 'Implemented deterministic two-phase hash ring partition assignment with gossip-propagated epochs.',
        technicalDecisions: 'Chose embedded RingBuffer over channel-based multiplexing to eliminate 35% garbage collection overhead.',
        technologiesUsed: ['Rust', 'Tokio', 'eBPF', 'Kafka Protocols', 'Grafana'],
        outcomeImpact: 'P99 tail latency dropped from 480ms to 42ms during cluster rolling restarts. Zero packet drops observed.',
        evidenceLinks: [
          { id: 'ev-1', label: 'GitHub PR #1429 - Epoch Lease Rebalancer', url: 'https://github.com/example/engine/pull/1429' },
          { id: 'ev-2', label: 'Architecture Decision Record ADR-088', url: 'https://docs.example.com/adr/088' }
        ],
        whatILearned: 'Cooperative rebalancing requires strict epoch monotonically increasing monotonic counters across nodes.',
        reflections: 'Clean mathematical modeling upfront saved days of chaotic race condition debugging.',
        notes: 'Follow up with SRE team tomorrow morning on staging canary metrics.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    fitness: [
      {
        id: 'fit-sample-1',
        date: todayKey,
        workoutType: 'Strength',
        muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
        exercises: [
          { id: 'ex-1', name: 'Barbell Bench Press', sets: 4, reps: 6, weightKg: 105 },
          { id: 'ex-2', name: 'Standing Overhead Press', sets: 3, reps: 8, weightKg: 62.5 },
          { id: 'ex-3', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weightKg: 36 },
          { id: 'ex-4', name: 'Dips (Weighted)', sets: 3, reps: 10, weightKg: 20 },
        ],
        cardio: {
          type: 'Zone 2 Echo Bike',
          durationMinutes: 15,
          distanceKm: 7.2,
          heartRateAvg: 132,
        },
        workoutDurationMinutes: 65,
        bodyweightKg: 81.4,
        personalRecords: ['Bench Press 105kg x 6 clean reps'],
        notes: 'Explosive concentric phase on bench felt effortless today. Left shoulder impingement completely gone.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    learning: [
      {
        id: 'learn-sample-1',
        date: todayKey,
        subject: 'Distributed Systems',
        technologyOrConcept: 'Raft Joint Consensus & Cluster Membership Changes',
        learningSource: 'Ongaro & Ousterhout PhD Dissertation (Stanford) & etcd source code',
        studyDurationMinutes: 75,
        problemsSolved: ['Analyzed safety preservation during configuration change transitions across disparate majorities.'],
        whatIUnderstood: 'Single-server membership changes are strictly safer and simpler than full joint consensus transitions.',
        whatToImprove: 'Need to write a simulated network partition test harness in Go to inspect election safety during split votes.',
        practicalImplementation: 'Sketched the state machine replication transition diagram for joint membership.',
        notes: 'Excellent clarity in Section 4.3 of the dissertation regarding log matching invariant.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    projects: [
      {
        id: 'proj-sample-1',
        date: todayKey,
        projectName: 'LIFE OS (Personal Growth Kernel)',
        objective: 'Construct a calendar-first, sovereign personal operating system preserving life history.',
        tasksCompleted: [
          'Engineered full-screen year selector with snap-to-center physics.',
          'Designed high-density responsive 12-month navigation grid.',
          'Structured strict local-first data persistence schema with migration support.',
        ],
        technicalImplementation: 'React + TypeScript + Tailwind CSS with pure CSS variable monochrome tokens and Framer Motion orchestration.',
        decisions: 'Enforced absolute monochrome Swiss aesthetic without colorful distraction tokens.',
        blockers: 'None.',
        progressPercentage: 45,
        nextSteps: 'Complete deep category analytics drilldowns and rapid keyboard shortcuts.',
        repositoryLinks: [
          { id: 'repo-1', label: 'Repository: life-os', url: 'https://github.com/example/life-os' }
        ],
        notes: 'The editorial typography gives the exact calm, contemplative feel needed for a life journal.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    personal: [
      {
        id: 'pers-sample-1',
        date: todayKey,
        title: 'Morning Mindfulness & Espresso Routine',
        type: 'experience',
        peopleInvolved: ['Self'],
        description: '30 minutes of undisturbed early sunlight, aeropress single-origin Ethiopian coffee, and mental framing of the quarter.',
        significance: 'Setting intentional tempo before opening any communication channels.',
        location: 'Home Study Terrace',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    health: {
      id: 'health-sample-1',
      date: todayKey,
      sleepHours: 7.9,
      sleepQuality: 'restful',
      waterIntakeLiters: 3.4,
      habits: [
        { id: 'h-1', name: 'No screens 60m before sleep', completed: true },
        { id: 'h-2', name: 'Cold shower / morning exposure', completed: true },
        { id: 'h-3', name: 'Daily journal reflection', completed: true },
        { id: 'h-4', name: 'Read minimum 30 minutes', completed: true },
      ],
      customMetrics: [
        { id: 'cm-1', name: 'Resting Heart Rate', value: 51, unit: 'bpm' },
        { id: 'cm-2', name: 'Deep Sleep Ratio', value: 24, unit: '%' }
      ],
      notes: 'High cognitive energy all morning.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    reflection: {
      id: 'refl-sample-1',
      date: todayKey,
      wentWell: 'Deep focus block on the distributed rebalancing algorithm with zero Slack distractions.',
      wentWrong: 'Delayed lunch by 90 minutes which caused slight fatigue mid-afternoon.',
      learned: 'Simplifying assumptions in protocol design almost always trumps complex state reconciliation.',
      shouldImprove: 'Enforce strict 1:00 PM nutrition window regardless of engineering flow.',
      prioritiesTomorrow: [
        'Deploy canary build for epoch rebalancer on staging cluster.',
        'Deadlift heavy volume session (5x3).',
        'Review Raft leader transfer protocol.',
      ],
      freeformNotes: 'Quiet discipline compounds imperceptibly every single day. The calendar reflects reality.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  };

  // Sample 2: 2 days ago
  const twoDaysAgo = Math.max(1, currentDay - 2);
  const twoDaysAgoKey = formatDateKey(currentYear, currentMonth, twoDaysAgo);
  records[twoDaysAgoKey] = {
    id: twoDaysAgoKey,
    date: twoDaysAgoKey,
    isSampleData: true,
    summary: 'Full stack optimization, lower body deadlift session, and distributed tracing implementation.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    work: [
      {
        id: 'work-sample-2',
        date: twoDaysAgoKey,
        organization: 'Helios Cloud Infrastructure',
        project: 'Telemetry Subsystem',
        role: 'Principal Systems Architect',
        tasksPerformed: [
          'Integrated OpenTelemetry W3C trace context propagation across gRPC boundary.',
          'Synthesized distributed spans for multi-tenant queue dispatch.',
        ],
        problemsIdentified: 'Context leakage between pooled coroutines causing corrupted trace graphs.',
        rootCauses: 'Thread-local storage was not being reset on worker pool yield.',
        approachTaken: 'Explicit span token passing replacing implicit thread locals.',
        solutionImplemented: 'Built RAII trace scope guard ensuring clean detachment on return.',
        technologiesUsed: ['Go', 'gRPC', 'OpenTelemetry', 'Jaeger'],
        outcomeImpact: 'Tracing overhead dropped to under 1.5% CPU; 100% trace correlation accuracy.',
        evidenceLinks: [
          { id: 'ev-3', label: 'PR #1418 - RAII Trace Guard', url: 'https://github.com/example/engine/pull/1418' }
        ],
        whatILearned: 'Never rely on ambient thread context in asynchronous coroutine environments.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    fitness: [
      {
        id: 'fit-sample-2',
        date: twoDaysAgoKey,
        workoutType: 'Strength',
        muscleGroups: ['Legs', 'Posterior Chain', 'Core'],
        exercises: [
          { id: 'ex-201', name: 'Conventional Deadlift', sets: 4, reps: 4, weightKg: 175 },
          { id: 'ex-202', name: 'Bulgarian Split Squats', sets: 3, reps: 8, weightKg: 28 },
          { id: 'ex-203', name: 'Romanian Deadlifts', sets: 3, reps: 8, weightKg: 110 },
          { id: 'ex-204', name: 'Hanging Leg Raises', sets: 3, reps: 15 },
        ],
        workoutDurationMinutes: 70,
        bodyweightKg: 81.2,
        notes: 'Felt powerful off the floor. Maintained neutral spine on all sets.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    learning: [
      {
        id: 'learn-sample-2',
        date: twoDaysAgoKey,
        subject: 'Database Internals',
        technologyOrConcept: 'LSM Tree Compaction Algorithms (Leveled vs Size-Tiered)',
        learningSource: 'Designing Data-Intensive Applications (Kleppmann) Chapter 3',
        studyDurationMinutes: 60,
        problemsSolved: ['Compared write amplification vs read amplification in RocksDB workloads.'],
        whatIUnderstood: 'Leveled compaction bounds worst-case read latency at the cost of higher background write amplification.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    projects: [
      {
        id: 'proj-sample-2',
        date: twoDaysAgoKey,
        projectName: 'LIFE OS',
        objective: 'Draft core navigation architecture and screen state machines.',
        tasksCompleted: ['Implemented year-month-calendar route coordination.'],
        progressPercentage: 25,
        repositoryLinks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    personal: [
      {
        id: 'pers-sample-2',
        date: twoDaysAgoKey,
        title: 'Weekly Family Dinner',
        type: 'family',
        peopleInvolved: ['Parents', 'Sibling'],
        description: 'Deep conversation about upcoming family gathering and summer travel plans.',
        significance: 'Staying deeply grounded outside the professional sphere.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    health: {
      id: 'health-sample-2',
      date: twoDaysAgoKey,
      sleepHours: 8.1,
      sleepQuality: 'restful',
      waterIntakeLiters: 3.0,
      habits: [
        { id: 'h-1', name: 'No screens 60m before sleep', completed: true },
        { id: 'h-2', name: 'Cold shower / morning exposure', completed: true },
        { id: 'h-3', name: 'Daily journal reflection', completed: true },
        { id: 'h-4', name: 'Read minimum 30 minutes', completed: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    reflection: {
      id: 'refl-sample-2',
      date: twoDaysAgoKey,
      wentWell: 'High output, disciplined pacing in the gym, meaningful family connection.',
      wentWrong: 'Spent 20 minutes reading unproductive tech news.',
      learned: 'Information diet directly dictates the quality of thought.',
      shouldImprove: 'Cut casual feed browsing entirely during work hours.',
      prioritiesTomorrow: ['Focus on Helios pipeline edge cases.'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  };

  // Sample 3: 5 days ago
  const fiveDaysAgo = Math.max(1, currentDay - 5);
  const fiveDaysAgoKey = formatDateKey(currentYear, currentMonth, fiveDaysAgo);
  records[fiveDaysAgoKey] = {
    id: fiveDaysAgoKey,
    date: fiveDaysAgoKey,
    isSampleData: true,
    summary: 'Endurance session, machine learning paper reading, and open source contribution.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    work: [],
    fitness: [
      {
        id: 'fit-sample-3',
        date: fiveDaysAgoKey,
        workoutType: 'Cardio',
        muscleGroups: ['Cardiovascular', 'Legs'],
        exercises: [],
        cardio: {
          type: 'Zone 2 Outdoor Trail Run',
          durationMinutes: 52,
          distanceKm: 10.4,
          heartRateAvg: 138,
        },
        workoutDurationMinutes: 52,
        notes: 'Paced comfortably at 5:00/km. Breathing remained nasal throughout.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    learning: [
      {
        id: 'learn-sample-3',
        date: fiveDaysAgoKey,
        subject: 'AI Architecture',
        technologyOrConcept: 'KV Cache Compression & Speculative Decoding',
        learningSource: 'ArXiv paper: Medusa / Eagle speculative heads',
        studyDurationMinutes: 90,
        problemsSolved: ['Understood tree-based verification mechanism for draft tokens.'],
        whatIUnderstood: 'Speculative decoding achieves 2-3x speedup with zero degradation in output distribution.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    projects: [
      {
        id: 'proj-sample-3',
        date: fiveDaysAgoKey,
        projectName: 'Open Source Rust Library',
        objective: 'Add asynchronous file streaming iterator.',
        tasksCompleted: ['Wrote streaming unit tests with mock I/O failure injection.'],
        progressPercentage: 100,
        repositoryLinks: [
          { id: 'repo-2', label: 'Merged PR #82', url: 'https://github.com/tokio-rs/tokio/pull/82' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    personal: [
      {
        id: 'pers-sample-3',
        date: fiveDaysAgoKey,
        title: 'Weekend Trail Exploration & Photography',
        type: 'experience',
        description: 'Captured high-contrast black and white architecture photography in the old city quarter.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    health: {
      id: 'health-sample-3',
      date: fiveDaysAgoKey,
      sleepHours: 7.5,
      sleepQuality: 'restful',
      waterIntakeLiters: 3.5,
      habits: [
        { id: 'h-1', name: 'No screens 60m before sleep', completed: true },
        { id: 'h-2', name: 'Cold shower / morning exposure', completed: false },
        { id: 'h-3', name: 'Daily journal reflection', completed: true },
        { id: 'h-4', name: 'Read minimum 30 minutes', completed: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    reflection: {
      id: 'refl-sample-3',
      date: fiveDaysAgoKey,
      wentWell: 'Outdoor run rejuvenated mental clarity after a high-pressure week.',
      learned: 'Physical movement in nature resets focus far more reliably than passive resting.',
      prioritiesTomorrow: ['Begin the new sprint with absolute momentum.'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  };

  return records;
}

