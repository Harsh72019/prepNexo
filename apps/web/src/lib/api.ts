import type { ApiResponse, AuthSession, AuthUser, BillingPlanDto, BillingStatusDto, CompanyTag, DailyArena, DashboardSummary, GrowthProfile, OnboardingInput, OnboardingStatus, OverallLeaderboard, PracticeCatalog, PracticeTestCase, PressurePrompt, QuestionType, RazorpayCheckoutOrder, SkillNodeDto, SubmitAttemptInput } from "@interview-battlefield/types";
import { useAuthStore } from "@/stores/auth-store";
import { env } from "./env";

type RequestOptions = RequestInit & {
  accessToken?: string;
  baseUrl?: string;
  timeoutMs?: number;
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const response = await rawRequest(path, options);

  if (response.status === 401 && options.accessToken) {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken && path !== "/api/auth/refresh") {
      const refreshed = await rawRequest<ApiResponse<AuthSession>>("/api/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken })
      });
      if (refreshed.ok) {
        const session = await refreshed.json() as ApiResponse<AuthSession>;
        useAuthStore.getState().setSession(session.data);
        const retried = await rawRequest<T>(path, { ...options, accessToken: session.data.accessToken });
        return parseResponse<T>(retried);
      }
    }
    useAuthStore.getState().clearSession();
  }

  return parseResponse<T>(response);
}

async function rawRequest<T = unknown>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.accessToken) headers.set("Authorization", `Bearer ${options.accessToken}`);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);

  return fetch(`${options.baseUrl ?? env.authServiceUrl}${path}`, {
    ...options,
    headers,
    signal: options.signal ?? controller.signal
  }).catch((error) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please check that the backend service is running.");
    }
    throw error;
  }).finally(() => window.clearTimeout(timeout));
}

