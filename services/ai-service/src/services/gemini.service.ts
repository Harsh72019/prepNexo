import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { HttpError } from "../lib/http-error.js";

type GenerateInput = {
  systemInstruction: string;
  prompt: string;
  temperature?: number;
};

export class GeminiService {
  private client() {
    if (!env.GEMINI_API_KEY) {
      throw new HttpError(503, "Gemini API key is not configured", "GEMINI_NOT_CONFIGURED");
    }

    return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  async generateText(input: GenerateInput) {
    const response = await this.client().models.generateContent({
      model: env.GEMINI_MODEL,
      contents: input.prompt,
      config: {
        systemInstruction: input.systemInstruction,
        temperature: input.temperature ?? 0.35
      }
    });

    return response.text ?? "";
  }

  async *streamText(input: GenerateInput) {
    const stream = await this.client().models.generateContentStream({
      model: env.GEMINI_MODEL,
      contents: input.prompt,
      config: {
        systemInstruction: input.systemInstruction,
        temperature: input.temperature ?? 0.35
      }
    });

    for await (const chunk of stream) {
      if (chunk.text) yield chunk.text;
    }
  }
}
