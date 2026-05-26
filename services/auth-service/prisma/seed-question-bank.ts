import { resolve } from "node:path";
import { config } from "dotenv";
import { Prisma, PrismaClient } from "@prisma/client";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "../../.env") });

const prisma = new PrismaClient();

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type CompanyTag = "STARTUP" | "BIG_TECH" | "PRODUCT_BASED" | "MNC" | "SERVICE_BASED";

type TestCase = {
  input: number[];
  expected: number;
};

type QuestionSeed = {
  slug: string;
  type: "DSA" | "SYSTEM_DESIGN";
  topic: string;
  difficulty: Difficulty;
  company: string;
  companyTags: CompanyTag[];
  heading: string;
  description: string;
  acceptanceText: string;
  starterCode: string;
  testCases: TestCase[];
  examples: Prisma.InputJsonValue[];
  constraints: Prisma.InputJsonValue[];
  skillKeys: string[];
  status: "ACTIVE";
};

type DsaTemplate = {
  key: string;
  topic: string;
  baseDifficulty: Difficulty;
  skillKeys: string[];
  title: string;
  prompt: (variant: Variant) => string;
  acceptance: string;
  cases: (seed: number) => TestCase[];
};

type Variant = {
  index: number;
  context: string;
  company: string;
  companyTags: CompanyTag[];
  difficulty: Difficulty;
};

const companies = [
  { name: "Google", tags: ["BIG_TECH", "PRODUCT_BASED"] as CompanyTag[] },
  { name: "Microsoft", tags: ["BIG_TECH", "PRODUCT_BASED"] as CompanyTag[] },
  { name: "Amazon", tags: ["BIG_TECH", "PRODUCT_BASED"] as CompanyTag[] },
  { name: "Meta", tags: ["BIG_TECH", "PRODUCT_BASED"] as CompanyTag[] },
  { name: "Netflix", tags: ["BIG_TECH", "PRODUCT_BASED"] as CompanyTag[] },
  { name: "Uber", tags: ["PRODUCT_BASED", "MNC"] as CompanyTag[] },
  { name: "Atlassian", tags: ["PRODUCT_BASED", "MNC"] as CompanyTag[] },
  { name: "Zerodha", tags: ["STARTUP", "PRODUCT_BASED"] as CompanyTag[] },
  { name: "Razorpay", tags: ["STARTUP", "PRODUCT_BASED"] as CompanyTag[] },
  { name: "TCS", tags: ["MNC", "SERVICE_BASED"] as CompanyTag[] }
];

const contexts = [
  "fraud signals",
  "latency samples",
  "cart sessions",
  "notification bursts",
  "deployment metrics",
  "candidate scores",
  "payment retries",
  "cache hits",
  "search impressions",
  "video watch streaks",
  "delivery delays",
  "feature flags",
  "memory snapshots",
  "traffic buckets",
  "leaderboard deltas",
  "interview attempts",
  "API quotas",
  "queue depths",
  "review windows",
  "ranking signals"
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 118);
}

function starter(title: string) {
  return `// ${title}\nexport function solve(nums: number[]): number {\n  \n}`;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function maxSubarray(values: number[]) {
  let best = values[0] ?? 0;
  let current = values[0] ?? 0;
  for (let index = 1; index < values.length; index += 1) {
    current = Math.max(values[index], current + values[index]);
    best = Math.max(best, current);
  }
  return best;
}

function lisLength(values: number[]) {
  const tails: number[] = [];
  for (const value of values) {
    let left = 0;
    let right = tails.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < value) left = mid + 1;
      else right = mid;
    }
    tails[left] = value;
  }
  return tails.length;
}

function inversionCount(values: number[]) {
  let count = 0;
  for (let left = 0; left < values.length; left += 1) {
    for (let right = left + 1; right < values.length; right += 1) {
      if (values[left] > values[right]) count += 1;
    }
  }
  return count;
}

function buildBase(seed: number, length = 8) {
  return Array.from({ length }, (_, index) => ((seed * 17 + index * 11) % 23) - 9);
}

function positiveBase(seed: number, length = 8) {
  return Array.from({ length }, (_, index) => ((seed * 13 + index * 7) % 17) + 1);
}

function countPairs(values: number[], target: number) {
  let count = 0;
  for (let left = 0; left < values.length; left += 1) {
    for (let right = left + 1; right < values.length; right += 1) {
      if (values[left] + values[right] === target) count += 1;
    }
  }
  return count;
}

function maxWindowSum(values: number[], size: number) {
  let best = -Infinity;
  for (let start = 0; start + size <= values.length; start += 1) {
    best = Math.max(best, sum(values.slice(start, start + size)));
  }
  return best === -Infinity ? 0 : best;
}

