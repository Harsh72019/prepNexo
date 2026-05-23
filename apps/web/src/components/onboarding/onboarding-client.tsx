"use client";

import type { OnboardingInput } from "@interview-battlefield/types";
import { Button } from "@interview-battlefield/ui/components/button";
import { Card, CardContent } from "@interview-battlefield/ui/components/card";
import { Input } from "@interview-battlefield/ui/components/input";
import { cn } from "@interview-battlefield/ui/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Check, ChevronLeft, ChevronRight, Sparkles, Target } from "lucide-react";
import { useState } from "react";
import { useCompleteOnboarding } from "@/hooks/use-onboarding";

const companies = ["Google", "Microsoft", "Amazon", "Uber", "Atlassian", "Flipkart", "Meta", "Netflix", "Startups"];
const topics = ["Arrays", "Sliding Window", "Two Pointers", "Graphs", "Dynamic Programming", "Trees", "System Design", "OOP", "Caching", "Databases", "Communication", "Time Management"];
const steps = ["Targets", "Profile", "Confidence", "Strengths", "Weaknesses", "Rhythm", "Diagnostic", "Plan"];

const initial: OnboardingInput = {
  targetCompanies: ["Google"],
  experienceLevel: "Intermediate",
  preferredRole: "Full Stack",
  confidenceLevel: 50,
  strongestTopics: ["Arrays"],
  weakestTopics: ["Dynamic Programming"],
  dailyPrepTime: "1 hour",
  learningStyle: "Interview simulation",
  targetTimeline: "3 months",
  diagnostic: {
    codingScore: 55,
    communicationScore: 55,
    systemDesignScore: 50,
    notes: ""
  }
};

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted",
        active && "border-primary bg-primary/10 text-primary"
      )}
    >
      {children}
    </button>
  );
}

