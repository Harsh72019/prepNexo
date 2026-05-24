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

function buildDsaQuestions() {
  const questions: QuestionSeed[] = [];
  for (const template of templates) {
    for (let index = 0; index < 20; index += 1) {
      const context = contexts[index % contexts.length];
      const company = companies[(index + template.key.length) % companies.length];
      const difficulty = difficultyFor(template, index);
      const heading = `${template.title}: ${context.replace(/\b\w/g, (letter) => letter.toUpperCase())}`;
      const description = [
        `You are analyzing ${context} for a ${company.name}-style interview screen.`,
        template.prompt({ index, context, company: company.name, companyTags: company.tags, difficulty }),
        "",
        "Implement solve(nums). Return one integer. The runner passes only this number array, so any target/window/n metadata is encoded in nums as described."
      ].join("\n");
      questions.push({
        slug: slugify(`prepnexo-dsa-${template.key}-${index + 1}`),
        type: "DSA",
        topic: template.topic,
        difficulty,
        company: company.name,
        companyTags: company.tags,
        heading,
        description,
        acceptanceText: `<p><strong>Expected signal:</strong> ${template.acceptance}</p><p>Candidate should state time complexity, edge cases, and why the chosen data structure fits.</p>`,
        starterCode: starter(heading),
        testCases: template.cases(index + template.key.length),
        examples: [],
        constraints: [
          "0 <= nums.length <= 200000 for the intended solution",
          "Values fit inside signed 32-bit integer range",
          "Return exactly one integer"
        ],
        skillKeys: template.skillKeys,
        status: "ACTIVE"
      });
    }
  }
  return questions;
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