function longestAtMost(values: number[], limit: number) {
  let left = 0;
  let total = 0;
  let best = 0;
  for (let right = 0; right < values.length; right += 1) {
    total += values[right];
    while (total > limit && left <= right) {
      total -= values[left];
      left += 1;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function minLengthAtLeast(values: number[], target: number) {
  let left = 0;
  let total = 0;
  let best = Number.POSITIVE_INFINITY;
  for (let right = 0; right < values.length; right += 1) {
    total += values[right];
    while (total >= target) {
      best = Math.min(best, right - left + 1);
      total -= values[left];
      left += 1;
    }
  }
  return Number.isFinite(best) ? best : 0;
}

function longestAlternating(values: number[]) {
  if (values.length < 2) return values.length;
  let best = 1;
  let current = 1;
  let previous = 0;
  for (let index = 1; index < values.length; index += 1) {
    const diff = Math.sign(values[index] - values[index - 1]);
    if (diff !== 0 && diff !== previous) current += 1;
    else current = diff === 0 ? 1 : 2;
    previous = diff;
    best = Math.max(best, current);
  }
  return best;
}

function largestRectangle(heights: number[]) {
  const stack: number[] = [];
  let best = 0;
  for (let index = 0; index <= heights.length; index += 1) {
    const height = index === heights.length ? 0 : heights[index];
    while (stack.length && height < heights[stack[stack.length - 1]]) {
      const top = stack.pop()!;
      const width = stack.length ? index - stack[stack.length - 1] - 1 : index;
      best = Math.max(best, heights[top] * width);
    }
    stack.push(index);
  }
  return best;
}

function nextGreaterSum(values: number[]) {
  const stack: number[] = [];
  const next = Array(values.length).fill(0);
  for (let index = values.length - 1; index >= 0; index -= 1) {
    while (stack.length && stack[stack.length - 1] <= values[index]) stack.pop();
    next[index] = stack[stack.length - 1] ?? 0;
    stack.push(values[index]);
  }
  return sum(next);
}

function countReachable(n: number, edges: number[]) {
  const graph = Array.from({ length: n }, () => [] as number[]);
  for (let index = 0; index + 1 < edges.length; index += 2) {
    const a = edges[index] % n;
    const b = edges[index + 1] % n;
    graph[a].push(b);
    graph[b].push(a);
  }
  const seen = new Set<number>([0]);
  const queue = [0];
  for (let head = 0; head < queue.length; head += 1) {
    for (const next of graph[queue[head]]) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen.size;
}

function components(n: number, edges: number[]) {
  const parent = Array.from({ length: n }, (_, index) => index);
  const find = (node: number): number => parent[node] === node ? node : (parent[node] = find(parent[node]));
  for (let index = 0; index + 1 < edges.length; index += 2) {
    const a = edges[index] % n;
    const b = edges[index + 1] % n;
    parent[find(a)] = find(b);
  }
  return new Set(parent.map((_, index) => find(index))).size;
}

const templates: DsaTemplate[] = [
  {
    key: "pair-sum-count",
    topic: "Hashing",
    baseDifficulty: "EASY",
    skillKeys: ["dsa.hashing", "dsa.arrays"],
    title: "Pair Sum Count",
    prompt: () => "The first number is a target. Count index pairs in the remaining array whose values add up to that target.",
    acceptance: "Use a frequency map or two-pointer strategy after sorting. Handle duplicates correctly and avoid counting the same index twice.",
    cases: (seed) => {
      const target = 8 + (seed % 9);
      const values = positiveBase(seed, 9).map((value) => value % 12);
      return [
        { input: [target, ...values], expected: countPairs(values, target) },
        { input: [10, 1, 9, 5, 5, 3, 7], expected: 3 },
        { input: [6, 3, 3, 3, 1, 5], expected: 3 }
      ];
    }
  },
  {
    key: "max-window-sum",
    topic: "Sliding Window",
    baseDifficulty: "EASY",
    skillKeys: ["dsa.sliding_window"],
    title: "Peak Window Load",
    prompt: () => "The first number is window size k. Return the maximum sum of any contiguous window of length k in the remaining array.",
    acceptance: "Maintain a rolling sum in O(n). Cover k larger than the data by returning 0.",
    cases: (seed) => {
      const size = 2 + (seed % 4);
      const values = buildBase(seed, 10);
      return [
        { input: [size, ...values], expected: maxWindowSum(values, size) },
        { input: [3, 2, -1, 5, 4, -2], expected: 8 },
        { input: [4, 1, 2], expected: 0 }
      ];
    }
  },
  {
    key: "bounded-window-length",
    topic: "Sliding Window",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.sliding_window", "dsa.two_pointers"],
    title: "Longest Budget Window",
    prompt: () => "The first number is a limit. Using the positive values after it, return the longest contiguous window with sum at most the limit.",
    acceptance: "Use two pointers and shrink only when the window exceeds the limit.",
    cases: (seed) => {
      const limit = 18 + (seed % 12);
      const values = positiveBase(seed, 10).map((value) => (value % 9) + 1);
      return [
        { input: [limit, ...values], expected: longestAtMost(values, limit) },
        { input: [7, 2, 1, 3, 4, 1, 1], expected: 4 },
        { input: [3, 5, 6, 7], expected: 0 }
      ];
    }
  },
  {
    key: "minimum-target-window",
    topic: "Two Pointers",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.two_pointers", "dsa.sliding_window"],
    title: "Smallest Recovery Window",
    prompt: () => "The first number is a target. Return the minimum length of a positive contiguous subarray whose sum is at least target. Return 0 if none exists.",
    acceptance: "Use an expanding and shrinking window. Do not brute force all subarrays.",
    cases: (seed) => {
      const target = 14 + (seed % 18);
      const values = positiveBase(seed, 10).map((value) => (value % 10) + 1);
      return [
        { input: [target, ...values], expected: minLengthAtLeast(values, target) },
        { input: [11, 1, 2, 3, 4, 5], expected: 3 },
        { input: [50, 4, 5, 6], expected: 0 }
      ];
    }
  },
  {
    key: "max-subarray",
    topic: "Dynamic Programming",
    baseDifficulty: "EASY",
    skillKeys: ["dsa.dynamic_programming", "dsa.arrays"],
    title: "Maximum Momentum Segment",
    prompt: () => "Return the maximum sum of a non-empty contiguous segment.",
    acceptance: "Apply Kadane's algorithm and handle all-negative arrays.",
    cases: (seed) => {
      const values = buildBase(seed, 10);
      return [
        { input: values, expected: maxSubarray(values) },
        { input: [-5, -1, -9], expected: -1 },
        { input: [4, -2, 7, -10, 5], expected: 9 }
      ];
    }
  },
  {
    key: "prefix-balance",
    topic: "Prefix Sums",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.prefix_sums", "dsa.arrays"],
    title: "Balanced Prefix Split",
    prompt: () => "Return the number of split positions where the sum on the left is greater than or equal to the sum on the right.",
    acceptance: "Precompute total sum, then update a running prefix in one pass.",
    cases: (seed) => {
      const values = buildBase(seed, 9);
      const expected = values.slice(0, -1).filter((_, index) => sum(values.slice(0, index + 1)) >= sum(values.slice(index + 1))).length;
      return [
        { input: values, expected },
        { input: [5, -1, 2, 1], expected: 3 },
        { input: [1, 1, 1, 10], expected: 0 }
      ];
    }
  },
  {
    key: "distinct-count",
    topic: "Hashing",
    baseDifficulty: "EASY",
    skillKeys: ["dsa.hashing"],
    title: "Unique Signal Count",
    prompt: () => "Return the number of distinct values in the array.",
    acceptance: "Use a set and keep the implementation linear.",
    cases: (seed) => {
      const values = positiveBase(seed, 12).map((value) => value % 7);
      return [
        { input: values, expected: new Set(values).size },
        { input: [4, 4, 4], expected: 1 },
        { input: [], expected: 0 }
      ];
    }
  },
  {
    key: "majority-frequency",
    topic: "Hashing",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.hashing", "dsa.arrays"],
    title: "Dominant Frequency",
    prompt: () => "Return the highest frequency of any value in the array.",
    acceptance: "Count values with a map and track the maximum frequency.",
    cases: (seed) => {
      const values = positiveBase(seed, 12).map((value) => value % 6);
      const frequencies = new Map<number, number>();
      values.forEach((value) => frequencies.set(value, (frequencies.get(value) ?? 0) + 1));
      return [
        { input: values, expected: Math.max(0, ...frequencies.values()) },
        { input: [1, 2, 2, 3, 3, 3], expected: 3 },
        { input: [], expected: 0 }
      ];
    }
  },
  {
    key: "inversion-count",
    topic: "Sorting",
    baseDifficulty: "HARD",
    skillKeys: ["dsa.sorting", "dsa.divide_and_conquer"],
    title: "Disorder Score",
    prompt: () => "Return the number of inversions: pairs i < j where nums[i] > nums[j].",
    acceptance: "Use merge-sort counting for scalable input; brute force only passes tiny cases.",
    cases: (seed) => {
      const values = positiveBase(seed, 8).map((value) => value % 13);
      return [
        { input: values, expected: inversionCount(values) },
        { input: [5, 4, 3, 2, 1], expected: 10 },
        { input: [1, 2, 3], expected: 0 }
      ];
    }
  },
  {
    key: "lis-length",
    topic: "Dynamic Programming",
    baseDifficulty: "HARD",
    skillKeys: ["dsa.dynamic_programming", "dsa.binary_search"],
    title: "Longest Growth Chain",
    prompt: () => "Return the length of the longest strictly increasing subsequence.",
    acceptance: "Use either O(n²) DP or the O(n log n) tails approach and explain the tradeoff.",
    cases: (seed) => {
      const values = positiveBase(seed, 10).map((value) => value % 19);
      return [
        { input: values, expected: lisLength(values) },
        { input: [10, 9, 2, 5, 3, 7, 101, 18], expected: 4 },
        { input: [3, 3, 3], expected: 1 }
      ];
    }
  },
  {
    key: "alternating-run",
    topic: "Greedy",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.greedy"],
    title: "Longest Alternating Run",
    prompt: () => "Return the length of the longest contiguous run where differences alternate between positive and negative.",
    acceptance: "Track the previous difference sign and reset cleanly on equal adjacent values.",
    cases: (seed) => {
      const values = buildBase(seed, 11);
      return [
        { input: values, expected: longestAlternating(values) },
        { input: [1, 5, 2, 6, 3, 7], expected: 6 },
        { input: [2, 2, 2], expected: 1 }
      ];
    }
  },
  {
    key: "largest-rectangle",
    topic: "Monotonic Stack",
    baseDifficulty: "HARD",
    skillKeys: ["dsa.monotonic_stack", "dsa.stack"],
    title: "Largest Histogram Block",
    prompt: () => "Each number is a bar height. Return the largest rectangle area in the histogram.",
    acceptance: "Use a monotonic increasing stack and flush with a zero-height sentinel.",
    cases: (seed) => {
      const values = positiveBase(seed, 8).map((value) => (value % 8) + 1);
      return [
        { input: values, expected: largestRectangle(values) },
        { input: [2, 1, 5, 6, 2, 3], expected: 10 },
        { input: [2, 4], expected: 4 }
      ];
    }
  },
  {
    key: "next-greater-sum",
    topic: "Monotonic Stack",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.monotonic_stack", "dsa.stack"],
    title: "Next Greater Signal Sum",
    prompt: () => "For every value, find the next greater value to its right. Return the sum of those next greater values, using 0 when absent.",
    acceptance: "Traverse from right to left with a decreasing stack.",
    cases: (seed) => {
      const values = positiveBase(seed, 10).map((value) => value % 15);
      return [
        { input: values, expected: nextGreaterSum(values) },
        { input: [2, 1, 3, 4], expected: 7 },
        { input: [5, 4, 3], expected: 0 }
      ];
    }
  },
  {
    key: "binary-search-insert",
    topic: "Binary Search",
    baseDifficulty: "EASY",
    skillKeys: ["dsa.binary_search"],
    title: "Sorted Insert Position",
    prompt: () => "The first number is target. The remaining values are sorted. Return the insertion index where target should be placed.",
    acceptance: "Use binary search and return the left boundary.",
    cases: (seed) => {
      const target = seed % 20;
      const values = positiveBase(seed, 8).map((value) => value % 20).sort((a, b) => a - b);
      const expected = values.findIndex((value) => value >= target);
      return [
        { input: [target, ...values], expected: expected === -1 ? values.length : expected },
        { input: [5, 1, 3, 5, 7], expected: 2 },
        { input: [8, 1, 3, 5, 7], expected: 4 }
      ];
    }
  },
  {
    key: "capacity-days",
    topic: "Binary Search",
    baseDifficulty: "HARD",
    skillKeys: ["dsa.binary_search", "dsa.greedy"],
    title: "Minimum Shipping Capacity",
    prompt: () => "The first number is days. Remaining positive numbers are package weights. Return the minimum capacity needed to ship in that many days.",
    acceptance: "Binary search the answer and greedily simulate required days.",
    cases: (seed) => {
      const days = 3 + (seed % 4);
      const values = positiveBase(seed, 8).map((value) => (value % 9) + 1);
      const canShip = (capacity: number) => {
        let used = 1;
        let load = 0;
        for (const value of values) {
          if (load + value > capacity) {
            used += 1;
            load = 0;
          }
          load += value;
        }
        return used <= days;
      };
      let left = Math.max(...values);
      let right = sum(values);
      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (canShip(mid)) right = mid;
        else left = mid + 1;
      }
      return [
        { input: [days, ...values], expected: left },
        { input: [5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], expected: 15 },
        { input: [1, 3, 2, 2], expected: 7 }
      ];
    }
  },
  {
    key: "reachable-nodes",
    topic: "Graphs",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.graphs", "dsa.bfs"],
    title: "Reachable Service Count",
    prompt: () => "The first number is n. Remaining values are undirected edges encoded as flat pairs. Return how many nodes are reachable from node 0.",
    acceptance: "Build an adjacency list and run BFS/DFS. Ignore any incomplete trailing edge value.",
    cases: (seed) => {
      const n = 5 + (seed % 5);
      const edges = positiveBase(seed, 12).map((value) => value % n);
      return [
        { input: [n, ...edges], expected: countReachable(n, edges) },
        { input: [5, 0, 1, 1, 2, 3, 4], expected: 3 },
        { input: [4, 1, 2], expected: 1 }
      ];
    }
  },
  {
    key: "component-count",
    topic: "Union Find",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.union_find", "dsa.graphs"],
    title: "Disconnected Cluster Count",
    prompt: () => "The first number is n. Remaining values are undirected edges encoded as flat pairs. Return the number of connected components.",
    acceptance: "Use DFS/BFS or union-find. Normalize edge endpoints into the 0..n-1 range.",
    cases: (seed) => {
      const n = 6 + (seed % 5);
      const edges = positiveBase(seed + 3, 12).map((value) => value % n);
      return [
        { input: [n, ...edges], expected: components(n, edges) },
        { input: [5, 0, 1, 1, 2, 3, 4], expected: 2 },
        { input: [4], expected: 4 }
      ];
    }
  },
  {
    key: "house-robber",
    topic: "Dynamic Programming",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.dynamic_programming"],
    title: "Non Adjacent Reward",
    prompt: () => "Return the maximum sum you can collect without taking adjacent elements.",
    acceptance: "Use rolling DP with include/exclude states.",
    cases: (seed) => {
      const values = positiveBase(seed, 10).map((value) => value % 20);
      const dp = values.reduce<[number, number]>(([skip, take], value) => [Math.max(skip, take), skip + value], [0, 0]);
      return [
        { input: values, expected: Math.max(...dp) },
        { input: [2, 7, 9, 3, 1], expected: 12 },
        { input: [5, 1, 1, 5], expected: 10 }
      ];
    }
  },
  {
    key: "coin-change-min",
    topic: "Dynamic Programming",
    baseDifficulty: "HARD",
    skillKeys: ["dsa.dynamic_programming"],
    title: "Minimum Token Count",
    prompt: () => "The first number is target amount. Remaining positive values are coin denominations. Return the minimum coins needed, or -1 if impossible.",
    acceptance: "Use bottom-up DP over amounts and initialize unreachable states carefully.",
    cases: (seed) => {
      const target = 10 + (seed % 20);
      const coins = Array.from(new Set(positiveBase(seed, 5).map((value) => (value % 8) + 1)));
      const dp = Array(target + 1).fill(1_000_000);
      dp[0] = 0;
      for (const coin of coins) {
        for (let amount = coin; amount <= target; amount += 1) {
          dp[amount] = Math.min(dp[amount], dp[amount - coin] + 1);
        }
      }
      return [
        { input: [target, ...coins], expected: dp[target] >= 1_000_000 ? -1 : dp[target] },
        { input: [11, 1, 2, 5], expected: 3 },
        { input: [3, 2], expected: -1 }
      ];
    }
  },
  {
    key: "stock-profit",
    topic: "Greedy",
    baseDifficulty: "EASY",
    skillKeys: ["dsa.greedy", "dsa.arrays"],
    title: "Best Single Trade",
    prompt: () => "Given daily prices, return the maximum profit from one buy followed by one sell.",
    acceptance: "Track the minimum price seen so far and update best profit.",
    cases: (seed) => {
      const values = positiveBase(seed, 9).map((value) => value % 20);
      let minPrice = Number.POSITIVE_INFINITY;
      let best = 0;
      for (const value of values) {
        best = Math.max(best, value - minPrice);
        minPrice = Math.min(minPrice, value);
      }
      return [
        { input: values, expected: best },
        { input: [7, 1, 5, 3, 6, 4], expected: 5 },
        { input: [7, 6, 4, 3, 1], expected: 0 }
      ];
    }
  },
  {
    key: "interval-overlap",
    topic: "Intervals",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.intervals", "dsa.sorting"],
    title: "Peak Meeting Overlap",
    prompt: () => "Values are encoded as start,end pairs. Return the maximum number of overlapping intervals.",
    acceptance: "Use a sweep line over starts and ends. Ignore incomplete trailing values.",
    cases: (seed) => {
      const raw = positiveBase(seed, 10).map((value) => value % 20);
      const intervals = [];
      for (let index = 0; index + 1 < raw.length; index += 2) {
        const start = Math.min(raw[index], raw[index + 1]);
        const end = Math.max(raw[index], raw[index + 1]) + 1;
        intervals.push([start, end]);
      }
      let best = 0;
      for (const [time] of intervals) {
        best = Math.max(best, intervals.filter(([start, end]) => start <= time && time < end).length);
      }
      return [
        { input: raw, expected: best },
        { input: [1, 4, 2, 5, 7, 9], expected: 2 },
        { input: [1, 2, 3, 4], expected: 1 }
      ];
    }
  },
  {
    key: "heap-top-k-sum",
    topic: "Heaps",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.heaps", "dsa.sorting"],
    title: "Top K Signal Sum",
    prompt: () => "The first number is k. Return the sum of the k largest values from the remaining array.",
    acceptance: "Use a min-heap of size k or sort as a simpler baseline. Handle k greater than n.",
    cases: (seed) => {
      const k = 1 + (seed % 5);
      const values = buildBase(seed, 10);
      return [
        { input: [k, ...values], expected: sum([...values].sort((a, b) => b - a).slice(0, k)) },
        { input: [2, 5, 1, 9, 3], expected: 14 },
        { input: [5, 2, 3], expected: 5 }
      ];
    }
  },
  {
    key: "tree-depth-array",
    topic: "Trees",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.trees", "dsa.bfs"],
    title: "Implicit Tree Depth",
    prompt: () => "Treat the array as a level-order binary tree where -1 means missing node. Return the maximum depth.",
    acceptance: "Traverse level-order indices and skip missing nodes.",
    cases: (seed) => {
      const values = positiveBase(seed, 11).map((value, index) => index > 0 && value % 5 === 0 ? -1 : value % 20);
      const depth = (index: number): number => index >= values.length || values[index] === -1 ? 0 : 1 + Math.max(depth(index * 2 + 1), depth(index * 2 + 2));
      return [
        { input: values, expected: depth(0) },
        { input: [1, 2, 3, -1, 4], expected: 3 },
        { input: [-1, 2, 3], expected: 0 }
      ];
    }
  },
  {
    key: "palindrome-pairs-lite",
    topic: "Arrays",
    baseDifficulty: "EASY",
    skillKeys: ["dsa.arrays"],
    title: "Mirror Pair Matches",
    prompt: () => "Return the number of index pairs mirrored around the center where nums[i] equals nums[n - 1 - i].",
    acceptance: "Use two pointers from both ends and count matching mirrored pairs.",
    cases: (seed) => {
      const values = positiveBase(seed, 10).map((value) => value % 6);
      let expected = 0;
      for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
        if (values[left] === values[right]) expected += 1;
      }
      return [
        { input: values, expected },
        { input: [1, 2, 3, 2, 1], expected: 2 },
        { input: [1, 2, 3], expected: 0 }
      ];
    }
  },
  {
    key: "max-product-pair",
    topic: "Arrays",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.arrays"],
    title: "Best Pair Product",
    prompt: () => "Return the maximum product of any two different values in the array.",
    acceptance: "Track two largest and two smallest values because negatives can create the best product.",
    cases: (seed) => {
      const values = buildBase(seed, 9);
      let best = -Infinity;
      for (let left = 0; left < values.length; left += 1) {
        for (let right = left + 1; right < values.length; right += 1) best = Math.max(best, values[left] * values[right]);
      }
      return [
        { input: values, expected: best },
        { input: [-10, -9, 1, 2], expected: 90 },
        { input: [3], expected: -Infinity as unknown as number }
      ].map((testCase) => ({ ...testCase, expected: Number.isFinite(testCase.expected) ? testCase.expected : 0 }));
    }
  },
  {
    key: "partition-difference",
    topic: "Prefix Sums",
    baseDifficulty: "EASY",
    skillKeys: ["dsa.prefix_sums"],
    title: "Minimum Split Difference",
    prompt: () => "Return the minimum absolute difference between left sum and right sum across all split positions.",
    acceptance: "Keep a running prefix and compare against total sum.",
    cases: (seed) => {
      const values = buildBase(seed, 10);
      const expected = values.slice(0, -1).reduce((best, _, index) => {
        const left = sum(values.slice(0, index + 1));
        const right = sum(values.slice(index + 1));
        return Math.min(best, Math.abs(left - right));
      }, Number.POSITIVE_INFINITY);
      return [
        { input: values, expected: Number.isFinite(expected) ? expected : 0 },
        { input: [3, 1, 2, 4], expected: 2 },
        { input: [10], expected: 0 }
      ];
    }
  },
  {
    key: "frequency-threshold",
    topic: "Hashing",
    baseDifficulty: "MEDIUM",
    skillKeys: ["dsa.hashing"],
    title: "Threshold Frequency Count",
    prompt: () => "The first number is k. Return how many distinct values in the remaining array occur at least k times.",
    acceptance: "Build frequencies once and count values meeting the threshold.",
    cases: (seed) => {
      const k = 2 + (seed % 3);
      const values = positiveBase(seed, 14).map((value) => value % 8);
      const frequencies = new Map<number, number>();
      values.forEach((value) => frequencies.set(value, (frequencies.get(value) ?? 0) + 1));
      return [
        { input: [k, ...values], expected: [...frequencies.values()].filter((count) => count >= k).length },
        { input: [2, 1, 1, 2, 3, 3, 3], expected: 2 },
        { input: [4, 1, 1, 1], expected: 0 }
      ];
    }
  }
];

function difficultyFor(template: DsaTemplate, index: number): Difficulty {
  if (template.baseDifficulty === "HARD") return index % 5 === 0 ? "MEDIUM" : "HARD";
  if (template.baseDifficulty === "MEDIUM") return index % 6 === 0 ? "HARD" : index % 5 === 0 ? "EASY" : "MEDIUM";
  return index % 7 === 0 ? "MEDIUM" : "EASY";
}

type CuratedDsaProblem = {
  slug: string;
  topic: string;
  difficulty: Difficulty;
  company: string;
  companyTags: CompanyTag[];
  heading: string;
  description: string;
  acceptanceText: string;
  testCases: TestCase[];
  constraints: string[];
  skillKeys: string[];
};

const curatedDsaProblems: CuratedDsaProblem[] = [
  {
    slug: "two-sum-frequency-ledger",
    topic: "Hashing",
    difficulty: "EASY",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Two Sum Frequency Ledger",
    description: "The first number is target. Remaining values are transaction amounts. Return the number of unique index pairs whose sum equals target. Duplicates are real records, so count valid index pairs, not just distinct values.",
    acceptanceText: "<p><strong>Expected:</strong> Use a frequency map while scanning. Explain duplicate handling and why the same index is never reused.</p>",
    testCases: [
      { input: [9, 2, 7, 11, 15], expected: 1 },
      { input: [6, 3, 3, 3, 1, 5], expected: 3 },
      { input: [10, 1, 9, 5, 5, 3, 7], expected: 3 }
    ],
    constraints: ["1 <= nums.length <= 200000", "First value is target", "Return pair count"],
    skillKeys: ["dsa.hashing", "dsa.arrays"]
  },
  {
    slug: "longest-non-repeating-signal-run",
    topic: "Sliding Window",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Longest Non-Repeating Signal Run",
    description: "Values represent event IDs. Return the length of the longest contiguous segment with no repeated event ID.",
    acceptanceText: "<p><strong>Expected:</strong> Sliding window with last-seen positions or a set. Move the left pointer past duplicates without restarting the scan.</p>",
    testCases: [
      { input: [1, 2, 3, 1, 2, 3, 4], expected: 4 },
      { input: [5, 5, 5], expected: 1 },
      { input: [], expected: 0 }
    ],
    constraints: ["0 <= nums.length <= 200000", "Values can repeat heavily"],
    skillKeys: ["dsa.sliding_window", "dsa.hashing"]
  },
  {
    slug: "minimum-window-threshold",
    topic: "Two Pointers",
    difficulty: "MEDIUM",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Minimum Window Threshold",
    description: "The first number is a target. Remaining positive values are request weights. Return the smallest contiguous window length whose sum is at least target, or 0 if no such window exists.",
    acceptanceText: "<p><strong>Expected:</strong> Expand right, shrink left while the target is satisfied, and keep the best length.</p>",
    testCases: [
      { input: [7, 2, 3, 1, 2, 4, 3], expected: 2 },
      { input: [15, 1, 2, 3, 4], expected: 0 },
      { input: [4, 4], expected: 1 }
    ],
    constraints: ["All values after target are positive", "Return 0 if impossible"],
    skillKeys: ["dsa.two_pointers", "dsa.sliding_window"]
  },
  {
    slug: "maximum-subarray-drawdown",
    topic: "Dynamic Programming",
    difficulty: "EASY",
    company: "Netflix",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Maximum Subarray Drawdown",
    description: "Each value is a daily score delta. Return the maximum sum of a non-empty contiguous segment.",
    acceptanceText: "<p><strong>Expected:</strong> Kadane's algorithm. Handle all-negative arrays by returning the least negative value.</p>",
    testCases: [
      { input: [-2, 1, -3, 4, -1, 2, 1, -5, 4], expected: 6 },
      { input: [-5, -1, -9], expected: -1 },
      { input: [4, -2, 7, -10, 5], expected: 9 }
    ],
    constraints: ["1 <= nums.length <= 200000"],
    skillKeys: ["dsa.dynamic_programming", "dsa.arrays"]
  },
  {
    slug: "product-except-self-sum",
    topic: "Prefix Sums",
    difficulty: "MEDIUM",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Product Except Self Sum",
    description: "For every index, compute the product of all numbers except nums[i]. Return the sum of those products. Do not use division.",
    acceptanceText: "<p><strong>Expected:</strong> Prefix and suffix products in two passes. Zeros should work naturally.</p>",
    testCases: [
      { input: [1, 2, 3, 4], expected: 50 },
      { input: [0, 2, 3], expected: 6 },
      { input: [5], expected: 1 }
    ],
    constraints: ["Do not use division", "Return the sum of product-except-self values"],
    skillKeys: ["dsa.prefix_sums", "dsa.arrays"]
  },
  {
    slug: "daily-temperatures-wait-sum",
    topic: "Monotonic Stack",
    difficulty: "MEDIUM",
    company: "Uber",
    companyTags: ["PRODUCT_BASED", "MNC"],
    heading: "Daily Temperatures Wait Sum",
    description: "Each number is a temperature. For every day, compute how many days until a warmer temperature appears. Return the sum of all wait times.",
    acceptanceText: "<p><strong>Expected:</strong> Use a monotonic decreasing stack of indices and resolve waits when a warmer value arrives.</p>",
    testCases: [
      { input: [73, 74, 75, 71, 69, 72, 76, 73], expected: 10 },
      { input: [30, 40, 50, 60], expected: 3 },
      { input: [60, 50, 40], expected: 0 }
    ],
    constraints: ["0 <= nums.length <= 200000"],
    skillKeys: ["dsa.monotonic_stack", "dsa.stack"]
  },
  {
    slug: "largest-histogram-rectangle",
    topic: "Monotonic Stack",
    difficulty: "HARD",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Largest Histogram Rectangle",
    description: "Each value is a histogram bar height. Return the largest rectangle area that can be formed using contiguous bars.",
    acceptanceText: "<p><strong>Expected:</strong> Monotonic increasing stack with a sentinel. Explain how width is calculated after popping.</p>",
    testCases: [
      { input: [2, 1, 5, 6, 2, 3], expected: 10 },
      { input: [2, 4], expected: 4 },
      { input: [1, 1, 1, 1], expected: 4 }
    ],
    constraints: ["0 <= height <= 100000", "Use O(n) stack approach for full credit"],
    skillKeys: ["dsa.monotonic_stack", "dsa.stack"]
  },
  {
    slug: "rotated-array-search-index",
    topic: "Binary Search",
    difficulty: "MEDIUM",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Rotated Array Search Index",
    description: "The first number is target. Remaining values are a strictly increasing array rotated at an unknown pivot. Return the index of target in the remaining values, or -1 if absent.",
    acceptanceText: "<p><strong>Expected:</strong> Binary search by identifying which half is sorted on every step.</p>",
    testCases: [
      { input: [0, 4, 5, 6, 7, 0, 1, 2], expected: 4 },
      { input: [3, 4, 5, 6, 7, 0, 1, 2], expected: -1 },
      { input: [5, 5], expected: 0 }
    ],
    constraints: ["Remaining values are unique", "Returned index is relative to the remaining array"],
    skillKeys: ["dsa.binary_search", "dsa.arrays"]
  },
  {
    slug: "minimum-shipping-capacity",
    topic: "Binary Search",
    difficulty: "HARD",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Minimum Shipping Capacity",
    description: "The first number is days. Remaining positive numbers are package weights in order. Return the minimum ship capacity needed to deliver all packages within days.",
    acceptanceText: "<p><strong>Expected:</strong> Binary search over answer space and greedily count required days for a candidate capacity.</p>",
    testCases: [
      { input: [5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], expected: 15 },
      { input: [3, 3, 2, 2, 4, 1, 4], expected: 6 },
      { input: [1, 3, 2, 2], expected: 7 }
    ],
    constraints: ["Weights must remain in original order"],
    skillKeys: ["dsa.binary_search", "dsa.greedy"]
  },
  {
    slug: "koko-minimum-eating-speed",
    topic: "Binary Search",
    difficulty: "MEDIUM",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Minimum Processing Speed",
    description: "The first number is h hours. Remaining positive values are job sizes. Each hour you can process up to speed units from one job. Return the minimum integer speed needed to finish all jobs in h hours.",
    acceptanceText: "<p><strong>Expected:</strong> Binary search speed and use ceiling division to calculate total hours.</p>",
    testCases: [
      { input: [8, 3, 6, 7, 11], expected: 4 },
      { input: [5, 30, 11, 23, 4, 20], expected: 30 },
      { input: [6, 30, 11, 23, 4, 20], expected: 23 }
    ],
    constraints: ["All job sizes are positive"],
    skillKeys: ["dsa.binary_search"]
  },
  {
    slug: "merge-intervals-total-coverage",
    topic: "Intervals",
    difficulty: "MEDIUM",
    company: "Atlassian",
    companyTags: ["PRODUCT_BASED", "MNC"],
    heading: "Merge Intervals Total Coverage",
    description: "Values are encoded as start,end pairs. Merge overlapping intervals and return the total covered length. Ignore an incomplete trailing value.",
    acceptanceText: "<p><strong>Expected:</strong> Sort by start, merge with the last active interval, and sum merged ranges.</p>",
    testCases: [
      { input: [1, 3, 2, 6, 8, 10, 15, 18], expected: 10 },
      { input: [1, 4, 4, 5], expected: 4 },
      { input: [5], expected: 0 }
    ],
    constraints: ["Intervals are half-open for length: end - start", "Normalize pairs where start > end"],
    skillKeys: ["dsa.intervals", "dsa.sorting"]
  },
  {
    slug: "meeting-rooms-required",
    topic: "Intervals",
    difficulty: "MEDIUM",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Meeting Rooms Required",
    description: "Values are encoded as start,end pairs. Return the minimum number of rooms needed so no overlapping meetings share a room.",
    acceptanceText: "<p><strong>Expected:</strong> Sweep sorted start/end events or use a min-heap of end times.</p>",
    testCases: [
      { input: [0, 30, 5, 10, 15, 20], expected: 2 },
      { input: [7, 10, 2, 4], expected: 1 },
      { input: [1, 5, 2, 6, 3, 7], expected: 3 }
    ],
    constraints: ["Ignore incomplete trailing endpoint"],
    skillKeys: ["dsa.intervals", "dsa.heaps"]
  },
  {
    slug: "top-k-frequency-score",
    topic: "Heaps",
    difficulty: "MEDIUM",
    company: "Netflix",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Top K Frequency Score",
    description: "The first number is k. Remaining values are item IDs. Return the sum of the k highest frequencies.",
    acceptanceText: "<p><strong>Expected:</strong> Count with a map, then use a heap or bucket counts. Handle k larger than distinct count.</p>",
    testCases: [
      { input: [2, 1, 1, 1, 2, 2, 3], expected: 5 },
      { input: [3, 4, 4, 5], expected: 2 },
      { input: [1], expected: 0 }
    ],
    constraints: ["First value is k", "Return sum of frequencies, not values"],
    skillKeys: ["dsa.heaps", "dsa.hashing"]
  },
  {
    slug: "median-stream-checkpoint",
    topic: "Heaps",
    difficulty: "HARD",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Median Stream Checkpoint",
    description: "Numbers arrive in order. After each prefix, compute the floor of the median. Return the sum of all prefix medians.",
    acceptanceText: "<p><strong>Expected:</strong> Maintain two heaps, rebalance after insertion, and read the lower median from the max-heap.</p>",
    testCases: [
      { input: [5, 15, 1, 3], expected: 18 },
      { input: [2, 4, 6], expected: 8 },
      { input: [], expected: 0 }
    ],
    constraints: ["Return sum of floor medians across prefixes"],
    skillKeys: ["dsa.heaps"]
  },
  {
    slug: "course-schedule-feasibility",
    topic: "Graphs",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Course Schedule Feasibility",
    description: "The first number is n. Remaining values are directed prerequisite edges encoded as course,prerequisite pairs. Return 1 if all courses can be finished, otherwise 0.",
    acceptanceText: "<p><strong>Expected:</strong> Detect cycles with Kahn's topological sort or DFS colors.</p>",
    testCases: [
      { input: [2, 1, 0], expected: 1 },
      { input: [2, 1, 0, 0, 1], expected: 0 },
      { input: [4, 1, 0, 2, 1, 3, 2], expected: 1 }
    ],
    constraints: ["Nodes are 0..n-1", "Ignore incomplete trailing edge"],
    skillKeys: ["dsa.graphs", "dsa.topological_sort"]
  },
  {
    slug: "number-of-islands-flat-grid",
    topic: "Graphs",
    difficulty: "MEDIUM",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Number of Islands Flat Grid",
    description: "The first two numbers are rows and cols. Remaining values are a flattened binary grid. Return the number of 4-direction connected islands of 1s.",
    acceptanceText: "<p><strong>Expected:</strong> DFS/BFS over flattened coordinates. Carefully convert index to row/col.</p>",
    testCases: [
      { input: [3, 4, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1], expected: 3 },
      { input: [2, 2, 1, 1, 1, 1], expected: 1 },
      { input: [2, 3, 0, 0, 0, 0, 0, 0], expected: 0 }
    ],
    constraints: ["Grid length is rows * cols", "Use 4-direction connectivity"],
    skillKeys: ["dsa.graphs", "dsa.bfs"]
  },
  {
    slug: "shortest-path-binary-maze",
    topic: "Graphs",
    difficulty: "HARD",
    company: "Uber",
    companyTags: ["PRODUCT_BASED", "MNC"],
    heading: "Shortest Path Binary Maze",
    description: "The first two numbers are rows and cols. Remaining values are a flattened grid where 0 is open and 1 is blocked. Return the shortest path length from top-left to bottom-right using 4-direction moves, or -1.",
    acceptanceText: "<p><strong>Expected:</strong> BFS from the source with distance levels and blocked/source edge checks.</p>",
    testCases: [
      { input: [3, 3, 0, 0, 0, 1, 1, 0, 0, 0, 0], expected: 5 },
      { input: [2, 2, 0, 1, 1, 0], expected: -1 },
      { input: [1, 1, 0], expected: 1 }
    ],
    constraints: ["Return number of cells on the path"],
    skillKeys: ["dsa.graphs", "dsa.bfs"]
  },
  {
    slug: "network-delay-time",
    topic: "Graphs",
    difficulty: "HARD",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Network Delay Time",
    description: "Input is encoded as n, source, then directed weighted edges u,v,w. Return the time for all nodes to receive the signal, or -1 if unreachable.",
    acceptanceText: "<p><strong>Expected:</strong> Dijkstra with adjacency list and min-heap. Explain why plain BFS is incorrect for weighted edges.</p>",
    testCases: [
      { input: [4, 2, 2, 1, 1, 2, 3, 1, 3, 4, 1], expected: 2 },
      { input: [2, 1, 1, 2, 5], expected: 5 },
      { input: [2, 2, 1, 2, 5], expected: -1 }
    ],
    constraints: ["Nodes are 1-indexed", "Edges are triples after n and source"],
    skillKeys: ["dsa.graphs", "dsa.shortest_path", "dsa.heaps"]
  },
  {
    slug: "redundant-connection-edge",
    topic: "Union Find",
    difficulty: "MEDIUM",
    company: "Atlassian",
    companyTags: ["PRODUCT_BASED", "MNC"],
    heading: "Redundant Connection Edge",
    description: "The first number is n. Remaining values are undirected edges encoded as u,v pairs. Return the 1-based position of the first edge that creates a cycle, or 0 if none.",
    acceptanceText: "<p><strong>Expected:</strong> Union-find with path compression. Return edge order, not node ID.</p>",
    testCases: [
      { input: [3, 1, 2, 1, 3, 2, 3], expected: 3 },
      { input: [4, 1, 2, 2, 3, 3, 4], expected: 0 },
      { input: [5, 1, 2, 2, 3, 3, 1], expected: 3 }
    ],
    constraints: ["Nodes are 1..n"],
    skillKeys: ["dsa.union_find", "dsa.graphs"]
  },
  {
    slug: "tree-diameter-flat-edges",
    topic: "Trees",
    difficulty: "HARD",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Tree Diameter From Edges",
    description: "The first number is n. Remaining values are undirected tree edges encoded as u,v pairs using 0-indexed nodes. Return the tree diameter in number of edges.",
    acceptanceText: "<p><strong>Expected:</strong> Two BFS/DFS passes: from any node to farthest A, then from A to farthest B.</p>",
    testCases: [
      { input: [5, 0, 1, 1, 2, 1, 3, 3, 4], expected: 3 },
      { input: [1], expected: 0 },
      { input: [4, 0, 1, 1, 2, 2, 3], expected: 3 }
    ],
    constraints: ["Input is a valid tree unless edges are missing"],
    skillKeys: ["dsa.trees", "dsa.graphs"]
  },
  {
    slug: "lowest-common-ancestor-bst",
    topic: "Trees",
    difficulty: "MEDIUM",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Lowest Common Ancestor in BST",
    description: "The first two numbers are p and q. Remaining values are a BST inserted in order. Build the BST and return the value of the lowest common ancestor of p and q.",
    acceptanceText: "<p><strong>Expected:</strong> Use BST ordering to move left/right until p and q split around the current node.</p>",
    testCases: [
      { input: [2, 8, 6, 2, 8, 0, 4, 7, 9, 3, 5], expected: 6 },
      { input: [2, 4, 6, 2, 8, 0, 4, 7, 9, 3, 5], expected: 2 },
      { input: [1, 1, 1], expected: 1 }
    ],
    constraints: ["BST values are unique except p/q metadata"],
    skillKeys: ["dsa.trees", "dsa.binary_search_tree"]
  },
  {
    slug: "binary-tree-level-max-sum",
    topic: "Trees",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Binary Tree Level Max Sum",
    description: "Treat values as a level-order binary tree where -1 means missing. Return the 1-based level with the maximum sum. If tied, return the smallest level.",
    acceptanceText: "<p><strong>Expected:</strong> BFS by level over implicit indices and skip missing children.</p>",
    testCases: [
      { input: [1, 7, 0, 7, -8, -1, -1], expected: 2 },
      { input: [-1], expected: 0 },
      { input: [5], expected: 1 }
    ],
    constraints: ["-1 marks missing node", "Return 0 for an empty/missing root"],
    skillKeys: ["dsa.trees", "dsa.bfs"]
  },
  {
    slug: "house-robber-line",
    topic: "Dynamic Programming",
    difficulty: "MEDIUM",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "House Robber Line",
    description: "Each value is a non-negative reward. Return the maximum reward you can collect without taking adjacent positions.",
    acceptanceText: "<p><strong>Expected:</strong> Rolling DP with take/skip states. Do not mutate the input unnecessarily.</p>",
    testCases: [
      { input: [2, 7, 9, 3, 1], expected: 12 },
      { input: [5, 1, 1, 5], expected: 10 },
      { input: [], expected: 0 }
    ],
    constraints: ["0 <= nums.length <= 200000"],
    skillKeys: ["dsa.dynamic_programming"]
  },
  {
    slug: "coin-change-minimum",
    topic: "Dynamic Programming",
    difficulty: "HARD",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Coin Change Minimum",
    description: "The first number is target amount. Remaining positive numbers are coin denominations. Return the fewest coins needed to make target, or -1 if impossible.",
    acceptanceText: "<p><strong>Expected:</strong> Bottom-up DP over amount with unreachable sentinel values.</p>",
    testCases: [
      { input: [11, 1, 2, 5], expected: 3 },
      { input: [3, 2], expected: -1 },
      { input: [0, 1, 2], expected: 0 }
    ],
    constraints: ["Coins may be unsorted", "Unlimited use of each coin"],
    skillKeys: ["dsa.dynamic_programming"]
  },
  {
    slug: "longest-increasing-subsequence-length",
    topic: "Dynamic Programming",
    difficulty: "HARD",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Longest Increasing Subsequence Length",
    description: "Return the length of the longest strictly increasing subsequence.",
    acceptanceText: "<p><strong>Expected:</strong> O(n log n) tails array preferred; O(n²) DP acceptable for explanation if constraints are discussed.</p>",
    testCases: [
      { input: [10, 9, 2, 5, 3, 7, 101, 18], expected: 4 },
      { input: [3, 3, 3], expected: 1 },
      { input: [1, 2, 3, 4], expected: 4 }
    ],
    constraints: ["Strictly increasing, not non-decreasing"],
    skillKeys: ["dsa.dynamic_programming", "dsa.binary_search"]
  },
  {
    slug: "decode-ways-count",
    topic: "Dynamic Programming",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Decode Ways Count",
    description: "Digits are provided as numbers 0..9. Treat them as a digit string where 1=A through 26=Z. Return the number of valid decodings.",
    acceptanceText: "<p><strong>Expected:</strong> DP over positions with single-digit and two-digit transitions. Zero handling is the key edge case.</p>",
    testCases: [
      { input: [1, 2], expected: 2 },
      { input: [2, 2, 6], expected: 3 },
      { input: [0], expected: 0 }
    ],
    constraints: ["Each input value should be treated as one digit"],
    skillKeys: ["dsa.dynamic_programming", "dsa.strings"]
  },
  {
    slug: "edit-distance-lite",
    topic: "Dynamic Programming",
    difficulty: "HARD",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Edit Distance Lite",
    description: "The first number is split index. Values before split are the first sequence, values after split are the second sequence. Return the minimum insert/delete/replace operations needed to transform the first sequence into the second.",
    acceptanceText: "<p><strong>Expected:</strong> Classic 2D DP with base cases for empty prefixes. Rolling rows are a good optimization.</p>",
    testCases: [
      { input: [3, 1, 2, 3, 1, 3], expected: 1 },
      { input: [0, 4, 5], expected: 2 },
      { input: [2, 7, 8, 7, 8], expected: 0 }
    ],
    constraints: ["First value gives length of first sequence"],
    skillKeys: ["dsa.dynamic_programming"]
  },
  {
    slug: "longest-palindromic-subsequence",
    topic: "Dynamic Programming",
    difficulty: "HARD",
    company: "Netflix",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Longest Palindromic Subsequence",
    description: "Values represent characters. Return the length of the longest palindromic subsequence.",
    acceptanceText: "<p><strong>Expected:</strong> Interval DP from shorter ranges to longer ranges.</p>",
    testCases: [
      { input: [1, 2, 2, 1], expected: 4 },
      { input: [1, 2, 3, 2, 1], expected: 5 },
      { input: [1, 2, 3], expected: 1 }
    ],
    constraints: ["Subsequence, not substring"],
    skillKeys: ["dsa.dynamic_programming"]
  },
  {
    slug: "partition-equal-subset",
    topic: "Dynamic Programming",
    difficulty: "MEDIUM",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Partition Equal Subset",
    description: "Return 1 if the array can be partitioned into two subsets with equal sum, otherwise return 0.",
    acceptanceText: "<p><strong>Expected:</strong> Subset-sum DP up to total/2. Reject odd total sum immediately.</p>",
    testCases: [
      { input: [1, 5, 11, 5], expected: 1 },
      { input: [1, 2, 3, 5], expected: 0 },
      { input: [], expected: 1 }
    ],
    constraints: ["Values are non-negative"],
    skillKeys: ["dsa.dynamic_programming"]
  },
  {
    slug: "valid-parentheses-score",
    topic: "Stack",
    difficulty: "EASY",
    company: "TCS",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Valid Parentheses Score",
    description: "Values encode brackets: 1='(', 2=')', 3='[', 4=']', 5='{', 6='}'. Return 1 if the sequence is valid, otherwise 0.",
    acceptanceText: "<p><strong>Expected:</strong> Stack of expected closing brackets. Fail fast on mismatches and leftover openings.</p>",
    testCases: [
      { input: [1, 3, 4, 2], expected: 1 },
      { input: [1, 3, 2, 4], expected: 0 },
      { input: [], expected: 1 }
    ],
    constraints: ["Ignore no values; every value is a bracket token"],
    skillKeys: ["dsa.stack"]
  },
  {
    slug: "min-stack-final-minimum",
    topic: "Stack",
    difficulty: "MEDIUM",
    company: "Razorpay",
    companyTags: ["STARTUP", "PRODUCT_BASED"],
    heading: "Min Stack Final Minimum",
    description: "Operations are encoded as pairs: op,value. op=1 means push value, op=2 means pop and value is ignored. Return the current minimum after all operations, or 0 if the stack is empty.",
    acceptanceText: "<p><strong>Expected:</strong> Maintain a second stack of minimums or store value/currentMin pairs.</p>",
    testCases: [
      { input: [1, 3, 1, 5, 1, 2, 2, 0], expected: 3 },
      { input: [1, 4, 1, 1], expected: 1 },
      { input: [2, 0], expected: 0 }
    ],
    constraints: ["Input length is even", "Pop on empty stack should be ignored"],
    skillKeys: ["dsa.stack"]
  },
  {
    slug: "trapping-rain-water",
    topic: "Two Pointers",
    difficulty: "HARD",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Trapping Rain Water",
    description: "Each value is an elevation height. Return how many units of water can be trapped after raining.",
    acceptanceText: "<p><strong>Expected:</strong> Two pointers with leftMax/rightMax, or prefix/suffix maxima. Explain why water is bounded by the smaller side.</p>",
    testCases: [
      { input: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], expected: 6 },
      { input: [4, 2, 0, 3, 2, 5], expected: 9 },
      { input: [1, 2, 3], expected: 0 }
    ],
    constraints: ["Heights are non-negative"],
    skillKeys: ["dsa.two_pointers", "dsa.arrays"]
  },
  {
    slug: "container-with-most-water",
    topic: "Two Pointers",
    difficulty: "MEDIUM",
    company: "Uber",
    companyTags: ["PRODUCT_BASED", "MNC"],
    heading: "Container With Most Water",
    description: "Each value is a vertical line height. Return the maximum area formed by choosing two lines.",
    acceptanceText: "<p><strong>Expected:</strong> Two pointers moving the smaller height inward because width only decreases.</p>",
    testCases: [
      { input: [1, 8, 6, 2, 5, 4, 8, 3, 7], expected: 49 },
      { input: [1, 1], expected: 1 },
      { input: [1], expected: 0 }
    ],
    constraints: ["Area uses distance between indices"],
    skillKeys: ["dsa.two_pointers", "dsa.greedy"]
  },
  {
    slug: "stock-profit-with-cooldown",
    topic: "Dynamic Programming",
    difficulty: "MEDIUM",
    company: "Zerodha",
    companyTags: ["STARTUP", "PRODUCT_BASED"],
    heading: "Stock Profit With Cooldown",
    description: "Each value is a stock price. You may buy/sell multiple times, but after selling you must cooldown for one day. Return maximum profit.",
    acceptanceText: "<p><strong>Expected:</strong> DP states for hold, sold, and rest. Avoid greedy local decisions.</p>",
    testCases: [
      { input: [1, 2, 3, 0, 2], expected: 3 },
      { input: [1], expected: 0 },
      { input: [6, 1, 3, 2, 4, 7], expected: 6 }
    ],
    constraints: ["One share max at a time"],
    skillKeys: ["dsa.dynamic_programming"]
  },
  {
    slug: "subarray-sum-equals-k",
    topic: "Prefix Sums",
    difficulty: "MEDIUM",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Subarray Sum Equals K",
    description: "The first number is k. Remaining values may be positive, zero, or negative. Return the number of contiguous subarrays whose sum equals k.",
    acceptanceText: "<p><strong>Expected:</strong> Prefix sum frequency map. Sliding window is not valid when negatives exist.</p>",
    testCases: [
      { input: [2, 1, 1, 1], expected: 2 },
      { input: [0, 0, 0], expected: 3 },
      { input: [3, 1, 2, 3], expected: 2 }
    ],
    constraints: ["Values can be negative", "First value is k"],
    skillKeys: ["dsa.prefix_sums", "dsa.hashing"]
  },
  {
    slug: "longest-consecutive-sequence",
    topic: "Hashing",
    difficulty: "MEDIUM",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Longest Consecutive Sequence",
    description: "Return the length of the longest consecutive integer sequence, regardless of original order.",
    acceptanceText: "<p><strong>Expected:</strong> Hash set and only start counting at sequence starts where value - 1 is absent.</p>",
    testCases: [
      { input: [100, 4, 200, 1, 3, 2], expected: 4 },
      { input: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1], expected: 9 },
      { input: [], expected: 0 }
    ],
    constraints: ["O(n) target solution"],
    skillKeys: ["dsa.hashing"]
  },
  {
    slug: "first-missing-positive",
    topic: "Arrays",
    difficulty: "HARD",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "First Missing Positive",
    description: "Return the smallest positive integer missing from the array.",
    acceptanceText: "<p><strong>Expected:</strong> In-place cyclic placement or sign marking. Sorting is simpler but not optimal.</p>",
    testCases: [
      { input: [1, 2, 0], expected: 3 },
      { input: [3, 4, -1, 1], expected: 2 },
      { input: [7, 8, 9, 11, 12], expected: 1 }
    ],
    constraints: ["Aim for O(n) time and O(1) extra space"],
    skillKeys: ["dsa.arrays"]
  },
  {
    slug: "missing-number-xor",
    topic: "Bit Manipulation",
    difficulty: "EASY",
    company: "TCS",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Missing Number XOR",
    description: "The array contains n distinct numbers from 0..n with exactly one missing. Return the missing number.",
    acceptanceText: "<p><strong>Expected:</strong> XOR all indices and values, or use arithmetic sum with overflow awareness.</p>",
    testCases: [
      { input: [3, 0, 1], expected: 2 },
      { input: [0, 1], expected: 2 },
      { input: [9, 6, 4, 2, 3, 5, 7, 0, 1], expected: 8 }
    ],
    constraints: ["Values are distinct and in 0..n"],
    skillKeys: ["dsa.bit_manipulation", "dsa.arrays"]
  },
  {
    slug: "single-number-xor",
    topic: "Bit Manipulation",
    difficulty: "EASY",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Single Number XOR",
    description: "Every value appears exactly twice except one value that appears once. Return that unique value.",
    acceptanceText: "<p><strong>Expected:</strong> XOR cancellation in one pass with O(1) space.</p>",
    testCases: [
      { input: [2, 2, 1], expected: 1 },
      { input: [4, 1, 2, 1, 2], expected: 4 },
      { input: [1], expected: 1 }
    ],
    constraints: ["Exactly one value appears once"],
    skillKeys: ["dsa.bit_manipulation"]
  },
  {
    slug: "counting-bits-total",
    topic: "Bit Manipulation",
    difficulty: "MEDIUM",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Counting Bits Total",
    description: "The first number is n. For every integer from 0 to n, count set bits. Return the sum of those counts.",
    acceptanceText: "<p><strong>Expected:</strong> DP relation bits[i] = bits[i >> 1] + (i & 1), or Brian Kernighan with complexity discussion.</p>",
    testCases: [
      { input: [5], expected: 7 },
      { input: [2], expected: 2 },
      { input: [0], expected: 0 }
    ],
    constraints: ["0 <= n <= 1000000"],
    skillKeys: ["dsa.bit_manipulation", "dsa.dynamic_programming"]
  },
  {
    slug: "trie-prefix-count",
    topic: "Trie",
    difficulty: "MEDIUM",
    company: "Atlassian",
    companyTags: ["PRODUCT_BASED", "MNC"],
    heading: "Trie Prefix Count",
    description: "Values encode words separated by 0. The final word after the last 0 is the prefix. Return how many previous words start with that prefix.",
    acceptanceText: "<p><strong>Expected:</strong> Build a trie with prefix counts or compare strings after parsing. Trie is the target signal.</p>",
    testCases: [
      { input: [1, 2, 0, 1, 2, 3, 0, 1, 4, 0, 1, 2], expected: 2 },
      { input: [5, 0, 6, 0, 7], expected: 0 },
      { input: [1, 2], expected: 0 }
    ],
    constraints: ["0 separates encoded words", "Final segment is the query prefix"],
    skillKeys: ["dsa.trie", "dsa.strings"]
  },
  {
    slug: "word-break-encoded",
    topic: "Dynamic Programming",
    difficulty: "HARD",
    company: "Netflix",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Word Break Encoded",
    description: "Values encode dictionary words separated by 0, then -1, then the target sequence. Return 1 if the target can be segmented into dictionary words, otherwise 0.",
    acceptanceText: "<p><strong>Expected:</strong> DP over target positions with dictionary lookup; trie optimization is a bonus.</p>",
    testCases: [
      { input: [1, 2, 0, 3, 0, -1, 1, 2, 3], expected: 1 },
      { input: [1, 0, 2, 0, -1, 1, 2, 1], expected: 1 },
      { input: [1, 2, 0, -1, 1, 3], expected: 0 }
    ],
    constraints: ["Dictionary appears before -1", "Target appears after -1"],
    skillKeys: ["dsa.dynamic_programming", "dsa.trie"]
  },
  {
    slug: "lru-cache-hit-count",
    topic: "Design",
    difficulty: "HARD",
    company: "Razorpay",
    companyTags: ["STARTUP", "PRODUCT_BASED"],
    heading: "LRU Cache Hit Count",
    description: "The first number is capacity. Remaining values are page requests. Simulate an LRU cache and return the number of cache hits.",
    acceptanceText: "<p><strong>Expected:</strong> Hash map plus doubly linked list concept, or ordered map. Explain O(1) get/put behavior.</p>",
    testCases: [
      { input: [2, 1, 2, 1, 3, 1, 2], expected: 2 },
      { input: [1, 1, 2, 1], expected: 0 },
      { input: [0, 1, 1], expected: 0 }
    ],
    constraints: ["First value is cache capacity", "Return hit count only"],
    skillKeys: ["dsa.design", "dsa.hashing"]
  },
  {
    slug: "serialize-tree-validity",
    topic: "Trees",
    difficulty: "MEDIUM",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Preorder Serialization Validity",
    description: "Values encode preorder traversal of a binary tree, where -1 means null. Return 1 if the serialization is valid, otherwise 0.",
    acceptanceText: "<p><strong>Expected:</strong> Slot counting: non-null consumes one slot and creates two, null consumes one.</p>",
    testCases: [
      { input: [9, 3, 4, -1, -1, 1, -1, -1, 2, -1, 6, -1, -1], expected: 1 },
      { input: [1, -1], expected: 0 },
      { input: [-1], expected: 1 }
    ],
    constraints: ["-1 represents null"],
    skillKeys: ["dsa.trees"]
  },
  {
    slug: "max-path-sum-binary-tree",
    topic: "Trees",
    difficulty: "HARD",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Binary Tree Maximum Path Sum",
    description: "Treat values as level-order binary tree nodes where -100000 marks missing. Return the maximum path sum between any two nodes.",
    acceptanceText: "<p><strong>Expected:</strong> DFS returning best downward gain while updating a global best through each node.</p>",
    testCases: [
      { input: [1, 2, 3], expected: 6 },
      { input: [-10, 9, 20, -100000, -100000, 15, 7], expected: 42 },
      { input: [-3], expected: -3 }
    ],
    constraints: ["-100000 marks missing", "Path may start and end at any nodes"],
    skillKeys: ["dsa.trees", "dsa.dynamic_programming"]
  },
  {
    slug: "remove-duplicates-sorted-length",
    topic: "Arrays",
    difficulty: "EASY",
    company: "TCS",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Remove Duplicates Sorted Length",
    description: "The array is sorted in non-decreasing order. Return the length after removing duplicates in-place conceptually, keeping only one copy of each distinct value.",
    acceptanceText: "<p><strong>Expected:</strong> Two-pointer write index. Count unique values without allocating a new array for the intended solution.</p>",
    testCases: [
      { input: [1, 1, 2], expected: 2 },
      { input: [0, 0, 1, 1, 1, 2, 2, 3], expected: 4 },
      { input: [], expected: 0 }
    ],
    constraints: ["Input is sorted", "Return the final unique length"],
    skillKeys: ["dsa.arrays", "dsa.two_pointers"]
  },
  {
    slug: "move-zeroes-stability-score",
    topic: "Arrays",
    difficulty: "EASY",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Move Zeroes Stability Score",
    description: "Move all zeroes to the end while preserving the relative order of non-zero values. Return the sum of index * value after the move.",
    acceptanceText: "<p><strong>Expected:</strong> Stable compaction with a write pointer, then fill zeros. The score verifies order preservation.</p>",
    testCases: [
      { input: [0, 1, 0, 3, 12], expected: 33 },
      { input: [0, 0, 1], expected: 0 },
      { input: [4, 0, 5], expected: 5 }
    ],
    constraints: ["Preserve non-zero order", "Score uses 0-based indices"],
    skillKeys: ["dsa.arrays", "dsa.two_pointers"]
  },
  {
    slug: "rotate-array-checksum",
    topic: "Arrays",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Rotate Array Checksum",
    description: "The first number is k. Rotate the remaining array to the right by k positions. Return the weighted checksum sum(index * value) of the rotated array.",
    acceptanceText: "<p><strong>Expected:</strong> Normalize k by n and use reversal or cyclic replacement. Handle empty arrays.</p>",
    testCases: [
      { input: [3, 1, 2, 3, 4, 5, 6, 7], expected: 70 },
      { input: [2, -1, -100, 3, 99], expected: -203 },
      { input: [5], expected: 0 }
    ],
    constraints: ["First value is k", "Checksum uses remaining array after rotation"],
    skillKeys: ["dsa.arrays"]
  },
  {
    slug: "sort-colors-transition-count",
    topic: "Arrays",
    difficulty: "MEDIUM",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Sort Colors Transition Count",
    description: "Values are only 0, 1, and 2. After sorting them in-place conceptually, return the number of adjacent transitions where values differ.",
    acceptanceText: "<p><strong>Expected:</strong> Dutch national flag three-pointer partition. The returned transition count validates the sorted grouping.</p>",
    testCases: [
      { input: [2, 0, 2, 1, 1, 0], expected: 2 },
      { input: [1, 1, 1], expected: 0 },
      { input: [2, 0], expected: 1 }
    ],
    constraints: ["Values are 0, 1, or 2"],
    skillKeys: ["dsa.arrays", "dsa.two_pointers"]
  },
  {
    slug: "next-permutation-checksum",
    topic: "Arrays",
    difficulty: "MEDIUM",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Next Permutation Checksum",
    description: "Transform the array into the next lexicographical permutation. If none exists, transform it into ascending order. Return sum(index * value) after the transformation.",
    acceptanceText: "<p><strong>Expected:</strong> Find the first decreasing pivot from the right, swap with the next larger suffix value, then reverse the suffix.</p>",
    testCases: [
      { input: [1, 2, 3], expected: 7 },
      { input: [3, 2, 1], expected: 4 },
      { input: [1, 1, 5], expected: 7 }
    ],
    constraints: ["Return checksum, not the array"],
    skillKeys: ["dsa.arrays"]
  },
  {
    slug: "array-leaders-count",
    topic: "Arrays",
    difficulty: "EASY",
    company: "Infosys",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Array Leaders Count",
    description: "A leader is an element greater than every element to its right. Return the number of leaders in the array.",
    acceptanceText: "<p><strong>Expected:</strong> Scan from right to left while tracking the maximum value seen so far.</p>",
    testCases: [
      { input: [16, 17, 4, 3, 5, 2], expected: 3 },
      { input: [5, 4, 3, 2, 1], expected: 5 },
      { input: [], expected: 0 }
    ],
    constraints: ["Strictly greater than all values to the right"],
    skillKeys: ["dsa.arrays"]
  },
  {
    slug: "equilibrium-index-first",
    topic: "Prefix Sums",
    difficulty: "EASY",
    company: "TCS",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "First Equilibrium Index",
    description: "Return the first index where the sum of values on the left equals the sum of values on the right. Return -1 if none exists.",
    acceptanceText: "<p><strong>Expected:</strong> Use total sum and a running prefix. Do not recompute left/right sums for every index.</p>",
    testCases: [
      { input: [-7, 1, 5, 2, -4, 3, 0], expected: 3 },
      { input: [1, 2, 3], expected: -1 },
      { input: [0], expected: 0 }
    ],
    constraints: ["Return first valid index"],
    skillKeys: ["dsa.prefix_sums", "dsa.arrays"]
  },
  {
    slug: "range-sum-query-total",
    topic: "Prefix Sums",
    difficulty: "EASY",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Range Sum Query Total",
    description: "The first number is n. The next n values are the array. Remaining values are query pairs l,r. Return the sum of all range-query sums.",
    acceptanceText: "<p><strong>Expected:</strong> Build prefix sums once and answer each inclusive query in O(1).</p>",
    testCases: [
      { input: [5, 1, 2, 3, 4, 5, 0, 2, 1, 3], expected: 15 },
      { input: [3, -1, 2, 4, 0, 2], expected: 5 },
      { input: [0], expected: 0 }
    ],
    constraints: ["Queries are inclusive", "Ignore incomplete trailing query"],
    skillKeys: ["dsa.prefix_sums"]
  },
  {
    slug: "maximum-average-window-floor",
    topic: "Sliding Window",
    difficulty: "EASY",
    company: "Netflix",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Maximum Average Window Floor",
    description: "The first number is k. Remaining values are scores. Return the floor of the maximum average over every contiguous window of length k.",
    acceptanceText: "<p><strong>Expected:</strong> Fixed-size sliding window. Track max window sum and divide once at the end.</p>",
    testCases: [
      { input: [4, 1, 12, -5, -6, 50, 3], expected: 12 },
      { input: [1, 5], expected: 5 },
      { input: [3, 1, 2], expected: 0 }
    ],
    constraints: ["Return 0 if k is invalid or larger than array length"],
    skillKeys: ["dsa.sliding_window"]
  },
  {
    slug: "max-consecutive-ones-with-flips",
    topic: "Sliding Window",
    difficulty: "MEDIUM",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Max Consecutive Ones With Flips",
    description: "The first number is k. Remaining values are binary bits. Return the longest contiguous segment containing only 1s after flipping at most k zeroes.",
    acceptanceText: "<p><strong>Expected:</strong> Sliding window with a zero count, shrinking while zeroes exceed k.</p>",
    testCases: [
      { input: [2, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], expected: 6 },
      { input: [0, 0, 0, 1], expected: 1 },
      { input: [1, 0, 0, 1, 1], expected: 2 }
    ],
    constraints: ["Values after k are 0 or 1"],
    skillKeys: ["dsa.sliding_window", "dsa.two_pointers"]
  },
  {
    slug: "fruit-into-baskets-length",
    topic: "Sliding Window",
    difficulty: "MEDIUM",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Fruit Into Baskets Length",
    description: "Each value is a fruit type. You have two baskets and each basket can hold one type. Return the longest contiguous segment containing at most two distinct values.",
    acceptanceText: "<p><strong>Expected:</strong> Sliding window with a frequency map of at most two types.</p>",
    testCases: [
      { input: [1, 2, 1], expected: 3 },
      { input: [0, 1, 2, 2], expected: 3 },
      { input: [1, 2, 3, 2, 2], expected: 4 }
    ],
    constraints: ["At most two distinct values in chosen window"],
    skillKeys: ["dsa.sliding_window", "dsa.hashing"]
  },
  {
    slug: "permutation-inclusion-binary",
    topic: "Sliding Window",
    difficulty: "MEDIUM",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Permutation Inclusion Binary",
    description: "The first number is m. The next m values are a pattern. Remaining values are a stream. Return 1 if any window in the stream is a permutation of the pattern, otherwise 0.",
    acceptanceText: "<p><strong>Expected:</strong> Compare frequency counts over a fixed-size window, updating counts incrementally.</p>",
    testCases: [
      { input: [2, 1, 2, 3, 1, 2, 4], expected: 1 },
      { input: [3, 1, 2, 3, 1, 1, 2], expected: 0 },
      { input: [1, 5, 5], expected: 1 }
    ],
    constraints: ["First number is pattern length"],
    skillKeys: ["dsa.sliding_window", "dsa.hashing"]
  },
  {
    slug: "minimum-window-cover-length",
    topic: "Sliding Window",
    difficulty: "HARD",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Minimum Window Cover Length",
    description: "The first number is m. The next m values are required tokens. Remaining values are the stream. Return the length of the smallest window containing every required token with multiplicity, or 0.",
    acceptanceText: "<p><strong>Expected:</strong> Variable window with need/have counts and a formed counter. Shrink only while all requirements are satisfied.</p>",
    testCases: [
      { input: [3, 1, 2, 2, 5, 1, 2, 3, 2, 1], expected: 4 },
      { input: [2, 7, 8, 1, 2, 3], expected: 0 },
      { input: [1, 4, 4], expected: 1 }
    ],
    constraints: ["Required tokens may repeat"],
    skillKeys: ["dsa.sliding_window", "dsa.hashing"]
  },
  {
    slug: "three-sum-zero-count",
    topic: "Two Pointers",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Three Sum Zero Count",
    description: "Return the number of unique triplets by value that sum to zero.",
    acceptanceText: "<p><strong>Expected:</strong> Sort, fix one value, then use two pointers while skipping duplicates.</p>",
    testCases: [
      { input: [-1, 0, 1, 2, -1, -4], expected: 2 },
      { input: [0, 0, 0, 0], expected: 1 },
      { input: [1, 2, 3], expected: 0 }
    ],
    constraints: ["Count unique triplets by value"],
    skillKeys: ["dsa.two_pointers", "dsa.sorting"]
  },
  {
    slug: "four-sum-count-target",
    topic: "Two Pointers",
    difficulty: "HARD",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Four Sum Target Count",
    description: "The first number is target. Remaining values form the array. Return the number of unique quadruplets by value whose sum equals target.",
    acceptanceText: "<p><strong>Expected:</strong> Sort, fix two indices, use two pointers, and skip duplicate values at every level.</p>",
    testCases: [
      { input: [0, 1, 0, -1, 0, -2, 2], expected: 3 },
      { input: [8, 2, 2, 2, 2, 2], expected: 1 },
      { input: [10, 1, 2, 3], expected: 0 }
    ],
    constraints: ["First value is target", "Count unique quadruplets"],
    skillKeys: ["dsa.two_pointers", "dsa.sorting"]
  },
  {
    slug: "valid-palindrome-after-one-delete",
    topic: "Two Pointers",
    difficulty: "EASY",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Valid Palindrome After One Delete",
    description: "Values represent characters. Return 1 if the sequence can become a palindrome after deleting at most one value, otherwise 0.",
    acceptanceText: "<p><strong>Expected:</strong> Two pointers and, on first mismatch, check either skipping left or skipping right.</p>",
    testCases: [
      { input: [1, 2, 3, 2, 1], expected: 1 },
      { input: [1, 2, 3, 1], expected: 1 },
      { input: [1, 2, 3, 4], expected: 0 }
    ],
    constraints: ["At most one deletion is allowed"],
    skillKeys: ["dsa.two_pointers"]
  },
  {
    slug: "squares-of-sorted-array-checksum",
    topic: "Two Pointers",
    difficulty: "EASY",
    company: "TCS",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Squares Of Sorted Array Checksum",
    description: "The array is sorted. Square every value and return sum(index * squaredValue) after sorting the squared values.",
    acceptanceText: "<p><strong>Expected:</strong> Fill from the end using two pointers comparing absolute values.</p>",
    testCases: [
      { input: [-4, -1, 0, 3, 10], expected: 467 },
      { input: [-7, -3, 2, 3, 11], expected: 658 },
      { input: [], expected: 0 }
    ],
    constraints: ["Input is sorted non-decreasing"],
    skillKeys: ["dsa.two_pointers", "dsa.arrays"]
  },
  {
    slug: "subarray-product-less-than-k",
    topic: "Sliding Window",
    difficulty: "MEDIUM",
    company: "Uber",
    companyTags: ["PRODUCT_BASED", "MNC"],
    heading: "Subarray Product Less Than K",
    description: "The first number is k. Remaining positive values form the array. Return the number of contiguous subarrays whose product is strictly less than k.",
    acceptanceText: "<p><strong>Expected:</strong> Multiplicative sliding window. If k <= 1, return 0.</p>",
    testCases: [
      { input: [100, 10, 5, 2, 6], expected: 8 },
      { input: [0, 1, 2, 3], expected: 0 },
      { input: [10, 1, 1, 1], expected: 6 }
    ],
    constraints: ["Values after k are positive"],
    skillKeys: ["dsa.sliding_window"]
  },
  {
    slug: "longest-turbulent-subarray",
    topic: "Sliding Window",
    difficulty: "MEDIUM",
    company: "Netflix",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Longest Turbulent Subarray",
    description: "Return the length of the longest contiguous subarray where comparison signs alternate between greater-than and less-than.",
    acceptanceText: "<p><strong>Expected:</strong> Track the previous comparison sign and reset correctly on equality or repeated sign.</p>",
    testCases: [
      { input: [9, 4, 2, 10, 7, 8, 8, 1, 9], expected: 5 },
      { input: [4, 8, 12, 16], expected: 2 },
      { input: [100], expected: 1 }
    ],
    constraints: ["Equal adjacent values break turbulence"],
    skillKeys: ["dsa.sliding_window"]
  },
  {
    slug: "majority-element-vote",
    topic: "Arrays",
    difficulty: "EASY",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Majority Element Vote",
    description: "Return the element that appears more than floor(n/2) times. If no such element exists, return -1.",
    acceptanceText: "<p><strong>Expected:</strong> Boyer-Moore candidate selection plus a verification pass.</p>",
    testCases: [
      { input: [3, 2, 3], expected: 3 },
      { input: [2, 2, 1, 1, 1, 2, 2], expected: 2 },
      { input: [1, 2, 3], expected: -1 }
    ],
    constraints: ["Verify the candidate before returning"],
    skillKeys: ["dsa.arrays", "dsa.greedy"]
  },
  {
    slug: "find-all-duplicates-count",
    topic: "Arrays",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Find All Duplicates Count",
    description: "Values are in the range 1..n where n is array length. Return how many distinct values appear exactly twice.",
    acceptanceText: "<p><strong>Expected:</strong> Use sign marking or cyclic placement for O(1) extra space, or a set as baseline.</p>",
    testCases: [
      { input: [4, 3, 2, 7, 8, 2, 3, 1], expected: 2 },
      { input: [1, 1, 2], expected: 1 },
      { input: [1], expected: 0 }
    ],
    constraints: ["Values are in 1..n"],
    skillKeys: ["dsa.arrays", "dsa.hashing"]
  },
  {
    slug: "set-matrix-zeroes-count",
    topic: "Arrays",
    difficulty: "MEDIUM",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Set Matrix Zeroes Count",
    description: "The first two numbers are rows and cols. Remaining values are a flattened matrix. If a cell is 0, its entire row and column become 0. Return the count of zeroes after the operation.",
    acceptanceText: "<p><strong>Expected:</strong> Mark affected rows and columns, ideally using first row/column as markers for O(1) extra space.</p>",
    testCases: [
      { input: [3, 3, 1, 1, 1, 1, 0, 1, 1, 1, 1], expected: 5 },
      { input: [2, 2, 0, 1, 1, 1], expected: 3 },
      { input: [1, 3, 1, 2, 3], expected: 0 }
    ],
    constraints: ["Matrix is flattened row-major"],
    skillKeys: ["dsa.arrays"]
  },
  {
    slug: "spiral-matrix-sum",
    topic: "Arrays",
    difficulty: "MEDIUM",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Spiral Matrix Weighted Sum",
    description: "The first two numbers are rows and cols. Remaining values are a flattened matrix. Traverse in spiral order and return sum(position * value) using 0-based spiral position.",
    acceptanceText: "<p><strong>Expected:</strong> Maintain top/bottom/left/right boundaries and shrink them after each direction.</p>",
    testCases: [
      { input: [3, 3, 1, 2, 3, 4, 5, 6, 7, 8, 9], expected: 212 },
      { input: [1, 4, 1, 2, 3, 4], expected: 20 },
      { input: [0, 0], expected: 0 }
    ],
    constraints: ["Matrix is flattened row-major"],
    skillKeys: ["dsa.arrays"]
  },
  {
    slug: "valid-anagram-encoded",
    topic: "Hashing",
    difficulty: "EASY",
    company: "TCS",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Valid Anagram Encoded",
    description: "The first number is split index. Values before split form sequence A and values after split form sequence B. Return 1 if A and B are anagrams, otherwise 0.",
    acceptanceText: "<p><strong>Expected:</strong> Frequency map with increments for A and decrements for B, then verify all counts are zero.</p>",
    testCases: [
      { input: [3, 1, 2, 3, 3, 2, 1], expected: 1 },
      { input: [2, 1, 2, 1, 1], expected: 0 },
      { input: [0], expected: 1 }
    ],
    constraints: ["First number is length of sequence A"],
    skillKeys: ["dsa.hashing"]
  },
  {
    slug: "group-anagram-largest-size",
    topic: "Hashing",
    difficulty: "MEDIUM",
    company: "Atlassian",
    companyTags: ["PRODUCT_BASED", "MNC"],
    heading: "Group Anagram Largest Size",
    description: "Words are encoded as positive values separated by 0. Return the size of the largest anagram group.",
    acceptanceText: "<p><strong>Expected:</strong> Canonicalize each word by sorted token sequence or frequency signature and count group sizes.</p>",
    testCases: [
      { input: [1, 2, 0, 2, 1, 0, 3, 0], expected: 2 },
      { input: [4, 5, 0, 6, 7, 0], expected: 1 },
      { input: [], expected: 0 }
    ],
    constraints: ["0 separates words"],
    skillKeys: ["dsa.hashing", "dsa.strings"]
  },
  {
    slug: "isomorphic-sequences",
    topic: "Hashing",
    difficulty: "EASY",
    company: "Infosys",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Isomorphic Sequences",
    description: "The first number is split index. Values before split form A and values after split form B. Return 1 if a one-to-one mapping can transform A into B.",
    acceptanceText: "<p><strong>Expected:</strong> Maintain maps in both directions to prevent two values mapping to the same target.</p>",
    testCases: [
      { input: [3, 1, 2, 1, 7, 8, 7], expected: 1 },
      { input: [3, 1, 2, 1, 7, 7, 8], expected: 0 },
      { input: [2, 1, 2, 9], expected: 0 }
    ],
    constraints: ["Sequences must have equal length"],
    skillKeys: ["dsa.hashing"]
  },
  {
    slug: "ransom-note-possible",
    topic: "Hashing",
    difficulty: "EASY",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Ransom Note Possible",
    description: "The first number is m. The next m values are required tokens. Remaining values are available magazine tokens. Return 1 if the required tokens can be constructed, otherwise 0.",
    acceptanceText: "<p><strong>Expected:</strong> Count available tokens, then consume required tokens without going negative.</p>",
    testCases: [
      { input: [2, 1, 2, 2, 1, 3], expected: 1 },
      { input: [2, 1, 1, 1], expected: 0 },
      { input: [0, 5, 6], expected: 1 }
    ],
    constraints: ["First number is required length"],
    skillKeys: ["dsa.hashing"]
  },
  {
    slug: "longest-harmonious-subsequence",
    topic: "Hashing",
    difficulty: "EASY",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Longest Harmonious Subsequence",
    description: "Return the length of the longest subsequence where max value and min value differ by exactly 1.",
    acceptanceText: "<p><strong>Expected:</strong> Frequency map and check count[x] + count[x + 1] for every present x.</p>",
    testCases: [
      { input: [1, 3, 2, 2, 5, 2, 3, 7], expected: 5 },
      { input: [1, 1, 1, 1], expected: 0 },
      { input: [1, 2, 3, 4], expected: 2 }
    ],
    constraints: ["Subsequence need not be contiguous"],
    skillKeys: ["dsa.hashing"]
  },
  {
    slug: "least-recent-duplicate-distance",
    topic: "Hashing",
    difficulty: "MEDIUM",
    company: "Razorpay",
    companyTags: ["STARTUP", "PRODUCT_BASED"],
    heading: "Nearest Duplicate Distance",
    description: "Return the minimum distance between two equal values. Return -1 if no value repeats.",
    acceptanceText: "<p><strong>Expected:</strong> Track last index for each value and update the best distance on repeats.</p>",
    testCases: [
      { input: [1, 2, 3, 1, 2, 3, 2], expected: 2 },
      { input: [1, 2, 3], expected: -1 },
      { input: [5, 5], expected: 1 }
    ],
    constraints: ["Distance is absolute index difference"],
    skillKeys: ["dsa.hashing"]
  },
  {
    slug: "longest-zero-sum-subarray",
    topic: "Prefix Sums",
    difficulty: "MEDIUM",
    company: "Zerodha",
    companyTags: ["STARTUP", "PRODUCT_BASED"],
    heading: "Longest Zero Sum Subarray",
    description: "Return the length of the longest contiguous subarray whose sum is zero.",
    acceptanceText: "<p><strong>Expected:</strong> Prefix sum to earliest index map. Repeated prefix sums identify zero-sum windows.</p>",
    testCases: [
      { input: [15, -2, 2, -8, 1, 7, 10, 23], expected: 5 },
      { input: [1, 2, 3], expected: 0 },
      { input: [1, -1, 3, -3], expected: 4 }
    ],
    constraints: ["Values can be negative"],
    skillKeys: ["dsa.prefix_sums", "dsa.hashing"]
  },
  {
    slug: "contiguous-array-equal-zero-one",
    topic: "Prefix Sums",
    difficulty: "MEDIUM",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Contiguous Array Equal Zero One",
    description: "Values are binary. Return the maximum length of a contiguous subarray with the same number of 0s and 1s.",
    acceptanceText: "<p><strong>Expected:</strong> Treat 0 as -1 and use earliest prefix balance positions.</p>",
    testCases: [
      { input: [0, 1], expected: 2 },
      { input: [0, 1, 0], expected: 2 },
      { input: [0, 0, 1, 0, 0, 0, 1, 1], expected: 6 }
    ],
    constraints: ["Input values are 0 or 1"],
    skillKeys: ["dsa.prefix_sums", "dsa.hashing"]
  },
  {
    slug: "asteroid-collision-survivor-sum",
    topic: "Stack",
    difficulty: "MEDIUM",
    company: "Uber",
    companyTags: ["PRODUCT_BASED", "MNC"],
    heading: "Asteroid Collision Survivor Sum",
    description: "Positive values move right and negative values move left. Equal sizes destroy each other. Return the sum of surviving asteroids.",
    acceptanceText: "<p><strong>Expected:</strong> Stack of right-moving asteroids and collision resolution while the incoming asteroid moves left.</p>",
    testCases: [
      { input: [5, 10, -5], expected: 15 },
      { input: [8, -8], expected: 0 },
      { input: [10, 2, -5], expected: 10 }
    ],
    constraints: ["Zero values are not used"],
    skillKeys: ["dsa.stack"]
  },
  {
    slug: "remove-k-digits-min-number",
    topic: "Monotonic Stack",
    difficulty: "MEDIUM",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Remove K Digits Minimum Number",
    description: "The first number is k. Remaining values are digits of a non-negative number. Remove exactly k digits to make the smallest possible number. Return the resulting number.",
    acceptanceText: "<p><strong>Expected:</strong> Monotonic increasing stack, pop larger previous digits while k remains, strip leading zeroes.</p>",
    testCases: [
      { input: [3, 1, 4, 3, 2, 2, 1, 9], expected: 1219 },
      { input: [1, 1, 0, 2, 0, 0], expected: 200 },
      { input: [2, 1, 0], expected: 0 }
    ],
    constraints: ["Digits are 0..9", "Return numeric value after removal"],
    skillKeys: ["dsa.monotonic_stack", "dsa.greedy"]
  },
  {
    slug: "stock-span-total",
    topic: "Monotonic Stack",
    difficulty: "MEDIUM",
    company: "Zerodha",
    companyTags: ["STARTUP", "PRODUCT_BASED"],
    heading: "Stock Span Total",
    description: "Each value is a daily price. For every day, span is the number of consecutive previous days including today with price <= today. Return the sum of spans.",
    acceptanceText: "<p><strong>Expected:</strong> Monotonic decreasing stack storing price and accumulated span.</p>",
    testCases: [
      { input: [100, 80, 60, 70, 60, 75, 85], expected: 15 },
      { input: [10, 20, 30], expected: 6 },
      { input: [30, 20, 10], expected: 3 }
    ],
    constraints: ["Return sum of all spans"],
    skillKeys: ["dsa.monotonic_stack", "dsa.stack"]
  },
  {
    slug: "sliding-window-maximum-sum",
    topic: "Monotonic Queue",
    difficulty: "HARD",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Sliding Window Maximum Sum",
    description: "The first number is k. Remaining values are the array. For every contiguous window of length k, compute the maximum. Return the sum of these maximum values.",
    acceptanceText: "<p><strong>Expected:</strong> Monotonic deque of indices. Remove expired indices and smaller trailing values.</p>",
    testCases: [
      { input: [3, 1, 3, -1, -3, 5, 3, 6, 7], expected: 29 },
      { input: [1, 5], expected: 5 },
      { input: [4, 1, 2], expected: 0 }
    ],
    constraints: ["Return 0 if k is invalid"],
    skillKeys: ["dsa.monotonic_queue", "dsa.sliding_window"]
  },
  {
    slug: "maximal-rectangle-binary-matrix",
    topic: "Monotonic Stack",
    difficulty: "HARD",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Maximal Rectangle Binary Matrix",
    description: "The first two numbers are rows and cols. Remaining values are a flattened binary matrix. Return the largest all-1 rectangle area.",
    acceptanceText: "<p><strong>Expected:</strong> Convert each row into histogram heights and apply largest-rectangle-in-histogram per row.</p>",
    testCases: [
      { input: [4, 5, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0], expected: 6 },
      { input: [1, 1, 0], expected: 0 },
      { input: [1, 1, 1], expected: 1 }
    ],
    constraints: ["Matrix values are 0 or 1"],
    skillKeys: ["dsa.monotonic_stack", "dsa.dynamic_programming"]
  },
  {
    slug: "next-greater-circular-sum",
    topic: "Monotonic Stack",
    difficulty: "MEDIUM",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Next Greater Circular Sum",
    description: "For every value in a circular array, find the next greater value. Use 0 if absent. Return the sum of all next greater values.",
    acceptanceText: "<p><strong>Expected:</strong> Iterate indices twice from right to left with a decreasing stack.</p>",
    testCases: [
      { input: [1, 2, 1], expected: 4 },
      { input: [5, 4, 3], expected: 10 },
      { input: [2, 2, 2], expected: 0 }
    ],
    constraints: ["Array is circular"],
    skillKeys: ["dsa.monotonic_stack"]
  },
  {
    slug: "sum-subarray-minimums",
    topic: "Monotonic Stack",
    difficulty: "HARD",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Sum Of Subarray Minimums",
    description: "Return the sum of the minimum value of every contiguous subarray.",
    acceptanceText: "<p><strong>Expected:</strong> Use previous-less and next-less-or-equal boundaries to count each value's contribution.</p>",
    testCases: [
      { input: [3, 1, 2, 4], expected: 17 },
      { input: [11, 81, 94, 43, 3], expected: 444 },
      { input: [1], expected: 1 }
    ],
    constraints: ["Discuss modulo if values are large, but test outputs are raw integers"],
    skillKeys: ["dsa.monotonic_stack"]
  },
  {
    slug: "first-and-last-position-span",
    topic: "Binary Search",
    difficulty: "MEDIUM",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "First And Last Position Span",
    description: "The first number is target. Remaining values are sorted. Return lastIndex - firstIndex + 1 for target, or 0 if target is absent.",
    acceptanceText: "<p><strong>Expected:</strong> Run lower-bound searches for target and target + 1. Avoid linear scanning after finding one occurrence.</p>",
    testCases: [
      { input: [8, 5, 7, 7, 8, 8, 10], expected: 2 },
      { input: [6, 5, 7, 7, 8, 8, 10], expected: 0 },
      { input: [1, 1, 1, 1], expected: 3 }
    ],
    constraints: ["Remaining values are sorted non-decreasing"],
    skillKeys: ["dsa.binary_search"]
  },
  {
    slug: "sqrt-floor",
    topic: "Binary Search",
    difficulty: "EASY",
    company: "TCS",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Integer Square Root Floor",
    description: "The first number is x. Return floor(sqrt(x)) without using a built-in square root function.",
    acceptanceText: "<p><strong>Expected:</strong> Binary search the answer from 0..x and compare mid <= x / mid to avoid overflow.</p>",
    testCases: [
      { input: [4], expected: 2 },
      { input: [8], expected: 2 },
      { input: [0], expected: 0 }
    ],
    constraints: ["0 <= x <= 2147483647"],
    skillKeys: ["dsa.binary_search"]
  },
  {
    slug: "peak-element-index",
    topic: "Binary Search",
    difficulty: "MEDIUM",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Peak Element Index",
    description: "Return any peak index where nums[i] is greater than its neighbors. For deterministic scoring, return the peak found by the standard binary-search rule that moves right when nums[mid] < nums[mid + 1].",
    acceptanceText: "<p><strong>Expected:</strong> Binary search on the slope. This works because a peak must exist in the direction of increasing slope.</p>",
    testCases: [
      { input: [1, 2, 3, 1], expected: 2 },
      { input: [1, 2, 1, 3, 5, 6, 4], expected: 5 },
      { input: [1], expected: 0 }
    ],
    constraints: ["Use virtual -infinity outside array bounds"],
    skillKeys: ["dsa.binary_search"]
  },
  {
    slug: "find-min-rotated-sorted",
    topic: "Binary Search",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Find Minimum In Rotated Sorted Array",
    description: "The array is a rotated sorted array with distinct values. Return the minimum value.",
    acceptanceText: "<p><strong>Expected:</strong> Compare mid with right boundary to decide which half contains the minimum.</p>",
    testCases: [
      { input: [3, 4, 5, 1, 2], expected: 1 },
      { input: [4, 5, 6, 7, 0, 1, 2], expected: 0 },
      { input: [11, 13, 15, 17], expected: 11 }
    ],
    constraints: ["Values are distinct"],
    skillKeys: ["dsa.binary_search"]
  },
  {
    slug: "aggressive-cows-distance",
    topic: "Binary Search",
    difficulty: "HARD",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Aggressive Cows Maximum Distance",
    description: "The first number is k cows. Remaining values are stall positions. Return the largest minimum distance possible between any two placed cows.",
    acceptanceText: "<p><strong>Expected:</strong> Sort positions, binary search distance, and greedily test if k cows can be placed.</p>",
    testCases: [
      { input: [3, 1, 2, 4, 8, 9], expected: 3 },
      { input: [2, 5, 4, 3, 2, 1], expected: 4 },
      { input: [4, 1, 2, 3], expected: 0 }
    ],
    constraints: ["First value is k", "Return 0 when placement is impossible"],
    skillKeys: ["dsa.binary_search", "dsa.greedy"]
  },
  {
    slug: "split-array-largest-sum",
    topic: "Binary Search",
    difficulty: "HARD",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Split Array Largest Sum",
    description: "The first number is k. Split the remaining array into k non-empty contiguous parts. Return the minimized largest part sum.",
    acceptanceText: "<p><strong>Expected:</strong> Binary search answer from max element to total sum and greedily count partitions.</p>",
    testCases: [
      { input: [2, 7, 2, 5, 10, 8], expected: 18 },
      { input: [2, 1, 2, 3, 4, 5], expected: 9 },
      { input: [1, 3, 2, 2], expected: 7 }
    ],
    constraints: ["All values after k are non-negative"],
    skillKeys: ["dsa.binary_search", "dsa.greedy"]
  },
  {
    slug: "minimum-days-bouquets",
    topic: "Binary Search",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Minimum Days For Bouquets",
    description: "The first two numbers are m bouquets and k adjacent flowers per bouquet. Remaining values are bloom days. Return the minimum day to make m bouquets, or -1.",
    acceptanceText: "<p><strong>Expected:</strong> Binary search day and greedily count consecutive bloomed flowers.</p>",
    testCases: [
      { input: [3, 1, 1, 10, 3, 10, 2], expected: 3 },
      { input: [3, 2, 1, 10, 3, 10, 2], expected: -1 },
      { input: [2, 2, 7, 7, 7, 7, 12, 7, 7], expected: 12 }
    ],
    constraints: ["Bouquets require adjacent flowers"],
    skillKeys: ["dsa.binary_search"]
  },
  {
    slug: "gas-station-start-index",
    topic: "Greedy",
    difficulty: "MEDIUM",
    company: "Uber",
    companyTags: ["PRODUCT_BASED", "MNC"],
    heading: "Gas Station Start Index",
    description: "The first number is n. The next n values are gas amounts and the following n values are costs. Return the starting station index that completes the circuit, or -1.",
    acceptanceText: "<p><strong>Expected:</strong> If total gas is less than total cost return -1. Otherwise reset start whenever current tank drops below zero.</p>",
    testCases: [
      { input: [5, 1, 2, 3, 4, 5, 3, 4, 5, 1, 2], expected: 3 },
      { input: [3, 2, 3, 4, 3, 4, 3], expected: -1 },
      { input: [1, 5, 4], expected: 0 }
    ],
    constraints: ["First value is n"],
    skillKeys: ["dsa.greedy"]
  },
  {
    slug: "jump-game-reachable",
    topic: "Greedy",
    difficulty: "EASY",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Jump Game Reachable",
    description: "Each value is the maximum jump length from that index. Return 1 if the last index is reachable, otherwise 0.",
    acceptanceText: "<p><strong>Expected:</strong> Track the farthest reachable index while scanning. Stop when index exceeds reach.</p>",
    testCases: [
      { input: [2, 3, 1, 1, 4], expected: 1 },
      { input: [3, 2, 1, 0, 4], expected: 0 },
      { input: [0], expected: 1 }
    ],
    constraints: ["Values are non-negative"],
    skillKeys: ["dsa.greedy"]
  },
  {
    slug: "jump-game-min-jumps",
    topic: "Greedy",
    difficulty: "MEDIUM",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Jump Game Minimum Jumps",
    description: "Each value is the maximum jump length from that index. Return the minimum number of jumps needed to reach the last index, or -1 if impossible.",
    acceptanceText: "<p><strong>Expected:</strong> Greedy BFS-level window using currentEnd and farthest reach.</p>",
    testCases: [
      { input: [2, 3, 1, 1, 4], expected: 2 },
      { input: [2, 3, 0, 1, 4], expected: 2 },
      { input: [0, 1], expected: -1 }
    ],
    constraints: ["Values are non-negative"],
    skillKeys: ["dsa.greedy"]
  },
  {
    slug: "candy-distribution-total",
    topic: "Greedy",
    difficulty: "HARD",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Candy Distribution Total",
    description: "Each value is a child rating. Every child needs at least one candy, and higher rated children than an adjacent neighbor need more candy. Return the minimum total candies.",
    acceptanceText: "<p><strong>Expected:</strong> Two passes, left-to-right and right-to-left, taking max constraints at each index.</p>",
    testCases: [
      { input: [1, 0, 2], expected: 5 },
      { input: [1, 2, 2], expected: 4 },
      { input: [1, 3, 4, 5, 2], expected: 11 }
    ],
    constraints: ["Adjacent rating rule only"],
    skillKeys: ["dsa.greedy"]
  },
  {
    slug: "lemonade-change-possible",
    topic: "Greedy",
    difficulty: "EASY",
    company: "TCS",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Lemonade Change Possible",
    description: "Each value is a customer bill: 5, 10, or 20. Lemonade costs 5. Return 1 if you can provide correct change to every customer in order, otherwise 0.",
    acceptanceText: "<p><strong>Expected:</strong> Greedily use a 10 and 5 for a 20 bill when possible, otherwise three 5 bills.</p>",
    testCases: [
      { input: [5, 5, 5, 10, 20], expected: 1 },
      { input: [5, 5, 10, 10, 20], expected: 0 },
      { input: [10], expected: 0 }
    ],
    constraints: ["Bills are processed in order"],
    skillKeys: ["dsa.greedy"]
  },
  {
    slug: "assign-cookies-content-count",
    topic: "Greedy",
    difficulty: "EASY",
    company: "Infosys",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Assign Cookies Content Count",
    description: "The first number is n. The next n values are child greed factors. Remaining values are cookie sizes. Return the maximum number of content children.",
    acceptanceText: "<p><strong>Expected:</strong> Sort greed and cookies, then greedily assign the smallest cookie that satisfies each child.</p>",
    testCases: [
      { input: [3, 1, 2, 3, 1, 1], expected: 1 },
      { input: [2, 1, 2, 1, 2, 3], expected: 2 },
      { input: [0, 1, 2], expected: 0 }
    ],
    constraints: ["First value is number of children"],
    skillKeys: ["dsa.greedy", "dsa.sorting"]
  },
  {
    slug: "non-overlapping-intervals-remove",
    topic: "Intervals",
    difficulty: "MEDIUM",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Non Overlapping Intervals Remove Count",
    description: "Values are encoded as start,end pairs. Return the minimum number of intervals to remove so the rest do not overlap.",
    acceptanceText: "<p><strong>Expected:</strong> Sort by end time and greedily keep intervals that start after the last kept end.</p>",
    testCases: [
      { input: [1, 2, 2, 3, 3, 4, 1, 3], expected: 1 },
      { input: [1, 2, 1, 2, 1, 2], expected: 2 },
      { input: [1, 2, 2, 3], expected: 0 }
    ],
    constraints: ["Ignore incomplete trailing endpoint"],
    skillKeys: ["dsa.intervals", "dsa.greedy"]
  },
  {
    slug: "insert-interval-coverage",
    topic: "Intervals",
    difficulty: "MEDIUM",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Insert Interval Coverage",
    description: "The first two numbers are the new interval start and end. Remaining values are sorted non-overlapping intervals encoded as pairs. Insert and merge, then return total covered length.",
    acceptanceText: "<p><strong>Expected:</strong> Add intervals before new, merge overlaps with new, then append the rest.</p>",
    testCases: [
      { input: [2, 5, 1, 3, 6, 9], expected: 7 },
      { input: [4, 8, 1, 2, 3, 5, 6, 7, 8, 10], expected: 8 },
      { input: [1, 2], expected: 1 }
    ],
    constraints: ["Intervals are half-open for length end - start"],
    skillKeys: ["dsa.intervals"]
  },
  {
    slug: "minimum-arrows-balloons",
    topic: "Intervals",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Minimum Arrows For Balloons",
    description: "Values are encoded as start,end balloon intervals. One arrow at position x bursts all balloons where start <= x <= end. Return the minimum arrows needed.",
    acceptanceText: "<p><strong>Expected:</strong> Sort by end and shoot a new arrow only when the next start is greater than current arrow position.</p>",
    testCases: [
      { input: [10, 16, 2, 8, 1, 6, 7, 12], expected: 2 },
      { input: [1, 2, 3, 4, 5, 6, 7, 8], expected: 4 },
      { input: [1, 2, 2, 3], expected: 1 }
    ],
    constraints: ["Intervals are closed for overlap checks"],
    skillKeys: ["dsa.intervals", "dsa.greedy"]
  },
  {
    slug: "employee-free-time-count",
    topic: "Intervals",
    difficulty: "HARD",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Employee Free Time Count",
    description: "Values are busy intervals encoded as start,end pairs for all employees combined. Merge busy intervals and return the number of positive free gaps between them.",
    acceptanceText: "<p><strong>Expected:</strong> Sort all intervals, merge busy ranges, and count gaps between merged ranges.</p>",
    testCases: [
      { input: [1, 3, 6, 7, 2, 4, 8, 10], expected: 2 },
      { input: [1, 5, 2, 3], expected: 0 },
      { input: [1, 2], expected: 0 }
    ],
    constraints: ["Ignore incomplete trailing endpoint"],
    skillKeys: ["dsa.intervals", "dsa.sorting"]
  },
  {
    slug: "top-k-largest-sum",
    topic: "Heaps",
    difficulty: "EASY",
    company: "TCS",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Top K Largest Sum",
    description: "The first number is k. Return the sum of the k largest values from the remaining array.",
    acceptanceText: "<p><strong>Expected:</strong> Min-heap of size k for streaming constraints, or sort for simpler baseline.</p>",
    testCases: [
      { input: [3, 5, 1, 9, 2, 8], expected: 22 },
      { input: [5, 1, 2], expected: 3 },
      { input: [0, 1, 2], expected: 0 }
    ],
    constraints: ["If k > n, sum all values"],
    skillKeys: ["dsa.heaps", "dsa.sorting"]
  },
  {
    slug: "kth-largest-value",
    topic: "Heaps",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Kth Largest Value",
    description: "The first number is k. Return the kth largest value from the remaining array. Duplicates count as separate positions.",
    acceptanceText: "<p><strong>Expected:</strong> Min-heap of size k or quickselect. Clarify duplicate handling.</p>",
    testCases: [
      { input: [2, 3, 2, 1, 5, 6, 4], expected: 5 },
      { input: [4, 3, 2, 3, 1, 2, 4, 5, 5, 6], expected: 4 },
      { input: [1, 7], expected: 7 }
    ],
    constraints: ["1 <= k <= n"],
    skillKeys: ["dsa.heaps", "dsa.quickselect"]
  },
  {
    slug: "merge-k-sorted-lists-checksum",
    topic: "Heaps",
    difficulty: "HARD",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Merge K Sorted Lists Checksum",
    description: "Sorted lists are encoded with 0 as a separator. Merge all lists and return sum(index * value) of the merged result.",
    acceptanceText: "<p><strong>Expected:</strong> Min-heap containing the current head from each list. Pop smallest and advance that list.</p>",
    testCases: [
      { input: [1, 4, 5, 0, 1, 3, 4, 0, 2, 6], expected: 122 },
      { input: [1, 0, 2, 0, 3], expected: 8 },
      { input: [], expected: 0 }
    ],
    constraints: ["0 separates lists and is not a list value"],
    skillKeys: ["dsa.heaps"]
  },
  {
    slug: "k-closest-points-distance-sum",
    topic: "Heaps",
    difficulty: "MEDIUM",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "K Closest Points Distance Sum",
    description: "The first number is k. Remaining values are x,y point pairs. Return the sum of squared distances of the k closest points to origin.",
    acceptanceText: "<p><strong>Expected:</strong> Max-heap of size k or quickselect on squared distance. Ignore incomplete trailing coordinate.</p>",
    testCases: [
      { input: [1, 1, 3, -2, 2], expected: 8 },
      { input: [2, 3, 3, 5, -1, -2, 4], expected: 30 },
      { input: [3, 1, 1], expected: 2 }
    ],
    constraints: ["Distance is x*x + y*y"],
    skillKeys: ["dsa.heaps", "dsa.quickselect"]
  },
  {
    slug: "task-scheduler-min-intervals",
    topic: "Heaps",
    difficulty: "MEDIUM",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Task Scheduler Minimum Intervals",
    description: "The first number is cooldown n. Remaining values are task IDs. Return the minimum time units needed to execute all tasks with the cooldown rule.",
    acceptanceText: "<p><strong>Expected:</strong> Use frequency math or max-heap simulation. The most frequent task determines idle slots.</p>",
    testCases: [
      { input: [2, 1, 1, 1, 2, 2, 2], expected: 8 },
      { input: [0, 1, 1, 2], expected: 3 },
      { input: [2, 1, 2, 3], expected: 3 }
    ],
    constraints: ["Same task IDs need n intervals between runs"],
    skillKeys: ["dsa.heaps", "dsa.greedy"]
  },
  {
    slug: "sort-array-inversion-parity",
    topic: "Sorting",
    difficulty: "MEDIUM",
    company: "Infosys",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Sort Array Inversion Parity",
    description: "Return 1 if the inversion count of the array is odd, otherwise return 0.",
    acceptanceText: "<p><strong>Expected:</strong> Merge-sort inversion counting. For parity, toggling during merge is enough.</p>",
    testCases: [
      { input: [2, 1, 3], expected: 1 },
      { input: [3, 2, 1], expected: 1 },
      { input: [1, 2, 3], expected: 0 }
    ],
    constraints: ["Inversion is i < j and nums[i] > nums[j]"],
    skillKeys: ["dsa.sorting", "dsa.divide_and_conquer"]
  },
  {
    slug: "relative-sort-checksum",
    topic: "Sorting",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Relative Sort Checksum",
    description: "The first number is m. The next m values define priority order. Sort the remaining values by that priority first, then ascending for unmentioned values. Return sum(index * value).",
    acceptanceText: "<p><strong>Expected:</strong> Frequency map plus output in priority order, then remaining sorted keys.</p>",
    testCases: [
      { input: [3, 2, 1, 4, 2, 3, 1, 4, 2, 5], expected: 53 },
      { input: [2, 5, 1, 1, 5, 2], expected: 5 },
      { input: [0, 3, 1, 2], expected: 8 }
    ],
    constraints: ["First value is priority length"],
    skillKeys: ["dsa.sorting", "dsa.hashing"]
  },
  {
    slug: "wiggle-sort-peak-count",
    topic: "Sorting",
    difficulty: "MEDIUM",
    company: "Netflix",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Wiggle Sort Peak Count",
    description: "Rearrange values into wiggle order nums[0] <= nums[1] >= nums[2] <= nums[3]... using the one-pass local swap method. Return the number of odd indices that are peaks after rearrangement.",
    acceptanceText: "<p><strong>Expected:</strong> One pass swapping adjacent values whenever the current relation is violated.</p>",
    testCases: [
      { input: [3, 5, 2, 1, 6, 4], expected: 3 },
      { input: [1, 2, 3, 4], expected: 2 },
      { input: [1], expected: 0 }
    ],
    constraints: ["Use the standard local swap wiggle algorithm"],
    skillKeys: ["dsa.sorting", "dsa.greedy"]
  },
  {
    slug: "diagonal-traverse-checksum",
    topic: "Matrix",
    difficulty: "MEDIUM",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Diagonal Traverse Checksum",
    description: "The first two numbers are rows and cols. Remaining values are a flattened matrix. Traverse using the classic zig-zag diagonal order and return sum(position * value).",
    acceptanceText: "<p><strong>Expected:</strong> Iterate diagonals by r + c and reverse every alternate diagonal.</p>",
    testCases: [
      { input: [3, 3, 1, 2, 3, 4, 5, 6, 7, 8, 9], expected: 230 },
      { input: [2, 2, 1, 2, 3, 4], expected: 20 },
      { input: [0, 0], expected: 0 }
    ],
    constraints: ["Matrix is flattened row-major"],
    skillKeys: ["dsa.matrix", "dsa.arrays"]
  },
  {
    slug: "rotate-matrix-main-diagonal-sum",
    topic: "Matrix",
    difficulty: "MEDIUM",
    company: "Meta",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Rotate Matrix Main Diagonal Sum",
    description: "The first number is n. Remaining values form an n x n matrix. Rotate it 90 degrees clockwise and return the main diagonal sum after rotation.",
    acceptanceText: "<p><strong>Expected:</strong> Transpose then reverse each row, or map coordinates directly.</p>",
    testCases: [
      { input: [3, 1, 2, 3, 4, 5, 6, 7, 8, 9], expected: 15 },
      { input: [2, 1, 2, 3, 4], expected: 5 },
      { input: [1, 7], expected: 7 }
    ],
    constraints: ["Matrix is square"],
    skillKeys: ["dsa.matrix"]
  },
  {
    slug: "search-2d-matrix-found",
    topic: "Matrix",
    difficulty: "MEDIUM",
    company: "Microsoft",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Search 2D Matrix Found",
    description: "The first three numbers are target, rows, and cols. Remaining values are a row-major matrix where each row is sorted and each row starts after the previous row. Return 1 if target exists.",
    acceptanceText: "<p><strong>Expected:</strong> Treat the matrix as a flattened sorted array and binary search over 0..rows*cols-1.</p>",
    testCases: [
      { input: [3, 3, 4, 1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60], expected: 1 },
      { input: [13, 3, 4, 1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60], expected: 0 },
      { input: [1, 0, 0], expected: 0 }
    ],
    constraints: ["Matrix is globally sorted in row-major order"],
    skillKeys: ["dsa.matrix", "dsa.binary_search"]
  },
  {
    slug: "matrix-block-sum-total",
    topic: "Matrix",
    difficulty: "MEDIUM",
    company: "Amazon",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Matrix Block Sum Total",
    description: "The first three numbers are k, rows, and cols. Remaining values form a matrix. For every cell, compute the sum of all cells within k Manhattan-style row/col distance as a square block. Return the total of all block sums.",
    acceptanceText: "<p><strong>Expected:</strong> 2D prefix sums to answer each block in O(1).</p>",
    testCases: [
      { input: [1, 3, 3, 1, 2, 3, 4, 5, 6, 7, 8, 9], expected: 245 },
      { input: [0, 2, 2, 1, 2, 3, 4], expected: 10 },
      { input: [2, 1, 1, 5], expected: 5 }
    ],
    constraints: ["Block is bounded by matrix edges"],
    skillKeys: ["dsa.matrix", "dsa.prefix_sums"]
  },
  {
    slug: "kth-smallest-sorted-matrix",
    topic: "Matrix",
    difficulty: "HARD",
    company: "Google",
    companyTags: ["BIG_TECH", "PRODUCT_BASED"],
    heading: "Kth Smallest In Sorted Matrix",
    description: "The first two numbers are k and n. Remaining values form an n x n matrix sorted ascending by rows and columns. Return the kth smallest value.",
    acceptanceText: "<p><strong>Expected:</strong> Min-heap over row heads or binary search value space with count <= mid.</p>",
    testCases: [
      { input: [8, 3, 1, 5, 9, 10, 11, 13, 12, 13, 15], expected: 13 },
      { input: [1, 1, -5], expected: -5 },
      { input: [3, 2, 1, 2, 1, 3], expected: 2 }
    ],
    constraints: ["Rows and columns are sorted"],
    skillKeys: ["dsa.matrix", "dsa.heaps", "dsa.binary_search"]
  },
  {
    slug: "min-cost-climbing-greedy-trap",
    topic: "Dynamic Programming",
    difficulty: "EASY",
    company: "TCS",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Min Cost Climbing Stairs",
    description: "Each value is the cost of stepping on that stair. You can climb 1 or 2 steps and may start at index 0 or 1. Return the minimum cost to reach the top beyond the last stair.",
    acceptanceText: "<p><strong>Expected:</strong> Simple rolling DP. The title calls out that local greedy choice is a trap.</p>",
    testCases: [
      { input: [10, 15, 20], expected: 15 },
      { input: [1, 100, 1, 1, 1, 100, 1, 1, 100, 1], expected: 6 },
      { input: [5], expected: 0 }
    ],
    constraints: ["Can start at stair 0 or 1"],
    skillKeys: ["dsa.dynamic_programming"]
  },
  {
    slug: "minimum-platforms-required",
    topic: "Sorting",
    difficulty: "MEDIUM",
    company: "Infosys",
    companyTags: ["MNC", "SERVICE_BASED"],
    heading: "Minimum Platforms Required",
    description: "The first number is n. The next n values are arrival times and the following n values are departure times. Return the minimum number of platforms required.",
    acceptanceText: "<p><strong>Expected:</strong> Sort arrivals and departures separately, then sweep with two pointers.</p>",
    testCases: [
      { input: [6, 900, 940, 950, 1100, 1500, 1800, 910, 1200, 1120, 1130, 1900, 2000], expected: 3 },
      { input: [3, 900, 940, 950, 910, 1200, 1120], expected: 2 },
      { input: [0], expected: 0 }
    ],
    constraints: ["First value is n"],
    skillKeys: ["dsa.sorting", "dsa.two_pointers"]
  }
];

