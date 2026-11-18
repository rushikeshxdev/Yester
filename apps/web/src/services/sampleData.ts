import { DailyRecord, LifePlan } from '../types';
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
        planId: 'plan-backend-eng',
        planContribution: 8,
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
        planId: 'plan-marathon',
        planContribution: 15,
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
        planId: 'plan-distributed-learning',
        planContribution: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    projects: [
      {
        id: 'proj-sample-1',
        date: todayKey,
        projectName: 'Yester — Living Chronicle',
        objective: 'A sovereign personal operating system and calendar-first living record preserving growth, achievements, and life history.',
        tasksCompleted: [
          'Engineered full-screen year selector with snap-to-center physics and ambient depth.',
          'Designed high-density responsive 12-month folio overview.',
          'Structured strict local-first data persistence schema with migration support.',
        ],
        technicalImplementation: 'React + TypeScript + Tailwind CSS with pure editorial typography and Framer Motion orchestration.',
        decisions: 'Enforced absolute monochrome Swiss & editorial aesthetic with Newsreader serif display typography.',
        blockers: 'None.',
        progressPercentage: 65,
        nextSteps: 'Complete deep category telemetry dossiers and rapid keyboard interactions.',
        repositoryLinks: [
          { id: 'repo-1', label: 'Repository: yester', url: 'https://github.com/example/yester' }
        ],
        notes: 'The editorial serif typography gives the exact contemplative feel needed for a life journal.',
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

  // Sample: Yesterday (for Yesterday's Intent & Habit Carry-over)
  const yesterdayObj = new Date(now);
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayKey = formatDateKey(
    yesterdayObj.getFullYear(),
    yesterdayObj.getMonth() + 1,
    yesterdayObj.getDate()
  );

  records[yesterdayKey] = {
    id: yesterdayKey,
    date: yesterdayKey,
    isSampleData: true,
    summary: 'Consensus engine performance benchmarks, interval track session, and distributed tracing setup.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    work: [
      {
        id: 'work-sample-yesterday',
        date: yesterdayKey,
        organization: 'Helios Cloud Infrastructure',
        project: 'Event Broker Engine v2',
        role: 'Principal Systems Architect',
        tasksPerformed: [
          'Engineered Raft heartbeat timer batching mechanism under heavy network jitter.',
          'Wrote integration tests for cooperative partition reassignment edge cases.',
        ],
        problemsIdentified: 'Network jitter causing spurious leader election timeouts.',
        solutionImplemented: 'Introduced randomized election timeouts with adaptive backoff window.',
        technologiesUsed: ['Rust', 'Tokio', 'eBPF'],
        outcomeImpact: 'Zero spurious re-elections during simulated 15% packet loss.',
        evidenceLinks: [],
        planId: 'plan-backend-eng',
        planContribution: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    fitness: [
      {
        id: 'fit-sample-yesterday',
        date: yesterdayKey,
        workoutType: 'Cardio',
        muscleGroups: ['Legs', 'Cardiovascular'],
        exercises: [],
        cardio: {
          type: 'Zone 2 Aerobic Run',
          durationMinutes: 48,
          distanceKm: 8.5,
          heartRateAvg: 136,
        },
        workoutDurationMinutes: 48,
        notes: 'Smooth, relaxed cadence. Breathing nasal.',
        planId: 'plan-marathon',
        planContribution: 9,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    learning: [
      {
        id: 'learn-sample-yesterday',
        date: yesterdayKey,
        subject: 'Distributed Systems',
        technologyOrConcept: 'Paxos Synod Invariants & Quorum Intersections',
        learningSource: 'Lamport "Paxos Made Simple"',
        studyDurationMinutes: 60,
        whatIUnderstood: 'Any two quorums must share at least one acceptor to guarantee monotonicity of proposal numbers.',
        planId: 'plan-distributed-learning',
        planContribution: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    projects: [],
    personal: [],
    health: {
      id: 'health-sample-yesterday',
      date: yesterdayKey,
      sleepHours: 7.8,
      sleepQuality: 'restful',
      waterIntakeLiters: 3.2,
      habits: [
        { id: 'h-y1', name: 'No screens 60m before sleep', completed: true },
        { id: 'h-y2', name: 'Cold shower / morning exposure', completed: true },
        { id: 'h-y3', name: 'Daily journal reflection', completed: true },
        { id: 'h-y4', name: 'Read minimum 30 minutes', completed: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    reflection: {
      id: 'refl-sample-yesterday',
      date: yesterdayKey,
      wentWell: 'Deep uninterrupted focus on consensus stability.',
      wentWrong: 'Skipped mobility stretches post-run.',
      learned: 'Distributed systems invariants are only as strong as the correctness of your failure domain assumptions.',
      prioritiesTomorrow: [
        'Deploy canary build for epoch rebalancer on staging cluster.',
        'Deadlift heavy volume session (5x3).',
        'Review Raft leader transfer protocol.',
      ],
      freeformNotes: 'The compound effect of deliberate daily effort is indisputable.',
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
        planId: 'plan-backend-eng',
        planContribution: 7,
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
        planId: 'plan-marathon',
        planContribution: 12,
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
        planId: 'plan-distributed-learning',
        planContribution: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    projects: [
      {
        id: 'proj-sample-2',
        date: twoDaysAgoKey,
        projectName: 'Yester',
        objective: 'Draft core navigation architecture and screen state machines.',
        tasksCompleted: ['Implemented year-month-calendar route coordination.'],
        progressPercentage: 35,
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
        planId: 'plan-marathon',
        planContribution: 10,
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
        planId: 'plan-distributed-learning',
        planContribution: 2,
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
        planId: 'plan-completed-rust',
        planContribution: 50,
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

export function generateSamplePlans(): Record<string, LifePlan> {
  const now = new Date();

  const subDays = (d: Date, days: number): string => {
    const res = new Date(d);
    res.setDate(res.getDate() - days);
    return res.toISOString().split('T')[0];
  };

  const addDays = (d: Date, days: number): string => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res.toISOString().split('T')[0];
  };

  const plan1: LifePlan = {
    id: 'plan-backend-eng',
    title: 'Distributed Systems Mastery',
    statement: 'Architect high-throughput event streaming systems and master distributed consensus protocols.',
    category: 'work',
    startDate: subDays(now, 30),
    targetDate: addDays(now, 60),
    unitLabel: 'Engineering Hours',
    targetValue: 120,
    pacingType: 'ramp_up',
    status: 'active',
    milestones: [
      {
        id: 'm-1',
        title: 'Foundations & Architecture ADRs',
        targetPercent: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'm-2',
        title: 'Zero-Copy RingBuffer & Protocol Core',
        targetPercent: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'm-3',
        title: 'Zero-drop Partition Rebalancing',
        targetPercent: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'm-4',
        title: 'Production Canary at Scale',
        targetPercent: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const plan2: LifePlan = {
    id: 'plan-marathon',
    title: 'Sub-4:00 Marathon Conditioning',
    statement: 'Build aerobic capacity, weekly progressive volume, and clean metabolic recovery.',
    category: 'fitness',
    startDate: subDays(now, 45),
    targetDate: addDays(now, 75),
    unitLabel: 'Running Km',
    targetValue: 500,
    pacingType: 'linear',
    status: 'active',
    milestones: [
      {
        id: 'mf-1',
        title: 'Aerobic Base Established (125km)',
        targetPercent: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mf-2',
        title: 'Half-Marathon Benchmark Under 1:52',
        targetPercent: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mf-3',
        title: '32km Long Run Peak Volume',
        targetPercent: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mf-4',
        title: 'Race Taper & 42.2km Goal Reached',
        targetPercent: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const plan3: LifePlan = {
    id: 'plan-distributed-learning',
    title: 'Core Systems RFCs & Papers',
    statement: 'Rigorous dissection of consensus algorithms, storage engines, and replication models.',
    category: 'learning',
    startDate: subDays(now, 20),
    targetDate: addDays(now, 40),
    unitLabel: 'Papers & RFCs',
    targetValue: 40,
    pacingType: 'front_loaded',
    status: 'active',
    milestones: [
      {
        id: 'ml-1',
        title: 'Raft & Paxos Formal Invariants',
        targetPercent: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ml-2',
        title: 'LSM Trees & RocksDB Architecture',
        targetPercent: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ml-3',
        title: 'Vector Clocks, CRDTs & Dynamo',
        targetPercent: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ml-4',
        title: 'Distributed Systems Synthesis Report',
        targetPercent: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const plan4: LifePlan = {
    id: 'plan-completed-rust',
    title: 'Rust TCP/IP Stack & Async Runtime',
    statement: 'Implement an asynchronous TCP network stack from RFC specifications to zero-copy benchmarks.',
    category: 'project',
    startDate: subDays(now, 90),
    targetDate: subDays(now, 10),
    unitLabel: 'Modules & Commits',
    targetValue: 50,
    pacingType: 'linear',
    status: 'completed',
    milestones: [
      {
        id: 'mr-1',
        title: 'Ethernet & ARP Frame Parser',
        targetPercent: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mr-2',
        title: 'IPv4 Fragmentation & Reassembly',
        targetPercent: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mr-3',
        title: 'TCP State Machine & Sliding Window',
        targetPercent: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mr-4',
        title: 'Tokio Async Driver & 100k Concurrency',
        targetPercent: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const plan5: LifePlan = {
    id: 'plan-archived-french',
    title: 'French B2 CEFR Fluency',
    statement: 'Achieve conversational fluency and professional technical correspondence in French.',
    category: 'personal',
    startDate: subDays(now, 180),
    targetDate: subDays(now, 30),
    unitLabel: 'Study Hours',
    targetValue: 120,
    pacingType: 'linear',
    status: 'archived',
    milestones: [
      {
        id: 'mp-1',
        title: 'A2 Grammar & Vocabulary Mastery',
        targetPercent: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mp-2',
        title: 'B1 Conversational Fluency',
        targetPercent: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    [plan1.id]: plan1,
    [plan2.id]: plan2,
    [plan3.id]: plan3,
    [plan4.id]: plan4,
    [plan5.id]: plan5,
  };
}

