import { GeminiService } from "./gemini.service.js";

const gemini = new GeminiService();

export class InterviewAiService {
  private interviewerInput(input: { role: string; topic: string; message: string }) {
    return {
      systemInstruction:
        "You are PrepNexo's senior technical interviewer. Be direct, realistic, and coaching-oriented. Ask one focused follow-up question after giving brief feedback.",
      prompt: `Candidate target role: ${input.role}\nInterview topic: ${input.topic}\nCandidate message:\n${input.message}`,
      temperature: 0.45
    };
  }

  private codeFeedbackInput(input: { language: string; code: string; prompt?: string }) {
    return {
      systemInstruction:
        "You are a technical interviewer reviewing code. Return concise feedback with correctness, complexity, edge cases, and one next improvement.",
      prompt: `Language: ${input.language}\nProblem prompt: ${input.prompt ?? "Not provided"}\nCode:\n${input.code}`,
      temperature: 0.25
    };
  }

  private systemDesignFeedbackInput(input: { scenario: string; designNotes: string }) {
    return {
      systemInstruction:
        "You are a staff system design interviewer. Evaluate architecture, scalability, reliability, data model, observability, and tradeoffs.",
      prompt: `Scenario:\n${input.scenario}\n\nCandidate design notes:\n${input.designNotes}`,
      temperature: 0.3
    };
  }

  private roadmapInput(input: { targetRole: string; weakTopics: string[]; recentScores: number[] }) {
    return {
      systemInstruction:
        "Create a practical interview prep roadmap. Keep it structured, specific, and optimized for a busy engineer.",
      prompt: `Target role: ${input.targetRole}\nWeak topics: ${input.weakTopics.join(", ")}\nRecent scores: ${input.recentScores.join(", ")}`,
      temperature: 0.35
    };
  }

  interviewerReply(input: { role: string; topic: string; message: string }) {
    return gemini.generateText(this.interviewerInput(input));
  }

  streamInterviewerReply(input: { role: string; topic: string; message: string }) {
    return gemini.streamText(this.interviewerInput(input));
  }

  codeFeedback(input: { language: string; code: string; prompt?: string }) {
    return gemini.generateText(this.codeFeedbackInput(input));
  }

  streamCodeFeedback(input: { language: string; code: string; prompt?: string }) {
    return gemini.streamText(this.codeFeedbackInput(input));
  }

  systemDesignFeedback(input: { scenario: string; designNotes: string }) {
    return gemini.generateText(this.systemDesignFeedbackInput(input));
  }

  streamSystemDesignFeedback(input: { scenario: string; designNotes: string }) {
    return gemini.streamText(this.systemDesignFeedbackInput(input));
  }

  roadmap(input: { targetRole: string; weakTopics: string[]; recentScores: number[] }) {
    return gemini.generateText(this.roadmapInput(input));
  }

  streamRoadmap(input: { targetRole: string; weakTopics: string[]; recentScores: number[] }) {
    return gemini.streamText(this.roadmapInput(input));
  }
}
