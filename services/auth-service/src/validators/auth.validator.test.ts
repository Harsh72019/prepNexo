import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth.validator.js";

describe("auth validators", () => {
  it("accepts valid registration payloads", () => {
    const result = registerSchema.safeParse({
      body: {
        name: "Demo Candidate",
        email: "demo@example.com",
        password: "long-enough-password"
      }
    });

    expect(result.success).toBe(true);
  });

  it("rejects short passwords and invalid email addresses", () => {
    const result = registerSchema.safeParse({
      body: {
        name: "D",
        email: "not-email",
        password: "short"
      }
    });

    expect(result.success).toBe(false);
  });

  it("requires a password for login", () => {
    const result = loginSchema.safeParse({ body: { email: "demo@example.com", password: "" } });
    expect(result.success).toBe(false);
  });
});
