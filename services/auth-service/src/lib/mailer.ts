import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const EMAIL_TIMEOUT_MS = 8_000;

export async function sendEmail(options: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.info(`[email:dev] ${options.subject} -> ${options.to}\n${options.html}`);
    return;
  }

  const { error } = await Promise.race([
    resend.emails.send({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html
    }),
    new Promise<never>((_resolve, reject) => {
      setTimeout(() => reject(new Error("Email delivery timed out")), EMAIL_TIMEOUT_MS);
    })
  ]);

  if (error) {
    throw new Error(`Resend email delivery failed: ${error.message}`);
  }
}
