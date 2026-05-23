export type SkillDefinition = {
  key: string;
  label: string;
  domain: "DSA" | "SYSTEM_DESIGN" | "SOFT_SKILL";
  aliases: string[];
};

export const skillDefinitions: SkillDefinition[] = [
  { key: "dsa.arrays", label: "Arrays", domain: "DSA", aliases: ["arrays", "array"] },
  { key: "dsa.sliding_window", label: "Sliding Window", domain: "DSA", aliases: ["sliding window"] },
  { key: "dsa.two_pointers", label: "Two Pointers", domain: "DSA", aliases: ["two pointers"] },
  { key: "dsa.trees", label: "Trees", domain: "DSA", aliases: ["trees", "tree"] },
  { key: "dsa.graphs", label: "Graphs", domain: "DSA", aliases: ["graphs", "graph"] },
  { key: "dsa.dynamic_programming", label: "Dynamic Programming", domain: "DSA", aliases: ["dynamic programming", "dp"] },
  { key: "dsa.greedy", label: "Greedy", domain: "DSA", aliases: ["greedy"] },
  { key: "dsa.binary_search", label: "Binary Search", domain: "DSA", aliases: ["binary search"] },
  { key: "dsa.backtracking", label: "Backtracking", domain: "DSA", aliases: ["backtracking"] },
  { key: "dsa.tries", label: "Tries", domain: "DSA", aliases: ["tries", "trie"] },
  { key: "dsa.heaps", label: "Heaps", domain: "DSA", aliases: ["heaps", "heap"] },
  { key: "dsa.segment_trees", label: "Segment Trees", domain: "DSA", aliases: ["segment trees", "segment tree"] },
  { key: "dsa.union_find", label: "Union Find", domain: "DSA", aliases: ["union find", "dsu"] },
  { key: "system.scalability", label: "Scalability", domain: "SYSTEM_DESIGN", aliases: ["scalability", "scale"] },
  { key: "system.caching", label: "Caching", domain: "SYSTEM_DESIGN", aliases: ["caching", "cache", "redis"] },
  { key: "system.database_design", label: "Database Design", domain: "SYSTEM_DESIGN", aliases: ["database design", "database", "db"] },
  { key: "system.api_design", label: "API Design", domain: "SYSTEM_DESIGN", aliases: ["api design", "api"] },
  { key: "system.messaging", label: "Messaging Systems", domain: "SYSTEM_DESIGN", aliases: ["messaging systems", "messaging", "queue"] },
  { key: "system.kafka", label: "Kafka", domain: "SYSTEM_DESIGN", aliases: ["kafka"] },
  { key: "system.redis", label: "Redis", domain: "SYSTEM_DESIGN", aliases: ["redis"] },
  { key: "system.load_balancing", label: "Load Balancing", domain: "SYSTEM_DESIGN", aliases: ["load balancing", "load balancer"] },
  { key: "system.cap_theorem", label: "CAP Theorem", domain: "SYSTEM_DESIGN", aliases: ["cap theorem", "cap"] },
  { key: "system.fault_tolerance", label: "Fault Tolerance", domain: "SYSTEM_DESIGN", aliases: ["fault tolerance", "resilience"] },
  { key: "system.rate_limiting", label: "Rate Limiting", domain: "SYSTEM_DESIGN", aliases: ["rate limiting", "rate limit"] },
  { key: "system.distributed_systems", label: "Distributed Systems", domain: "SYSTEM_DESIGN", aliases: ["distributed systems"] },
  { key: "soft.communication_clarity", label: "Communication clarity", domain: "SOFT_SKILL", aliases: ["communication", "communication clarity"] },
  { key: "soft.interview_confidence", label: "Interview confidence", domain: "SOFT_SKILL", aliases: ["confidence", "interview confidence"] },
  { key: "soft.explanation_quality", label: "Explanation quality", domain: "SOFT_SKILL", aliases: ["explanation", "explanation quality"] },
  { key: "soft.time_management", label: "Time management", domain: "SOFT_SKILL", aliases: ["time management", "speed"] },
  { key: "soft.problem_breakdown", label: "Problem breakdown ability", domain: "SOFT_SKILL", aliases: ["problem breakdown", "breakdown"] }
];

export function skillKeysForTopic(topic: string, explicit: string[] = []) {
  const normalized = topic.toLowerCase();
  const matched = skillDefinitions
    .filter((skill) => skill.aliases.some((alias) => normalized.includes(alias)))
    .map((skill) => skill.key);

  if (normalized.includes("system design")) {
    matched.push("system.scalability", "system.api_design", "system.database_design", "system.fault_tolerance");
  }
  if (normalized.includes("behavioral")) {
    matched.push("soft.communication_clarity", "soft.interview_confidence", "soft.explanation_quality");
  }

  return [...new Set([...explicit, ...matched])].filter((key) => skillDefinitions.some((skill) => skill.key === key));
}

export function getSkillDefinition(key: string) {
  return skillDefinitions.find((skill) => skill.key === key);
}
