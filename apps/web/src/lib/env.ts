export const env = {
  authServiceUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://localhost:4001",
  interviewServiceUrl: process.env.NEXT_PUBLIC_INTERVIEW_SERVICE_URL ?? "http://localhost:4002",
  aiServiceUrl: process.env.NEXT_PUBLIC_AI_SERVICE_URL ?? "http://localhost:4003"
};
