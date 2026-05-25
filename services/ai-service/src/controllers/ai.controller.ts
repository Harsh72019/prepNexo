import type { Request, Response } from "express";
import { InterviewAiService } from "../services/interview-ai.service.js";

const ai = new InterviewAiService();

async function streamResponse(res: Response, stream: AsyncIterable<string>) {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  res.write("event: start\ndata: {}\n\n");

  try {
    for await (const text of stream) {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write("event: done\ndata: {}\n\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI stream failed";
    res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
  } finally {
    res.end();
  }
}

export class AiController {
  interviewer = async (req: Request, res: Response) => {
    const text = await ai.interviewerReply(req.body);
    res.json({ data: { text } });
  };

  streamInterviewer = async (req: Request, res: Response) => {
    await streamResponse(res, ai.streamInterviewerReply(req.body));
  };

  codeFeedback = async (req: Request, res: Response) => {
    const text = await ai.codeFeedback(req.body);
    res.json({ data: { text } });
  };

  streamCodeFeedback = async (req: Request, res: Response) => {
    await streamResponse(res, ai.streamCodeFeedback(req.body));
  };

  systemDesignFeedback = async (req: Request, res: Response) => {
    const text = await ai.systemDesignFeedback(req.body);
    res.json({ data: { text } });
  };

  streamSystemDesignFeedback = async (req: Request, res: Response) => {
    await streamResponse(res, ai.streamSystemDesignFeedback(req.body));
  };

  roadmap = async (req: Request, res: Response) => {
    const text = await ai.roadmap(req.body);
    res.json({ data: { text } });
  };

  streamRoadmap = async (req: Request, res: Response) => {
    await streamResponse(res, ai.streamRoadmap(req.body));
  };
}
