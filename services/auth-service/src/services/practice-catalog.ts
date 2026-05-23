import type { DesignScenario, PracticeProblem } from "@interview-battlefield/types";

export const codingProblems: PracticeProblem[] = [
  {
    id: "sum-array",
    title: "Sum Array",
    topic: "Arrays",
    difficulty: "EASY",
    prompt: "Implement solve(nums) and return the sum of all numbers.",
    starterCode: "export function solve(nums: number[]) {\n  return nums.reduce((sum, value) => sum + value, 0);\n}",
    testCases: [
      { input: [1, 2, 3], expected: 6 },
      { input: [-2, 5, 8], expected: 11 },
      { input: [], expected: 0 }
    ]
  },
  {
    id: "max-subarray-positive",
    title: "Best Positive Streak",
    topic: "Dynamic Programming",
    difficulty: "MEDIUM",
    prompt: "Implement solve(nums) and return the largest sum of any contiguous subarray.",
    starterCode: "export function solve(nums: number[]) {\n  let best = nums[0] ?? 0;\n  let current = nums[0] ?? 0;\n  for (let i = 1; i < nums.length; i++) {\n    current = Math.max(nums[i], current + nums[i]);\n    best = Math.max(best, current);\n  }\n  return best;\n}",
    testCases: [
      { input: [-2, 1, -3, 4, -1, 2, 1, -5, 4], expected: 6 },
      { input: [5, 4, -1, 7, 8], expected: 23 },
      { input: [-3, -2, -5], expected: -2 }
    ]
  },
  {
    id: "count-even",
    title: "Count Even Numbers",
    topic: "Arrays",
    difficulty: "EASY",
    prompt: "Implement solve(nums) and return how many values are even.",
    starterCode: "export function solve(nums: number[]) {\n  return nums.filter((value) => value % 2 === 0).length;\n}",
    testCases: [
      { input: [1, 2, 3, 4], expected: 2 },
      { input: [2, 8, 10], expected: 3 },
      { input: [1, 7, 9], expected: 0 }
    ]
  }
];

export const dsaProblems: PracticeProblem[] = [
  ...codingProblems,
  {
    id: "graph-components",
    title: "Connected Components Score",
    topic: "Graphs",
    difficulty: "MEDIUM",
    prompt: "Practice explaining graph traversal. For this runner, solve(nums) returns the number of positive islands in the array.",
    starterCode: "export function solve(nums: number[]) {\n  let islands = 0;\n  let inside = false;\n  for (const value of nums) {\n    if (value > 0 && !inside) islands++;\n    inside = value > 0;\n  }\n  return islands;\n}",
    testCases: [
      { input: [1, 2, 0, 3, 0, 4, 5], expected: 3 },
      { input: [0, 0, 1], expected: 1 },
      { input: [-1, -2], expected: 0 }
    ]
  }
];

export const designScenarios: DesignScenario[] = [
  {
    id: "collab-interview-platform",
    title: "Collaborative Interview Platform",
    difficulty: "SENIOR",
    prompt: "Design a platform for live coding interviews, realtime collaboration, AI feedback, analytics, and candidate progress tracking.",
    requirements: ["Low-latency code sync", "Persistent attempts", "AI feedback", "Replayable interview history"],
    constraints: ["100k monthly users", "Multi-region reads", "Strong auth boundaries"]
  },
  {
    id: "contest-leaderboard",
    title: "Realtime Contest Leaderboard",
    difficulty: "MID",
    prompt: "Design a DSA contest system with submissions, scoring, penalties, anti-cheat signals, and live leaderboard updates.",
    requirements: ["Realtime ranking", "Submission queue", "Score recalculation", "Contest analytics"],
    constraints: ["10k concurrent contestants", "Burst submissions", "Eventual rank consistency acceptable"]
  },
  {
    id: "notification-system",
    title: "Notification Platform",
    difficulty: "STAFF",
    prompt: "Design a multi-channel notification platform for email, push, and in-app delivery with retries and observability.",
    requirements: ["User preferences", "Retry handling", "Provider failover", "Delivery metrics"],
    constraints: ["Millions of notifications/day", "Provider rate limits", "Auditability"]
  }
];