function buildDsaQuestions() {
  const seen = new Set<string>();
  const problems = curatedDsaProblems.filter((problem) => {
    const slug = slugify(`prepnexo-dsa-${problem.slug}`);
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });

  return problems.map<QuestionSeed>((problem) => ({
    ...problem,
    slug: slugify(`prepnexo-dsa-${problem.slug}`),
    type: "DSA",
    description: [
      problem.description,
      "",
      "Implement solve(nums). Return one integer. Any target/window/grid metadata is encoded in nums as described."
    ].join("\n"),
    starterCode: starter(problem.heading),
    examples: problem.testCases.slice(0, 2).map((testCase) => ({
      input: testCase.input,
      output: testCase.expected
    })),
    status: "ACTIVE"
  }));
}

const systemDomains = [
  "live coding interview platform",
  "daily DSA arena",
  "AI feedback pipeline",
  "leaderboard service",
  "notification system",
  "payment reconciliation service",
  "resume parsing system",
  "coding submission judge",
  "video interview room",
  "analytics event pipeline",
  "question recommendation engine",
  "admin question bank",
  "feature flag service",
  "rate limiter",
  "chat support system",
  "search autocomplete service",
  "file upload platform",
  "multi-tenant SaaS dashboard",
  "fraud detection stream",
  "URL shortener",
  "ride matching system",
  "food delivery dispatch",
  "stock price alert system",
  "collaborative document editor",
  "metrics dashboard",
  "webhook delivery service",
  "API gateway",
  "cache invalidation system",
  "email campaign platform",
  "online proctoring service",
  "course progress tracker",
  "realtime comments service",
  "identity and session service",
  "audit log platform",
  "content moderation queue",
  "recommendation feed",
  "distributed scheduler",
  "inventory reservation service",
  "observability platform",
  "tenant billing dashboard"
];

