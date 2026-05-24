"use client";

import { Button } from "@interview-battlefield/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@interview-battlefield/ui/components/card";
import { Field } from "@interview-battlefield/ui/components/field";
import { Input } from "@interview-battlefield/ui/components/input";
import { Bot, Send } from "lucide-react";
import { useState } from "react";
import { useGrowthProfile } from "@/hooks/use-adaptive";
import { aiStreamApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { MarkdownContent } from "./markdown-content";

type CoachMessage = {
  role: "candidate" | "interviewer";
  text: string;
};

export function AiCoachClient() {
  const user = useAuthStore((state) => state.user);
  const growth = useGrowthProfile();
  const [topic, setTopic] = useState("System design tradeoffs");
  const [message, setMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      role: "interviewer",
      text: "Pick a topic and answer as if we are in a real interview. I will push on clarity, tradeoffs, and depth.",
    },
  ]);

  async function submit() {
    const trimmed = message.trim();
    if (!trimmed) return;

    setMessage("");
    setMessages((current) => [
      ...current,
      { role: "candidate", text: trimmed },
    ]);
    const context = growth.data
      ? `\n\nPersistent learner profile:\nReadiness ${growth.data.readinessScore}, league ${growth.data.rating.league}, weak patterns ${growth.data.weakPatterns.map((pattern) => pattern.label).join(", ")}, coach memory ${growth.data.coachMemories.map((memory) => memory.summary).join(" ")}\nCandidate answer:\n${trimmed}`
      : trimmed;
    const interviewerIndex = messages.length + 1;
    setMessages((current) => [...current, { role: "interviewer", text: "" }]);
    setIsStreaming(true);
    try {
      await aiStreamApi.interviewer(
        {
          role:
            user?.role === "ADMIN"
              ? "Staff Engineer"
              : "Senior Full-Stack Engineer",
          topic,
          message: context,
        },
        (token) => {
          setMessages((current) =>
            current.map((item, index) =>
              index === interviewerIndex
                ? { ...item, text: item.text + token }
                : item,
            ),
          );
        },
      );
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "AI response failed";
      setMessages((current) =>
        current.map((item, index) =>
          index === interviewerIndex ? { ...item, text } : item,
        ),
      );
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-primary">AI interviewer</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal">
          AI coach
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Practice answers with an AI interviewer that responds with focused
          feedback and follow-up questions.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Session setup</CardTitle>
            <CardDescription>
              The coach uses your persisted skill graph and coach memory.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field id="topic" label="Topic">
              <Input
                id="topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              />
            </Field>
            {growth.data ? (
              <div className="grid gap-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs uppercase text-muted-foreground">
                    Current rank
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {growth.data.rating.rankTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {growth.data.rating.rating} · {growth.data.rating.league}
                  </p>
                </div>
                {growth.data.coachMemories.slice(0, 3).map((memory) => (
                  <div
                    key={memory.key}
                    className="rounded-md border p-3 text-sm text-muted-foreground"
                  >
                    {memory.summary}
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="size-4 text-primary" /> Interview thread
            </CardTitle>
            <CardDescription>
              Responses come from the AI service, never directly from the
              browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid max-h-[520px] gap-3 overflow-y-auto rounded-md border bg-background/60 p-3">
              {messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={
                    item.role === "candidate"
                      ? "ml-auto max-w-[82%] rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "mr-auto max-w-[82%] rounded-md border bg-card px-3 py-2 text-sm"
                  }
                >
                  {item.role === "interviewer" ? (
                    <MarkdownContent text={item.text || "Thinking..."} />
                  ) : (
                    item.text
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submit();
                  }
                }}
                placeholder="Answer the interviewer..."
              />
              <Button
                onClick={submit}
                loading={isStreaming}
                aria-label="Send answer"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
