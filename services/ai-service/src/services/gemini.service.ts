import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { HttpError } from "../lib/http-error.js";

type GenerateInput = {
  systemInstruction: string;
  prompt: string;
  temperature?: number;
  cacheKey?: string;
  cacheableContext?: string;
};

export class GeminiService {
  private cacheNames = new Map<string, string>();
  private cachePromises = new Map<string, Promise<string | undefined>>();

  private client() {
    if (!env.GEMINI_API_KEY) {
      throw new HttpError(
        503,
        "AI API key is not configured",
        "AI_NOT_CONFIGURED",
      );
    }

    return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  private async cachedContentName(input: GenerateInput) {
    if (!input.cacheKey || !input.cacheableContext) return undefined;
    const existing = this.cacheNames.get(input.cacheKey);
    if (existing) return existing;

    const pending = this.cachePromises.get(input.cacheKey);
    if (pending) return pending;

    const promise = this.client()
      .caches.create({
        model: env.GEMINI_MODEL,
        config: {
          displayName: `prepnexo-${input.cacheKey}`,
          systemInstruction: input.systemInstruction,
          contents: input.cacheableContext,
          ttl: "86400s",
        },
      })
      .then((cache) => {
        if (cache.name) this.cacheNames.set(input.cacheKey!, cache.name);
        this.cachePromises.delete(input.cacheKey!);
        return cache.name;
      })
      .catch((error) => {
        this.cachePromises.delete(input.cacheKey!);
        console.warn(
          "AI prompt cache unavailable; falling back to inline prompt",
          error,
        );
        return undefined;
      });

    this.cachePromises.set(input.cacheKey, promise);
    return promise;
  }

  private inlinePrompt(input: GenerateInput) {
    return input.cacheableContext
      ? `${input.cacheableContext}\n\n${input.prompt}`
      : input.prompt;
  }

  async generateText(input: GenerateInput) {
    const cachedContent = await this.cachedContentName(input);
    const response = await this.client().models.generateContent({
      model: env.GEMINI_MODEL,
      contents: cachedContent ? input.prompt : this.inlinePrompt(input),
      config: {
        ...(cachedContent
          ? { cachedContent }
          : { systemInstruction: input.systemInstruction }),
        temperature: input.temperature ?? 0.35,
      },
    });

    return response.text ?? "";
  }

  async *streamText(input: GenerateInput) {
    const cachedContent = await this.cachedContentName(input);
    const stream = await this.client().models.generateContentStream({
      model: env.GEMINI_MODEL,
      contents: cachedContent ? input.prompt : this.inlinePrompt(input),
      config: {
        ...(cachedContent
          ? { cachedContent }
          : { systemInstruction: input.systemInstruction }),
        temperature: input.temperature ?? 0.35,
      },
    });

    for await (const chunk of stream) {
      if (chunk.text) yield chunk.text;
    }
  }
}