async function parseResponse<T>(response: Response) {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: "Request failed" }));
    const issueText = payload.issues && typeof payload.issues === "object"
      ? Object.entries(payload.issues)
        .flatMap(([field, messages]) => Array.isArray(messages) ? messages.map((message) => `${field}: ${message}`) : [])
        .join("; ")
      : "";
    throw new Error(issueText || payload.message || "Request failed");
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    request<ApiResponse<AuthSession>>("/api/auth/register", { method: "POST", body: JSON.stringify(body), timeoutMs: 20_000 }),
  login: (body: { email: string; password: string }) =>
    request<ApiResponse<AuthSession>>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  refresh: (refreshToken: string) =>
    request<ApiResponse<AuthSession>>("/api/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) }),
  me: (accessToken: string) => request<ApiResponse<AuthUser>>("/api/auth/me", { accessToken }),
  forgotPassword: (email: string) =>
    request<ApiResponse<{ accepted: true }>>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    }),
  resetPassword: (body: { token: string; password: string }) =>
    request<void>("/api/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
  verifyEmail: (token: string) =>
    request<void>("/api/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) })
};

export const dashboardApi = {
  summary: (accessToken: string) => request<ApiResponse<DashboardSummary>>("/api/dashboard/summary", { accessToken })
};

export const billingApi = {
  plans: () => request<ApiResponse<BillingPlanDto[]>>("/api/billing/plans"),
  status: (accessToken: string) => request<ApiResponse<BillingStatusDto>>("/api/billing/status", { accessToken }),
  checkoutOrder: (accessToken: string, planCode: string) =>
    request<ApiResponse<RazorpayCheckoutOrder>>("/api/billing/checkout-order", {
      accessToken,
      method: "POST",
      body: JSON.stringify({ planCode }),
      timeoutMs: 20_000
    }),
  verify: (accessToken: string, body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    request<ApiResponse<BillingStatusDto>>("/api/billing/verify", {
      accessToken,
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 20_000
    }),
  adminPlans: (accessToken: string) => request<ApiResponse<BillingPlanDto[]>>("/api/billing/admin/plans", { accessToken }),
  saveAdminPlan: (accessToken: string, body: Omit<BillingPlanDto, "id">) =>
    request<ApiResponse<BillingPlanDto>>("/api/billing/admin/plans", {
      accessToken,
      method: "POST",
      body: JSON.stringify(body)
    })
};

export const onboardingApi = {
  status: (accessToken: string) => request<ApiResponse<OnboardingStatus>>("/api/onboarding/status", { accessToken }),
  complete: (accessToken: string, body: OnboardingInput) =>
    request<ApiResponse<OnboardingStatus>>("/api/onboarding/complete", {
      accessToken,
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 60_000
    })
};

export const practiceApi = {
  catalog: (accessToken: string) => request<ApiResponse<PracticeCatalog>>("/api/practice/catalog", { accessToken }),
  submitAttempt: (accessToken: string, body: SubmitAttemptInput) =>
    request<ApiResponse<{ id: string }>>("/api/practice/attempts", {
      accessToken,
      method: "POST",
      body: JSON.stringify(body)
    }),
  runCode: (body: { code: string; testCases?: PracticeTestCase[]; language?: string }) =>
    request<ApiResponse<{ ok: boolean; message: string }>>("/api/interview/run", {
      baseUrl: env.interviewServiceUrl,
      method: "POST",
      body: JSON.stringify(body)
    }),
  adminQuestions: (accessToken: string) => request<ApiResponse<QuestionAdminDto[]>>("/api/practice/admin/questions", { accessToken }),
  saveAdminQuestion: (accessToken: string, body: QuestionAdminInput) =>
    request<ApiResponse<QuestionAdminDto>>("/api/practice/admin/questions", {
      accessToken,
      method: "POST",
      body: JSON.stringify(body)
    })
};

export type QuestionAdminInput = {
  slug: string;
  type: QuestionType;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  company?: string | null;
  companyTags: CompanyTag[];
  heading: string;
  description: string;
  acceptanceText?: string | null;
  starterCode?: string | null;
  testCases: Array<{ input: number[]; expected: number | string | boolean | unknown[] | Record<string, unknown> }>;
  examples: unknown[];
  constraints: unknown[];
  skillKeys: string[];
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
};

export type QuestionAdminDto = QuestionAdminInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export const adaptiveApi = {
  growthProfile: (accessToken: string) => request<ApiResponse<GrowthProfile>>("/api/adaptive/growth-profile", { accessToken }),
  skillGraph: (accessToken: string) => request<ApiResponse<SkillNodeDto[]>>("/api/adaptive/skill-graph", { accessToken }),
  dailySession: (accessToken: string) => request<ApiResponse<GrowthProfile["nextSession"]>>("/api/adaptive/daily-session", { accessToken }),
  pressure: (accessToken: string, body: { sessionId?: string; surface?: string; topic?: string }) =>
    request<ApiResponse<PressurePrompt>>("/api/adaptive/pressure", {
      accessToken,
      method: "POST",
      body: JSON.stringify(body)
    })
};

export const arenaApi = {
  today: (accessToken: string, mode: "ranked" | "practice") => request<ApiResponse<DailyArena>>(`/api/arena/today?mode=${mode}`, { accessToken }),
  submit: (accessToken: string, body: { mode: "ranked" | "practice"; score: number; solved: number; penalty: number }) =>
    request<ApiResponse<DailyArena>>("/api/arena/submit", {
      accessToken,
      method: "POST",
      body: JSON.stringify(body)
    }),
  overall: (accessToken: string) => request<ApiResponse<OverallLeaderboard>>("/api/arena/overall", { accessToken })
};

export const aiApi = {
  interviewer: (body: { role: string; topic: string; message: string }) =>
    request<ApiResponse<{ text: string }>>("/api/ai/interviewer", {
      baseUrl: env.aiServiceUrl,
      method: "POST",
      body: JSON.stringify(body)
    }),
  codeFeedback: (body: { language: string; code: string; prompt?: string }) =>
    request<ApiResponse<{ text: string }>>("/api/ai/code-feedback", {
      baseUrl: env.aiServiceUrl,
      method: "POST",
      body: JSON.stringify(body)
    }),
  systemDesignFeedback: (body: { scenario: string; designNotes: string }) =>
    request<ApiResponse<{ text: string }>>("/api/ai/system-design-feedback", {
      baseUrl: env.aiServiceUrl,
      method: "POST",
      body: JSON.stringify(body)
    }),
  roadmap: (body: { targetRole: string; weakTopics: string[]; recentScores: number[] }) =>
    request<ApiResponse<{ text: string }>>("/api/ai/roadmap", {
      baseUrl: env.aiServiceUrl,
      method: "POST",
      body: JSON.stringify(body)
    })
};

async function streamRequest(path: string, body: unknown, onToken: (token: string) => void) {
  const response = await fetch(`${env.aiServiceUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => ({ message: "AI request failed" }));
    throw new Error(payload.message ?? "AI request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const eventName = event.split("\n").find((line) => line.startsWith("event:"))?.slice(6).trim();
      const dataLine = event.split("\n").find((line) => line.startsWith("data:"));
      if (!dataLine) continue;
      const payload = JSON.parse(dataLine.slice(5));
      if (eventName === "error") throw new Error(payload.message ?? "AI stream failed");
      if (eventName === "done") return;
      if (typeof payload.text === "string") onToken(payload.text);
    }
  }
}

export const aiStreamApi = {
  interviewer: (body: { role: string; topic: string; message: string }, onToken: (token: string) => void) =>
    streamRequest("/api/ai/interviewer/stream", body, onToken),
  codeFeedback: (body: { language: string; code: string; prompt?: string }, onToken: (token: string) => void) =>
    streamRequest("/api/ai/code-feedback/stream", body, onToken),
  systemDesignFeedback: (body: { scenario: string; designNotes: string }, onToken: (token: string) => void) =>
    streamRequest("/api/ai/system-design-feedback/stream", body, onToken),
  roadmap: (body: { targetRole: string; weakTopics: string[]; recentScores: number[] }, onToken: (token: string) => void) =>
    streamRequest("/api/ai/roadmap/stream", body, onToken)
};
