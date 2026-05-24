"use client";

import type { CompanyTag, QuestionType } from "@interview-battlefield/types";
import { Button } from "@interview-battlefield/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@interview-battlefield/ui/components/card";
import { Input } from "@interview-battlefield/ui/components/input";
import { Label } from "@interview-battlefield/ui/components/label";
import { cn } from "@interview-battlefield/ui/lib/utils";
import { Database, FilePlus2, Save, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdminQuestions, useSaveAdminQuestion } from "@/hooks/use-admin-questions";
import type { QuestionAdminInput } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const questionTypes: QuestionType[] = ["DSA", "FRONTEND", "BACKEND", "SYSTEM_DESIGN", "BEHAVIORAL"];
const companyTags: CompanyTag[] = ["STARTUP", "BIG_TECH", "PRODUCT_BASED", "MNC", "SERVICE_BASED"];

const initialQuestion: QuestionAdminInput = {
  slug: "two-sum-google-warmup",
  type: "DSA",
  topic: "Arrays",
  difficulty: "EASY",
  company: "Google",
  companyTags: ["BIG_TECH", "PRODUCT_BASED"],
  heading: "Two Sum Warmup",
  description: "Given an array of numbers, return the number of pairs that add up to the target. For the current runner, implement solve(nums) and assume target is 10.",
  acceptanceText: "<p><strong>Accept if:</strong> the candidate explains the hashmap tradeoff, handles duplicates, and states time complexity.</p>",
  starterCode: "export function solve(nums: number[]) {\n  return 0;\n}",
  testCases: [
    { input: [2, 8, 4, 6], expected: 2 },
    { input: [5, 5, 1, 9], expected: 2 }
  ],
  examples: [],
  constraints: [],
  skillKeys: ["dsa.arrays"],
  status: "DRAFT"
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

function parseJsonArray(value: string) {
  if (!value.trim()) return [];
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Expected a JSON array");
  return parsed;
}

export function AdminQuestionsClient() {
  const user = useAuthStore((state) => state.user);
  const questions = useAdminQuestions();
  const saveQuestion = useSaveAdminQuestion();
  const [form, setForm] = useState<QuestionAdminInput>(initialQuestion);
  const [testCasesText, setTestCasesText] = useState(JSON.stringify(initialQuestion.testCases, null, 2));
  const [examplesText, setExamplesText] = useState("[]");
  const [constraintsText, setConstraintsText] = useState("[]");
  const [error, setError] = useState<string | null>(null);
  const activeQuestions = useMemo(() => questions.data?.filter((question) => question.status === "ACTIVE").length ?? 0, [questions.data]);

  function update<T extends keyof QuestionAdminInput>(key: T, value: QuestionAdminInput[T]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleTag(tag: CompanyTag) {
    update("companyTags", form.companyTags.includes(tag) ? form.companyTags.filter((item) => item !== tag) : [...form.companyTags, tag]);
  }

  async function submit() {
    try {
      setError(null);
      const testCases = parseJsonArray(testCasesText) as QuestionAdminInput["testCases"];
      const examples = parseJsonArray(examplesText);
      const constraints = parseJsonArray(constraintsText);
      await saveQuestion.mutateAsync({ ...form, testCases, examples, constraints });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save question");
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="size-5 text-primary" /> Admin access required</CardTitle>
          <CardDescription>Only admins can manage the question bank.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="grid gap-5">
        <div>
          <p className="text-sm font-semibold text-primary">Question bank</p>
          <h1 className="text-3xl font-black tracking-normal">Add adaptive interview questions</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Create DSA, frontend, backend, system design, and behavioral prompts with company metadata, rich acceptance notes, and flexible test examples.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FilePlus2 className="size-5 text-primary" /> Question details</CardTitle>
            <CardDescription>These fields control discovery, revision, and company-specific practice.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <Label>Heading</Label>
                <Input value={form.heading} onChange={(event) => {
                  update("heading", event.target.value);
                  update("slug", slugify(`${event.target.value}-${form.company ?? ""}`));
                }} />
              </label>
              <label className="grid gap-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(event) => update("slug", slugify(event.target.value))} />
              </label>
              <label className="grid gap-2">
                <Label>Type</Label>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.type} onChange={(event) => update("type", event.target.value as QuestionType)}>
                  {questionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="grid gap-2">
                <Label>Difficulty</Label>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.difficulty} onChange={(event) => update("difficulty", event.target.value as QuestionAdminInput["difficulty"])}>
                  {["EASY", "MEDIUM", "HARD"].map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
                </select>
              </label>
              <label className="grid gap-2">
                <Label>Topic</Label>
                <Input value={form.topic} onChange={(event) => update("topic", event.target.value)} />
              </label>
              <label className="grid gap-2">
                <Label>Company</Label>
                <Input value={form.company ?? ""} onChange={(event) => update("company", event.target.value)} />
              </label>
            </div>

            <div className="grid gap-2">
              <Label>Company tags</Label>
              <div className="flex flex-wrap gap-2">
                {companyTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn("rounded-md border px-3 py-2 text-xs font-semibold", form.companyTags.includes(tag) ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground")}
                  >
                    {tag.replaceAll("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <label className="grid gap-2">
              <Label>Description</Label>
              <textarea className="min-h-32 rounded-md border bg-background p-3 text-sm" value={form.description} onChange={(event) => update("description", event.target.value)} />
            </label>

            <label className="grid gap-2">
              <Label>Acceptance text</Label>
              <div
                contentEditable
                suppressContentEditableWarning
                className="min-h-28 rounded-md border bg-background p-3 text-sm leading-6"
                onInput={(event) => update("acceptanceText", event.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: form.acceptanceText ?? "" }}
              />
            </label>

            <label className="grid gap-2">
              <Label>Starter code</Label>
              <textarea className="min-h-36 rounded-md border bg-background p-3 font-mono text-xs" value={form.starterCode ?? ""} onChange={(event) => update("starterCode", event.target.value)} />
            </label>

            <div className="grid gap-4 lg:grid-cols-3">
              <label className="grid gap-2">
                <Label>Test cases JSON</Label>
                <textarea className="min-h-44 rounded-md border bg-background p-3 font-mono text-xs" value={testCasesText} onChange={(event) => setTestCasesText(event.target.value)} />
              </label>
              <label className="grid gap-2">
                <Label>Examples JSON</Label>
                <textarea className="min-h-44 rounded-md border bg-background p-3 font-mono text-xs" value={examplesText} onChange={(event) => setExamplesText(event.target.value)} />
              </label>
              <label className="grid gap-2">
                <Label>Constraints JSON</Label>
                <textarea className="min-h-44 rounded-md border bg-background p-3 font-mono text-xs" value={constraintsText} onChange={(event) => setConstraintsText(event.target.value)} />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_180px]">
              <label className="grid gap-2">
                <Label>Skill keys</Label>
                <Input value={form.skillKeys.join(", ")} onChange={(event) => update("skillKeys", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} />
              </label>
              <label className="grid gap-2">
                <Label>Status</Label>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(event) => update("status", event.target.value as QuestionAdminInput["status"])}>
                  {["DRAFT", "ACTIVE", "ARCHIVED"].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </div>

            {error ? <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
            <Button onClick={submit} loading={saveQuestion.isPending} className="w-fit">
              <Save className="size-4" />
              Save question
            </Button>
          </CardContent>
        </Card>
      </section>

      <aside className="grid content-start gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="size-5 text-primary" /> Bank status</CardTitle>
            <CardDescription>{activeQuestions} active questions ready for candidates.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent questions</CardTitle>
            <CardDescription>Newest saved prompts from the database.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {(questions.data ?? []).slice(0, 12).map((question) => (
              <button key={question.id} type="button" onClick={() => {
                setForm(question);
                setTestCasesText(JSON.stringify(question.testCases ?? [], null, 2));
                setExamplesText(JSON.stringify(question.examples ?? [], null, 2));
                setConstraintsText(JSON.stringify(question.constraints ?? [], null, 2));
              }} className="rounded-md border bg-background/70 p-3 text-left text-sm hover:bg-muted">
                <span className="block font-semibold">{question.heading}</span>
                <span className="text-xs text-muted-foreground">{question.type} · {question.topic} · {question.status}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
