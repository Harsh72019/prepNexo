import { AttemptKind, AttemptStatus, PrismaClient, RoadmapPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const skills = [
  ["dsa.arrays", "Arrays", "DSA"],
  ["dsa.sliding_window", "Sliding Window", "DSA"],
  ["dsa.two_pointers", "Two Pointers", "DSA"],
  ["dsa.trees", "Trees", "DSA"],
  ["dsa.graphs", "Graphs", "DSA"],
  ["dsa.dynamic_programming", "Dynamic Programming", "DSA"],
  ["dsa.greedy", "Greedy", "DSA"],
  ["dsa.binary_search", "Binary Search", "DSA"],
  ["dsa.backtracking", "Backtracking", "DSA"],
  ["dsa.tries", "Tries", "DSA"],
  ["dsa.heaps", "Heaps", "DSA"],
  ["dsa.segment_trees", "Segment Trees", "DSA"],
  ["dsa.union_find", "Union Find", "DSA"],
  ["system.scalability", "Scalability", "SYSTEM_DESIGN"],
  ["system.caching", "Caching", "SYSTEM_DESIGN"],
  ["system.database_design", "Database Design", "SYSTEM_DESIGN"],
  ["system.api_design", "API Design", "SYSTEM_DESIGN"],
  ["system.messaging", "Messaging Systems", "SYSTEM_DESIGN"],
  ["system.kafka", "Kafka", "SYSTEM_DESIGN"],
  ["system.redis", "Redis", "SYSTEM_DESIGN"],
  ["system.load_balancing", "Load Balancing", "SYSTEM_DESIGN"],
  ["system.cap_theorem", "CAP Theorem", "SYSTEM_DESIGN"],
  ["system.fault_tolerance", "Fault Tolerance", "SYSTEM_DESIGN"],
  ["system.rate_limiting", "Rate Limiting", "SYSTEM_DESIGN"],
  ["system.distributed_systems", "Distributed Systems", "SYSTEM_DESIGN"],
  ["soft.communication_clarity", "Communication clarity", "SOFT_SKILL"],
  ["soft.interview_confidence", "Interview confidence", "SOFT_SKILL"],
  ["soft.explanation_quality", "Explanation quality", "SOFT_SKILL"],
  ["soft.time_management", "Time management", "SOFT_SKILL"],
  ["soft.problem_breakdown", "Problem breakdown ability", "SOFT_SKILL"]
] as const;

async function main() {
  const passwordHash = await bcrypt.hash("PrepNexo@123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@prepnexo.dev" },
    update: {
      profile: {
        upsert: {
          create: {
            headline: "Backend interview sprint",
            targetRole: "Senior Full-Stack Engineer",
            readinessScore: 68,
            currentStreak: 9,
            bestStreak: 16,
            onboardingCompleted: true,
            targetCompanies: ["Google", "Uber"],
            experienceLevel: "Working professional",
            preferredRole: "Full Stack",
            confidenceLevel: 62,
            strongestTopics: ["Arrays", "Graphs"],
            weakestTopics: ["Dynamic Programming", "System Design", "Communication"],
            dailyPrepTime: "1 hour",
            learningStyle: "Interview simulation",
            targetTimeline: "3 months",
            onboardingSummary: "Targeting Google and Uber Full Stack interviews. Initial focus: Dynamic Programming, System Design, and Communication."
          },
          update: {
            readinessScore: 68,
            currentStreak: 9,
            bestStreak: 16,
            onboardingCompleted: true,
            targetCompanies: ["Google", "Uber"],
            experienceLevel: "Working professional",
            preferredRole: "Full Stack",
            confidenceLevel: 62,
            strongestTopics: ["Arrays", "Graphs"],
            weakestTopics: ["Dynamic Programming", "System Design", "Communication"],
            dailyPrepTime: "1 hour",
            learningStyle: "Interview simulation",
            targetTimeline: "3 months",
            onboardingSummary: "Targeting Google and Uber Full Stack interviews. Initial focus: Dynamic Programming, System Design, and Communication."
          }
        }
      }
    },
    create: {
      email: "demo@prepnexo.dev",
      name: "Demo Candidate",
      passwordHash,
      emailVerified: true,
      profile: {
        create: {
          headline: "Backend interview sprint",
          targetRole: "Senior Full-Stack Engineer",
          readinessScore: 68,
          currentStreak: 9,
          bestStreak: 16,
          onboardingCompleted: true,
          targetCompanies: ["Google", "Uber"],
          experienceLevel: "Working professional",
          preferredRole: "Full Stack",
          confidenceLevel: 62,
          strongestTopics: ["Arrays", "Graphs"],
          weakestTopics: ["Dynamic Programming", "System Design", "Communication"],
          dailyPrepTime: "1 hour",
          learningStyle: "Interview simulation",
          targetTimeline: "3 months",
          onboardingSummary: "Targeting Google and Uber Full Stack interviews. Initial focus: Dynamic Programming, System Design, and Communication."
        }
      }
    }
  });

  await prisma.interviewAttempt.deleteMany({ where: { userId: user.id } });
  await prisma.pressureEvent.deleteMany({ where: { userId: user.id } });
  await prisma.growthEvent.deleteMany({ where: { userId: user.id } });
  await prisma.coachMemory.deleteMany({ where: { userId: user.id } });
  await prisma.adaptiveSession.deleteMany({ where: { userId: user.id } });
  await prisma.userRating.deleteMany({ where: { userId: user.id } });
  await prisma.skillNode.deleteMany({ where: { userId: user.id } });
  await prisma.topicProgress.deleteMany({ where: { userId: user.id } });
  await prisma.dailyActivity.deleteMany({ where: { userId: user.id } });
  await prisma.roadmapItem.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);

  await prisma.interviewAttempt.createMany({
    data: [
      {
        userId: user.id,
        kind: AttemptKind.LIVE_CODING,
        title: "Graph BFS live round",
        topic: "Graphs",
        score: 74,
        durationMinutes: 52,
        status: AttemptStatus.PASSED,
        feedbackSummary: "Good traversal structure; tighten edge-case narration.",
        completedAt: daysAgo(1)
      },
      {
        userId: user.id,
        kind: AttemptKind.SYSTEM_DESIGN,
        title: "Design a notification platform",
        topic: "System Design",
        score: 61,
        durationMinutes: 48,
        status: AttemptStatus.NEEDS_REVIEW,
        feedbackSummary: "Add clearer partition strategy and retry semantics.",
        completedAt: daysAgo(2)
      },
      {
        userId: user.id,
        kind: AttemptKind.DSA_CONTEST,
        title: "Dynamic programming sprint",
        topic: "Dynamic Programming",
        score: 58,
        durationMinutes: 40,
        status: AttemptStatus.NEEDS_REVIEW,
        feedbackSummary: "State transition was correct but slow to derive.",
        completedAt: daysAgo(4)
      },
      {
        userId: user.id,
        kind: AttemptKind.LIVE_CODING,
        title: "Intervals pairing interview",
        topic: "Intervals",
        score: 82,
        durationMinutes: 45,
        status: AttemptStatus.PASSED,
        feedbackSummary: "Strong communication and clean implementation.",
        completedAt: daysAgo(6)
      },
      {
        userId: user.id,
        kind: AttemptKind.BEHAVIORAL,
        title: "Leadership stories pass",
        topic: "Behavioral",
        score: 77,
        durationMinutes: 30,
        status: AttemptStatus.PASSED,
        feedbackSummary: "Sharper metrics would make the stories land harder.",
        completedAt: daysAgo(7)
      },
      {
        userId: user.id,
        kind: AttemptKind.DSA_CONTEST,
        title: "Trees and heaps contest",
        topic: "Trees",
        score: 69,
        durationMinutes: 55,
        status: AttemptStatus.PASSED,
        feedbackSummary: "Heap tradeoffs were clear; tree recursion can be faster.",
        completedAt: daysAgo(10)
      }
    ]
  });

  await prisma.topicProgress.createMany({
    data: [
      { userId: user.id, topic: "Graphs", proficiency: 74, attempts: 11, targetScore: 85, lastPracticedAt: daysAgo(1) },
      { userId: user.id, topic: "Dynamic Programming", proficiency: 58, attempts: 8, targetScore: 82, lastPracticedAt: daysAgo(4) },
      { userId: user.id, topic: "System Design", proficiency: 61, attempts: 5, targetScore: 80, lastPracticedAt: daysAgo(2) },
      { userId: user.id, topic: "Intervals", proficiency: 82, attempts: 7, targetScore: 85, lastPracticedAt: daysAgo(6) },
      { userId: user.id, topic: "Trees", proficiency: 69, attempts: 9, targetScore: 84, lastPracticedAt: daysAgo(10) },
      { userId: user.id, topic: "Behavioral", proficiency: 77, attempts: 4, targetScore: 86, lastPracticedAt: daysAgo(7) }
    ]
  });

  await prisma.dailyActivity.createMany({
    data: Array.from({ length: 21 }, (_, index) => {
      const sessions = [1, 2, 1, 0, 3, 1, 2][index % 7] ?? 1;
      return {
        userId: user.id,
        date: daysAgo(20 - index),
        sessions,
        minutes: sessions * (24 + ((index * 7) % 19)),
        problemsSolved: sessions === 0 ? 0 : sessions + (index % 3)
      };
    })
  });

  await prisma.roadmapItem.createMany({
    data: [
      {
        userId: user.id,
        title: "Drill DP state transitions",
        description: "Complete three medium DP prompts and write the recurrence before coding.",
        topic: "Dynamic Programming",
        priority: RoadmapPriority.HIGH,
        dueDate: daysAgo(-2)
      },
      {
        userId: user.id,
        title: "Redo notification system design",
        description: "Focus on queue partitioning, retry windows, and observability.",
        topic: "System Design",
        priority: RoadmapPriority.HIGH,
        dueDate: daysAgo(-4)
      },
      {
        userId: user.id,
        title: "Tighten graph edge-case narration",
        description: "Practice explaining visited-state, disconnected components, and input bounds.",
        topic: "Graphs",
        priority: RoadmapPriority.MEDIUM,
        dueDate: daysAgo(-6)
      },
      {
        userId: user.id,
        title: "Quantify behavioral impact",
        description: "Attach metrics and before/after outcomes to two leadership stories.",
        topic: "Behavioral",
        priority: RoadmapPriority.LOW,
        dueDate: daysAgo(-8)
      }
    ]
  });

  await prisma.skillNode.createMany({
    data: skills.map(([key, label, domain], index) => {
      const base =
        key === "dsa.dynamic_programming" ? 54 :
        key === "system.database_design" ? 58 :
        key === "system.fault_tolerance" ? 52 :
        key === "soft.explanation_quality" ? 62 :
        key === "dsa.graphs" ? 74 :
        key === "dsa.arrays" ? 78 :
        48 + ((index * 7) % 22);
      return {
        userId: user.id,
        key,
        label,
        domain,
        score: base,
        confidence: Math.max(35, base - 7),
        volatility: base < 60 ? 68 : 42,
        exposure: 2 + (index % 6),
        mastery: Math.round(base * 0.7 + Math.max(35, base - 7) * 0.3),
        trend: index % 4 === 0 ? -4 : 5,
        weakRecurrence: base < 60 ? 2 + (index % 3) : 0,
        lastPracticedAt: daysAgo(index % 12),
        nextReviewAt: daysAgo(base < 60 ? -1 : -7),
        evidence: { seeded: true, signal: base < 60 ? "recurring weak pattern" : "stable progress" }
      };
    })
  });

  await prisma.userRating.create({
    data: {
      userId: user.id,
      rating: 1184,
      league: "Silver",
      rankTitle: "Growing Engineer",
      seasonPoints: 320,
      pressureScore: 61,
      communicationScore: 67,
      systemThinkingScore: 59
    }
  });

  await prisma.coachMemory.createMany({
    data: [
      {
        userId: user.id,
        key: "weak.dsa.dynamic_programming",
        summary: "Dynamic Programming optimization is the biggest recurring limiter. Derive state and transition out loud before coding.",
        priority: 86,
        evidence: { attempts: 8, latestScore: 58 }
      },
      {
        userId: user.id,
        key: "weak.system.fault_tolerance",
        summary: "System design answers need sharper failure-mode handling and recovery strategies.",
        priority: 78,
        evidence: { attempts: 5, latestScore: 61 }
      },
      {
        userId: user.id,
        key: "strength.dsa.graphs",
        summary: "Graph traversal is improving; increase difficulty with disconnected components and weighted variants.",
        priority: 42,
        evidence: { latestScore: 74 }
      }
    ]
  });

  await prisma.growthEvent.createMany({
    data: [
      {
        userId: user.id,
        type: "WEAK_PATTERN_DETECTED",
        source: "DSA_CONTEST",
        skillKey: "dsa.dynamic_programming",
        value: -8,
        metadata: { reason: "slow optimization", score: 58 },
        createdAt: daysAgo(4)
      },
      {
        userId: user.id,
        type: "SKILL_SIGNAL_IMPROVED",
        source: "LIVE_CODING",
        skillKey: "dsa.graphs",
        value: 12,
        metadata: { reason: "clean traversal and edge-case handling", score: 74 },
        createdAt: daysAgo(1)
      },
      {
        userId: user.id,
        type: "WEAK_PATTERN_DETECTED",
        source: "SYSTEM_DESIGN",
        skillKey: "system.fault_tolerance",
        value: -6,
        metadata: { reason: "retry and degradation plan missing", score: 61 },
        createdAt: daysAgo(2)
      }
    ]
  });

  await prisma.adaptiveSession.create({
    data: {
      userId: user.id,
      title: "Today’s adaptive growth block",
      difficulty: "MEDIUM",
      pressureLevel: 67,
      estimatedMinutes: 55,
      focusSkills: ["dsa.dynamic_programming", "system.fault_tolerance", "soft.explanation_quality", "soft.time_management"],
      rationale: "Built from recurring DP optimization misses and system design failure-mode gaps.",
      tasks: {
        create: [
          {
            kind: "DRILL",
            title: "DP transition repair",
            skillKey: "dsa.dynamic_programming",
            difficulty: "MEDIUM",
            prompt: "Write state, transition, base cases, and memory optimization before coding.",
            order: 1
          },
          {
            kind: "INTERVIEW",
            title: "Timed live coding simulation",
            skillKey: "soft.time_management",
            difficulty: "MEDIUM",
            prompt: "Solve under a 30-minute timer with one interruption and one hidden edge case.",
            order: 2
          },
          {
            kind: "SYSTEM_DESIGN",
            title: "Failure injection design pass",
            skillKey: "system.fault_tolerance",
            difficulty: "SENIOR",
            prompt: "Design graceful degradation for Redis failure, DB bottleneck, and regional traffic spike.",
            order: 3
          },
          {
            kind: "COMMUNICATION",
            title: "Two-minute explanation rep",
            skillKey: "soft.explanation_quality",
            difficulty: "MEDIUM",
            prompt: "Explain the tradeoff, complexity, and edge cases before writing final code.",
            order: 4
          }
        ]
      }
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
