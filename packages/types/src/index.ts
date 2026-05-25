export type Role = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  imageUrl?: string | null;
  role: Role;
  emailVerified: boolean;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type ApiErrorPayload = {
  message: string;
  code?: string;
  issues?: Record<string, string[]>;
};

export type ApiResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type BillingPlanDto = {
  id: string;
  code: string;
  name: string;
  description: string;
  amountPaise: number;
  currency: string;
  intervalDays: number;
  features: string[];
  active: boolean;
};

export type BillingStatusDto = {
  planCode: "FREE" | "PRO" | "PRO_YEARLY";
  active: boolean;
  expiresAt: string | null;
  dailyLimits: {
    aiInterviews: number | "UNLIMITED";
    rankedArenas: number | "UNLIMITED";
  };
  dailyUsage: {
    aiInterviews: number;
    rankedArenas: number;
  };
};

export type RazorpayCheckoutOrder = {
  keyId: string;
  orderId: string;
  amountPaise: number;
  currency: string;
  planCode: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
  };
};

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "success" | "warning" | "info" | "neutral";
};

export type DashboardActivity = {
  id: string;
  title: string;
  topic: string;
  kind: "LIVE_CODING" | "DSA_CONTEST" | "SYSTEM_DESIGN" | "BEHAVIORAL";
  score: number;
  status: "PASSED" | "NEEDS_REVIEW" | "FAILED";
  feedbackSummary?: string | null;
  completedAt: string;
};

export type DashboardTopic = {
  topic: string;
  proficiency: number;
  attempts: number;
  targetScore: number;
  gap: number;
};

export type DashboardHeatmapDay = {
  date: string;
  sessions: number;
  minutes: number;
  problemsSolved: number;
};

export type DashboardRoadmapItem = {
  id: string;
  title: string;
  description: string;
  topic: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
  completedAt?: string | null;
};

export type DashboardSummary = {
  profile: {
    readinessScore: number;
    currentStreak: number;
    bestStreak: number;
    targetRole?: string | null;
    headline?: string | null;
    onboardingCompleted?: boolean;
    onboardingSummary?: string | null;
    targetCompanies?: string[];
    weakestTopics?: string[];
    learningStyle?: string | null;
    targetTimeline?: string | null;
  };
  metrics: DashboardMetric[];
  recentActivity: DashboardActivity[];
  topics: DashboardTopic[];
  heatmap: DashboardHeatmapDay[];
  roadmap: DashboardRoadmapItem[];
  readinessTrend: Array<{
    label: string;
    score: number;
  }>;
};

export type PracticeTestCase = {
  input: number[];
  expected: number;
};

export type QuestionType =
  | "DSA"
  | "FRONTEND"
  | "BACKEND"
  | "SYSTEM_DESIGN"
  | "BEHAVIORAL";

export type CompanyTag =
  | "STARTUP"
  | "BIG_TECH"
  | "PRODUCT_BASED"
  | "MNC"
  | "SERVICE_BASED";

export type PracticeProblem = {
  id: string;
  slug?: string;
  type?: QuestionType;
  title: string;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  company?: string | null;
  companyTags?: CompanyTag[];
  prompt: string;
  acceptanceText?: string | null;
  starterCode: string;
  testCases: PracticeTestCase[];
  examples?: unknown[];
  skillKeys?: string[];
  attemptedCount?: number;
  solvedCount?: number;
  lastAttemptAt?: string | null;
  lastSolvedAt?: string | null;
  lastStatus?: "PASSED" | "NEEDS_REVIEW" | "FAILED" | null;
  nextReviewAt?: string | null;
  recommendedReason?: string;
};

export type DesignScenario = {
  id: string;
  title: string;
  difficulty: "MID" | "SENIOR" | "STAFF";
  prompt: string;
  requirements: string[];
  constraints: string[];
};

export type PracticeCatalog = {
  topics: DashboardTopic[];
  codingProblems: PracticeProblem[];
  dsaProblems: PracticeProblem[];
  designScenarios: DesignScenario[];
};

export type QuestionLibraryFilters = {
  types: QuestionType[];
  difficulties: Array<PracticeProblem["difficulty"]>;
  topics: string[];
  companies: string[];
  companyTags: CompanyTag[];
};

export type QuestionLibraryResult = {
  questions: PracticeProblem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  filters: QuestionLibraryFilters;
};

