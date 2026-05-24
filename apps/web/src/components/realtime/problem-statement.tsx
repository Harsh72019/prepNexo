import type { PracticeProblem } from "@interview-battlefield/types";
import { visibleTests } from "@/lib/code-templates";

export function ProblemStatement({ problem }: { problem?: PracticeProblem }) {
  if (!problem) {
    return <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Select or start a round to receive a problem.</div>;
  }

  return (
    <div className="grid gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{problem.title}</h3>
          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">{problem.difficulty}</span>
          <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{problem.topic}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{problem.prompt}</p>
        {problem.acceptanceText ? (
          <div className="mt-3 rounded-md border bg-background/60 p-3 text-sm leading-6 text-muted-foreground" dangerouslySetInnerHTML={{ __html: problem.acceptanceText }} />
        ) : null}
      </div>
      <div className="grid gap-3">
        {visibleTests(problem.testCases).map((testCase, index) => (
          <div key={`${problem.id}-${index}`} className="rounded-md border bg-background/70 p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">Example {index + 1}</p>
            <div className="mt-2 grid gap-1 font-mono text-xs">
              <p><span className="text-muted-foreground">Input:</span> nums = {JSON.stringify(testCase.input)}</p>
              <p><span className="text-muted-foreground">Output:</span> {testCase.expected}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
        Implement a function named <span className="font-mono font-semibold">solve</span>. Hidden tests use the same input/output shape.
      </div>
    </div>
  );
}