function buildSystemDesignQuestions() {
  return systemDomains.map<QuestionSeed>((domain, index) => {
    const company = companies[index % companies.length];
    const seniority = index % 3 === 0 ? "STAFF" : index % 3 === 1 ? "SENIOR" : "MID";
    const heading = `Design a ${domain}`;
    return {
      slug: slugify(`prepnexo-system-design-${domain}`),
      type: "SYSTEM_DESIGN",
      topic: "System Design",
      difficulty: seniority === "MID" ? "MEDIUM" : "HARD",
      company: company.name,
      companyTags: company.tags,
      heading,
      description: [
        `Design a production-grade ${domain} for a ${company.name}-style ${seniority.toLowerCase()} engineering interview.`,
        "Cover APIs, core entities, storage choice, read/write paths, scaling bottlenecks, caching, failure handling, observability, and tradeoffs.",
        "State assumptions clearly and call out what you would simplify for MVP versus harden for scale."
      ].join("\n"),
      acceptanceText: "<p><strong>Accept if:</strong> the candidate clarifies requirements, defines APIs/data model, explains bottlenecks, handles failures, and makes explicit tradeoffs instead of listing buzzwords.</p>",
      starterCode: "",
      testCases: [],
      examples: [],
      constraints: [
        "Clarify functional and non-functional requirements first",
        "Include data model, APIs, scaling, reliability, and observability",
        "Explain MVP vs production tradeoffs"
      ],
      skillKeys: ["system.scalability", "system.database_design", "system.api_design", "system.fault_tolerance"],
      status: "ACTIVE"
    };
  });
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
  const questions = [...buildDsaQuestions().slice(0, 500), ...buildSystemDesignQuestions()];

  await prisma.question.deleteMany({
    where: {
      OR: [
        { slug: { startsWith: "prepnexo-dsa-" } },
        { slug: { startsWith: "prepnexo-system-design-" } }
      ]
    }
  });

  const chunkSize = 100;
  let inserted = 0;
  for (let index = 0; index < questions.length; index += chunkSize) {
    const chunk = questions.slice(index, index + chunkSize);
    const result = await prisma.question.createMany({
      data: chunk.map((question) => ({
        ...question,
        createdById: admin?.id,
        companyTags: question.companyTags,
        testCases: question.testCases,
        examples: question.examples,
        constraints: question.constraints,
        skillKeys: question.skillKeys
      }))
    });
    inserted += result.count;
  }

  const totals = await prisma.question.groupBy({
    by: ["type"],
    where: { slug: { startsWith: "prepnexo-" } },
    _count: { _all: true }
  });
  console.info(JSON.stringify({ inserted, totals }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