export type SubmitAttemptInput = {
  kind: DashboardActivity["kind"];
  questionId?: string;
  title: string;
  topic: string;
  score: number;
  durationMinutes: number;
  status: DashboardActivity["status"];
  feedbackSummary?: string;
  problemsSolved?: number;
  skillKeys?: string[];
  timeToFirstApproachSec?: number;
  hintCount?: number;
  retryCount?: number;
  confidence?: number;
  communicationScore?: number;
  pressureScore?: number;
};

export type SkillDomain = "DSA" | "SYSTEM_DESIGN" | "SOFT_SKILL";

export type SkillNodeDto = {
  key: string;
  label: string;
  domain: SkillDomain;
  score: number;
  confidence: number;
  volatility: number;
  exposure: number;
  mastery: number;
  trend: number;
  weakRecurrence: number;
  lastPracticedAt?: string | null;
  nextReviewAt?: string | null;
};

export type GrowthEventDto = {
  id: string;
  type: string;
  source: string;
  skillKey?: string | null;
  value: number;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type CoachMemoryDto = {
  key: string;
  summary: string;
  priority: number;
  evidence?: Record<string, unknown> | null;
  updatedAt: string;
};

export type UserRatingDto = {
  rating: number;
  league: string;
  rankTitle: string;
  seasonPoints: number;
  battlesPlayed?: number;
  battlesWon?: number;
  pressureScore: number;
  communicationScore: number;
  systemThinkingScore: number;
};

export type AdaptiveTaskDto = {
  id: string;
  kind: "DRILL" | "INTERVIEW" | "REVISION" | "COMMUNICATION" | "SYSTEM_DESIGN";
  title: string;
  skillKey: string;
  difficulty: string;
  prompt: string;
  status: "TODO" | "DONE" | "SKIPPED";
  order: number;
  metadata?: Record<string, unknown> | null;
};

export type AdaptiveSessionDto = {
  id: string;
  title: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
  difficulty: string;
  focusSkills: string[];
  pressureLevel: number;
  estimatedMinutes: number;
  rationale: string;
  tasks: AdaptiveTaskDto[];
  createdAt: string;
  completedAt?: string | null;
};

export type WeakPatternDto = {
  skillKey: string;
  label: string;
  domain: SkillDomain;
  score: number;
  recurrence: number;
  recommendation: string;
};

export type GrowthProfile = {
  readinessScore: number;
  weeklyGrowth: number;
  strengths: SkillNodeDto[];
  weakPatterns: WeakPatternDto[];
  skillGraph: SkillNodeDto[];
  rating: UserRatingDto;
  coachMemories: CoachMemoryDto[];
  recentEvents: GrowthEventDto[];
  nextSession: AdaptiveSessionDto;
};

export type PressurePrompt = {
  id: string;
  type:
    | "INTERRUPTION"
    | "EDGE_CASE"
    | "REQUIREMENT_CHANGE"
    | "FAILURE_INJECTION"
    | "COMPLEXITY_CHALLENGE";
  prompt: string;
  severity: number;
  createdAt: string;
};

export type OnboardingInput = {
  targetCompanies: string[];
  experienceLevel:
    | "Beginner"
    | "Intermediate"
    | "Advanced"
    | "Working professional";
  preferredRole:
    | "Backend"
    | "Frontend"
    | "Full Stack"
    | "SDE-1"
    | "SDE-2"
    | "System Design focused";
  confidenceLevel: number;
  strongestTopics: string[];
  weakestTopics: string[];
  dailyPrepTime: "30 mins" | "1 hour" | "2+ hours";
  learningStyle:
    | "Competitive"
    | "Guided"
    | "Interview simulation"
    | "Concept-first"
    | "Fast-paced";
  targetTimeline: "1 month" | "3 months" | "6 months";
  diagnostic?: {
    codingScore?: number;
    communicationScore?: number;
    systemDesignScore?: number;
    notes?: string;
  };
};

export type OnboardingStatus = {
  completed: boolean;
  profile?: {
    targetCompanies: string[];
    experienceLevel?: string | null;
    preferredRole?: string | null;
    confidenceLevel?: number | null;
    strongestTopics: string[];
    weakestTopics: string[];
    dailyPrepTime?: string | null;
    learningStyle?: string | null;
    targetTimeline?: string | null;
    onboardingSummary?: string | null;
  };
};

export type ArenaLeaderboardEntry = {
  userId: string;
  name: string;
  rating: number;
  ratingBand: string;
  battlesPlayed: number;
  battlesWon: number;
  winRate: number;
  score?: number;
  solved?: number;
  penalty?: number;
  rank?: number | null;
};

export type DailyArena = {
  date: string;
  mode: "ranked" | "practice";
  ratingBand: string;
  roomId: string;
  usedRankedToday: boolean;
  entries: ArenaLeaderboardEntry[];
};

export type OverallLeaderboard = {
  ratingBand: string;
  entries: ArenaLeaderboardEntry[];
};

export type RealtimeUser = {
  id: string;
  name: string;
  role?: "candidate" | "interviewer" | "observer";
};

export type CodingRoomState = {
  roomId: string;
  language: "typescript" | "javascript" | "python" | "java" | "cpp";
  code: string;
  participants: RealtimeUser[];
  updatedAt: string;
};

export type ConsoleEntry = {
  id: string;
  level: "info" | "success" | "error";
  message: string;
  createdAt: string;
};

export type LeaderboardEntry = {
  userId: string;
  name: string;
  score: number;
  solved: number;
  penalty: number;
};

export type SystemDesignBlock = {
  id: string;
  type:
    | "client"
    | "gateway"
    | "service"
    | "database"
    | "cache"
    | "queue"
    | "storage";
  label: string;
  x: number;
  y: number;
};

export type SystemDesignConnection = {
  id: string;
  from: string;
  to: string;
  label?: string;
};

export type SystemDesignCanvasState = {
  roomId: string;
  blocks: SystemDesignBlock[];
  connections: SystemDesignConnection[];
  updatedAt: string;
};

export type ServerToClientEvents = {
  "room:state": (state: CodingRoomState) => void;
  "room:presence": (participants: RealtimeUser[]) => void;
  "coding:patch": (payload: {
    roomId: string;
    code: string;
    user: RealtimeUser;
    updatedAt: string;
  }) => void;
  "console:event": (entry: ConsoleEntry) => void;
  "leaderboard:update": (payload: {
    contestId: string;
    entries: LeaderboardEntry[];
  }) => void;
  "system-design:state": (state: SystemDesignCanvasState) => void;
  "system-design:block-updated": (payload: {
    roomId: string;
    block: SystemDesignBlock;
    user: RealtimeUser;
    updatedAt: string;
  }) => void;
  "system-design:connection-updated": (payload: {
    roomId: string;
    connection: SystemDesignConnection;
    user: RealtimeUser;
    updatedAt: string;
  }) => void;
  "system-design:connections-cleared": (payload: {
    roomId: string;
    user: RealtimeUser;
    updatedAt: string;
  }) => void;
  "system-design:block-deleted": (payload: {
    roomId: string;
    blockId: string;
    user: RealtimeUser;
    updatedAt: string;
  }) => void;
  "system-design:canvas-reset": (payload: {
    roomId: string;
    state: SystemDesignCanvasState;
    user: RealtimeUser;
  }) => void;
  "error:event": (payload: { message: string; code?: string }) => void;
};

export type ClientToServerEvents = {
  "room:join": (payload: { roomId: string; user: RealtimeUser }) => void;
  "room:leave": (payload: { roomId: string }) => void;
  "coding:patch": (payload: {
    roomId: string;
    code: string;
    language: CodingRoomState["language"];
    user: RealtimeUser;
  }) => void;
  "console:run": (payload: {
    roomId: string;
    code: string;
    language: CodingRoomState["language"];
    user: RealtimeUser;
    testCases?: PracticeTestCase[];
  }) => void;
  "leaderboard:join": (payload: {
    contestId: string;
    user: RealtimeUser;
  }) => void;
  "leaderboard:submit": (payload: {
    contestId: string;
    entry: LeaderboardEntry;
  }) => void;
  "system-design:join": (payload: {
    roomId: string;
    user: RealtimeUser;
  }) => void;
  "system-design:block-update": (payload: {
    roomId: string;
    block: SystemDesignBlock;
    user: RealtimeUser;
  }) => void;
  "system-design:connection-update": (payload: {
    roomId: string;
    connection: SystemDesignConnection;
    user: RealtimeUser;
  }) => void;
  "system-design:connections-clear": (payload: {
    roomId: string;
    user: RealtimeUser;
  }) => void;
  "system-design:block-delete": (payload: {
    roomId: string;
    blockId: string;
    user: RealtimeUser;
  }) => void;
  "system-design:canvas-reset": (payload: {
    roomId: string;
    user: RealtimeUser;
  }) => void;
};

export type InterServerEvents = {
  ping: () => void;
};

export type SocketData = {
  user?: RealtimeUser;
  rooms: Set<string>;
};