export function OnboardingClient() {
  const complete = useCompleteOnboarding();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingInput>(initial);
  const progress = Math.round(((step + 1) / steps.length) * 100);

  function update<T extends keyof OnboardingInput>(key: T, value: OnboardingInput[T]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function next() {
    if (step < steps.length - 1) setStep((current) => current + 1);
    else complete.mutate(form);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <section className="arena-surface overflow-hidden rounded-lg border shadow-[0_18px_60px_rgb(0_0_0/0.22)]">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px] lg:p-7">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground"><Sparkles className="size-5" /></span>
              <div>
                <p className="text-sm font-medium text-primary">AI mentor setup</p>
                <h1 className="text-2xl font-semibold tracking-normal">Personalize your interview growth system</h1>
              </div>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
              <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {steps.map((item, index) => (
                <span key={item} className={cn("rounded-md px-2 py-1 text-xs", index === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{item}</span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border bg-background/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><Bot className="size-4 text-primary" /> Mentor signal</div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {form.targetCompanies[0]} {form.preferredRole} track, {form.targetTimeline}, weakest signal: {form.weakestTopics[0]}. I’ll turn this into your first daily plan and readiness baseline.
            </p>
          </div>
        </div>
      </section>

      <Card>
        <CardContent className="p-5 lg:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22 }}
              className="min-h-[420px]"
            >
              {step === 0 ? (
                <div>
                  <h2 className="text-xl font-semibold">Which companies are you targeting?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Pick multiple. The simulator will bias interview style and follow-ups.</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {companies.map((company) => (
                      <Pill key={company} active={form.targetCompanies.includes(company)} onClick={() => update("targetCompanies", toggle(form.targetCompanies, company))}>{company}</Pill>
                    ))}
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h2 className="text-xl font-semibold">Where are you today?</h2>
                    <div className="mt-5 grid gap-2">
                      {(["Beginner", "Intermediate", "Advanced", "Working professional"] as const).map((level) => (
                        <Pill key={level} active={form.experienceLevel === level} onClick={() => update("experienceLevel", level)}>{level}</Pill>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Preferred role</h2>
                    <div className="mt-5 grid gap-2">
                      {(["Backend", "Frontend", "Full Stack", "SDE-1", "SDE-2", "System Design focused"] as const).map((role) => (
                        <Pill key={role} active={form.preferredRole === role} onClick={() => update("preferredRole", role)}>{role}</Pill>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <h2 className="text-xl font-semibold">How interview-ready do you currently feel?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Be honest. This initializes confidence, pressure, and roadmap difficulty.</p>
                  <div className="mt-8 rounded-lg border bg-background/60 p-6">
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-5xl font-semibold">{form.confidenceLevel}</span>
                      <span className="text-sm text-muted-foreground">out of 100</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={form.confidenceLevel}
                      onChange={(event) => update("confidenceLevel", Number(event.target.value))}
                      className="mt-6 w-full accent-primary"
                    />
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div>
                  <h2 className="text-xl font-semibold">Strongest topics</h2>
                  <p className="mt-2 text-sm text-muted-foreground">These become early confidence anchors.</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <Pill key={topic} active={form.strongestTopics.includes(topic)} onClick={() => update("strongestTopics", toggle(form.strongestTopics, topic))}>{topic}</Pill>
                    ))}
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div>
                  <h2 className="text-xl font-semibold">Weakest topics</h2>
                  <p className="mt-2 text-sm text-muted-foreground">This is the most important signal. The engine will prioritize recurring weakness repair.</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <Pill key={topic} active={form.weakestTopics.includes(topic)} onClick={() => update("weakestTopics", toggle(form.weakestTopics, topic))}>{topic}</Pill>
                    ))}
                  </div>
                </div>
              ) : null}

              {step === 5 ? (
                <div className="grid gap-8 md:grid-cols-3">
                  <div>
                    <h2 className="text-lg font-semibold">Daily prep time</h2>
                    <div className="mt-5 grid gap-2">
                      {(["30 mins", "1 hour", "2+ hours"] as const).map((item) => <Pill key={item} active={form.dailyPrepTime === item} onClick={() => update("dailyPrepTime", item)}>{item}</Pill>)}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Learning style</h2>
                    <div className="mt-5 grid gap-2">
                      {(["Competitive", "Guided", "Interview simulation", "Concept-first", "Fast-paced"] as const).map((item) => <Pill key={item} active={form.learningStyle === item} onClick={() => update("learningStyle", item)}>{item}</Pill>)}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Target timeline</h2>
                    <div className="mt-5 grid gap-2">
                      {(["1 month", "3 months", "6 months"] as const).map((item) => <Pill key={item} active={form.targetTimeline === item} onClick={() => update("targetTimeline", item)}>{item}</Pill>)}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 6 ? (
                <div>
                  <h2 className="text-xl font-semibold">Initial diagnostic</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Optional quick baseline. You can refine this after your first real interview simulation.</p>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {([
                      ["codingScore", "Coding"],
                      ["communicationScore", "Communication"],
                      ["systemDesignScore", "System design"]
                    ] as const).map(([key, label]) => (
                      <label key={key} className="rounded-lg border p-4">
                        <span className="text-sm font-medium">{label}</span>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={form.diagnostic?.[key] ?? 50}
                          onChange={(event) => update("diagnostic", { ...form.diagnostic, [key]: Number(event.target.value) })}
                          className="mt-3"
                        />
                      </label>
                    ))}
                  </div>
                  <Input
                    value={form.diagnostic?.notes ?? ""}
                    onChange={(event) => update("diagnostic", { ...form.diagnostic, notes: event.target.value })}
                    placeholder="Anything your mentor should know?"
                    className="mt-4"
                  />
                </div>
              ) : null}

              {step === 7 ? (
                <div className="grid gap-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-md bg-primary text-primary-foreground"><Target className="size-5" /></span>
                    <div>
                      <h2 className="text-xl font-semibold">Your adaptive baseline is ready</h2>
                      <p className="text-sm text-muted-foreground">This will initialize your dashboard, roadmap, coach memory, and skill graph.</p>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border p-4"><p className="text-xs uppercase text-muted-foreground">Target</p><p className="mt-1 font-medium">{form.targetCompanies.join(", ")}</p></div>
                    <div className="rounded-lg border p-4"><p className="text-xs uppercase text-muted-foreground">Focus</p><p className="mt-1 font-medium">{form.weakestTopics.slice(0, 3).join(", ")}</p></div>
                    <div className="rounded-lg border p-4"><p className="text-xs uppercase text-muted-foreground">Style</p><p className="mt-1 font-medium">{form.learningStyle}</p></div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between gap-3 border-t pt-5">
            <Button variant="outline" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
              <ChevronLeft className="size-4" />
              Back
            </Button>
            <Button onClick={next} loading={complete.isPending} disabled={form.targetCompanies.length === 0 || form.weakestTopics.length === 0}>
              {step === steps.length - 1 ? <Check className="size-4" /> : <ChevronRight className="size-4" />}
              {step === steps.length - 1 ? "Build my plan" : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
