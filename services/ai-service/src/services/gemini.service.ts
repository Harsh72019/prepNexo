import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { HttpError } from "../lib/http-error.js";

type GenerateInput = {
  systemInstruction: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  thinkingBudget?: number;
  cacheKey?: string;
  cacheableContext?: string;
};

export class GeminiService {
  private cacheNames = new Map<string, string>();
  private cachePromises = new Map<string, Promise<string | undefined>>();
  private unavailableCacheKeys = new Set<string>();

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

  private warmCache(input: GenerateInput) {
    if (!input.cacheKey || !input.cacheableContext) return undefined;
    if (this.unavailableCacheKeys.has(input.cacheKey)) return undefined;
    const existing = this.cacheNames.get(input.cacheKey);
    if (existing) return existing;

    const pending = this.cachePromises.get(input.cacheKey);
    if (pending) return undefined;

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
        this.unavailableCacheKeys.add(input.cacheKey!);
        console.warn(
          `AI prompt cache unavailable for ${input.cacheKey}; falling back to inline prompt`,
          error,
        );
        return undefined;
      });

    this.cachePromises.set(input.cacheKey, promise);
    void promise;
    return undefined;
  }

  private generationConfig(input: GenerateInput, cachedContent?: string) {
    return {
      ...(cachedContent
        ? { cachedContent }
        : { systemInstruction: input.systemInstruction }),
      temperature: input.temperature ?? 0.35,
      maxOutputTokens: input.maxOutputTokens ?? 420,
      thinkingConfig: { thinkingBudget: input.thinkingBudget ?? 0 },
    };
  }

  private inlinePrompt(input: GenerateInput) {
    return input.cacheableContext
      ? `${input.cacheableContext}\n\n${input.prompt}`
      : input.prompt;
  }

  async generateText(input: GenerateInput) {
    const cachedContent = this.warmCache(input);
    const response = await this.client().models.generateContent({
      model: env.GEMINI_MODEL,
      contents: cachedContent ? input.prompt : this.inlinePrompt(input),
      config: this.generationConfig(input, cachedContent),
    });

    return response.text ?? "";
  }

  async *streamText(input: GenerateInput) {
    const cachedContent = this.warmCache(input);
    const stream = await this.client().models.generateContentStream({
      model: env.GEMINI_MODEL,
      contents: cachedContent ? input.prompt : this.inlinePrompt(input),
      config: this.generationConfig(input, cachedContent),
    });

    for await (const chunk of stream) {
      if (chunk.text) yield chunk.text;
    }
  }
}
