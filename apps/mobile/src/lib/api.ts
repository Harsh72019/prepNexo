import type { ApiResponse, AuthSession, DashboardSummary, PracticeTestCase } from "@interview-battlefield/types";
import { config } from "./config";

async function request<T>(baseUrl: string, path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(payload.message ?? "Request failed");
  }

  return (await response.json()) as T;
}

export async function demoLogin() {
  return request<ApiResponse<AuthSession>>(config.authServiceUrl, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "demo@prepnexo.dev",
      password: "PrepNexo@123"
    })
  });
}

export async function getDashboardSummary(accessToken: string) {
  return request<ApiResponse<DashboardSummary>>(config.authServiceUrl, "/api/dashboard/summary", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export async function getDemoDashboard() {
  const session = await demoLogin();
  return getDashboardSummary(session.data.accessToken);
}

export async function askAiCoach(message: string) {
  return request<ApiResponse<{ text: string }>>(config.aiServiceUrl, "/api/ai/interviewer", {
    method: "POST",
    body: JSON.stringify({
      role: "Senior Full-Stack Engineer",
      topic: "Mobile interview practice",
      message
    })
  });
}

export async function runMobileCode(code: string, testCases?: PracticeTestCase[]) {
  return request<ApiResponse<{ ok: boolean; message: string }>>(config.interviewServiceUrl, "/api/interview/run", {
    method: "POST",
    body: JSON.stringify({ code, testCases })
  });
}
