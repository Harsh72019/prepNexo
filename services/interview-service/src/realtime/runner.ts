import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import vm from "node:vm";
import type { PracticeTestCase } from "@interview-battlefield/types";

const execFileAsync = promisify(execFile);

const defaultTestCases = [
  { input: [1, 2, 3], expected: 6 },
  { input: [-2, 5, 8], expected: 11 },
  { input: [], expected: 0 }
];

type RunLanguage = "typescript" | "javascript" | "python" | "cpp" | "java";

function runJsLike(code: string, testCases: PracticeTestCase[]) {
  try {
    const runnable = code
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, "")
      .replace(/export\s+function\s+solve/, "function solve")
      .replace(/:\s*(number\[\]|number|string|boolean)/g, "")
      .replace(/export\s+\{[^}]+\};?/g, "");
    const context = vm.createContext({});
    vm.runInContext(`${runnable}\nif (typeof solve !== "function") throw new Error("solve function is required");`, context, {
      timeout: 1000
    });

    for (const testCase of testCases) {
      const actual = vm.runInContext(`solve(${JSON.stringify(testCase.input)})`, context, { timeout: 1000 });
      if (actual !== testCase.expected) {
        return {
          ok: false,
          message: `failed for ${JSON.stringify(testCase.input)}. Expected ${testCase.expected}, received ${String(actual)}.`
        };
      }
    }

    return { ok: true, message: `${testCases.length}/${testCases.length} test cases passed.` };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error && error.message ? error.message : String(error)
    };
  }
}

async function runPython(code: string, testCases: PracticeTestCase[]) {
  const dir = await mkdtemp(join(tmpdir(), "ib-python-"));
  try {
    const file = join(dir, "solution.py");
    const harness = [
      code,
      "",
      "import json",
      `cases = ${JSON.stringify(testCases)}`,
      "for case in cases:",
      "    actual = solve(case['input'])",
      "    if actual != case['expected']:",
      "        raise AssertionError(f\"failed for {case['input']}. Expected {case['expected']}, received {actual}.\")",
      `print("${testCases.length}/${testCases.length} test cases passed.")`
    ].join("\n");
    await writeFile(file, harness);
    const { stdout } = await execFileAsync("python3", [file], { timeout: 3000, maxBuffer: 1024 * 256 });
    return { ok: true, message: stdout.trim() };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function runCpp(code: string, testCases: PracticeTestCase[]) {
  const dir = await mkdtemp(join(tmpdir(), "ib-cpp-"));
  try {
    const file = join(dir, "solution.cpp");
    const binary = join(dir, "solution");
    const cases = testCases
      .map((testCase) => `{std::vector<int>{${testCase.input.join(",")}}, ${testCase.expected}}`)
      .join(",\n");
    const harness = [
      "#include <bits/stdc++.h>",
      "using namespace std;",
      code,
      "int main(){",
      "  vector<pair<vector<int>, int>> cases = {",
      cases,
      "  };",
      "  for (auto &tc : cases) {",
      "    int actual = solve(tc.first);",
      "    if (actual != tc.second) {",
      "      cout << \"failed. Expected \" << tc.second << \", received \" << actual << \".\";",
      "      return 1;",
      "    }",
      "  }",
      `  cout << "${testCases.length}/${testCases.length} test cases passed.";`,
      "  return 0;",
      "}"
    ].join("\n");
    await writeFile(file, harness);
    await execFileAsync("g++", ["-std=c++17", file, "-O2", "-o", binary], { timeout: 5000, maxBuffer: 1024 * 256 });
    const { stdout } = await execFileAsync(binary, [], { timeout: 3000, maxBuffer: 1024 * 256 });
    return { ok: true, message: stdout.trim() };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export async function runCode(code: string, testCases: PracticeTestCase[] = defaultTestCases, language: RunLanguage = "typescript") {
  if (language === "python") return runPython(code, testCases);
  if (language === "cpp") return runCpp(code, testCases);
  if (language === "java") {
    return {
      ok: false,
      message: "Java runner needs javac installed on this machine. The editor template is ready, but execution is disabled until javac is available."
    };
  }
  return runJsLike(code, testCases);
}
