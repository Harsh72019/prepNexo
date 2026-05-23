import type { PracticeProblem, PracticeTestCase } from "@interview-battlefield/types";

export type CodeLanguage = "javascript" | "typescript" | "python" | "cpp" | "java";

export const languageOptions: Array<{ id: CodeLanguage; label: string; monaco: string }> = [
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "typescript", label: "TypeScript", monaco: "typescript" },
  { id: "python", label: "Python", monaco: "python" },
  { id: "cpp", label: "C++", monaco: "cpp" },
  { id: "java", label: "Java", monaco: "java" }
];

export function monacoLanguage(language: CodeLanguage) {
  return languageOptions.find((item) => item.id === language)?.monaco ?? "typescript";
}

export function starterForLanguage(problem: PracticeProblem | undefined, language: CodeLanguage) {
  const title = problem?.title ?? "Problem";
  if (language === "javascript") {
    return [
      "/**",
      ` * ${title}`,
      " * @param {number[]} nums",
      " * @return {number}",
      " */",
      "function solve(nums) {",
      "  ",
      "}"
    ].join("\n");
  }
  if (language === "typescript") {
    return [
      `// ${title}`,
      "export function solve(nums: number[]): number {",
      "  ",
      "}"
    ].join("\n");
  }
  if (language === "python") {
    return [
      `# ${title}`,
      "def solve(nums):",
      "    pass"
    ].join("\n");
  }
  if (language === "cpp") {
    return [
      `// ${title}`,
      "int solve(vector<int>& nums) {",
      "  ",
      "}"
    ].join("\n");
  }
  return [
    `// ${title}`,
    "class Solution {",
    "  public int solve(int[] nums) {",
    "    ",
    "  }",
    "}"
  ].join("\n");
}

export function visibleTests(testCases: PracticeTestCase[] = []) {
  return testCases.slice(0, 3);
}
