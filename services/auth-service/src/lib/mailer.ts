import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const EMAIL_TIMEOUT_MS = 8_000;

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export function renderPrepNexoEmail(input: {
  preheader: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  secondaryText?: string;
}) {
  const text = [
    input.title,
    "",
    input.body,
    "",
    `${input.ctaLabel}: ${input.ctaUrl}`,
    "",
    input.secondaryText,
    "",
    "PrepNexo - Train for real technical interviews",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${input.title}</title>
  </head>
  <body style="margin:0;background:#08070d;color:#f8fafc;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${input.preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#08070d;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border:1px solid #272335;border-radius:18px;overflow:hidden;background:#11101a;box-shadow:0 24px 80px rgba(255,0,102,0.18);">
            <tr>
              <td style="padding:28px 28px 22px;background:linear-gradient(135deg,#180818 0%,#12111d 52%,#0b1520 100%);border-bottom:1px solid #272335;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="font-size:24px;font-weight:900;letter-spacing:0;color:#ffffff;">PrepNexo</div>
                      <div style="margin-top:6px;font-size:13px;color:#b9b4c8;">Train for real technical interviews</div>
                    </td>
                    <td align="right">
                      <div style="display:inline-block;border:1px solid rgba(255,0,102,0.38);border-radius:999px;padding:8px 12px;color:#ff0a6c;font-size:12px;font-weight:700;">Learn. Compete. Grow.</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px;">
                <div style="display:inline-block;border:1px solid #342c45;background:#181522;border-radius:10px;padding:8px 11px;color:#ff0a6c;font-size:13px;font-weight:800;">${input.eyebrow}</div>
                <h1 style="margin:20px 0 0;font-size:30px;line-height:1.15;color:#ffffff;font-weight:900;">${input.title}</h1>
                <p style="margin:16px 0 0;color:#c9c3d6;font-size:16px;line-height:1.7;">${input.body}</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:28px;">
                  <tr>
                    <td style="border-radius:12px;background:#ff0a6c;">
                      <a href="${input.ctaUrl}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:900;">${input.ctaLabel}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:22px 0 0;color:#8f879d;font-size:13px;line-height:1.6;">If the button does not work, copy and paste this link into your browser:<br><a href="${input.ctaUrl}" style="color:#ff5b9b;word-break:break-all;">${input.ctaUrl}</a></p>
                ${
                  input.secondaryText
                    ? `<div style="margin-top:22px;border:1px solid #272335;background:#0c0b12;border-radius:12px;padding:14px;color:#aaa3b8;font-size:13px;line-height:1.6;">${input.secondaryText}</div>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;border-top:1px solid #272335;background:#0c0b12;color:#81798e;font-size:12px;line-height:1.6;">
                PrepNexo will never ask for bank passwords, OTPs, or employer credentials. This email was sent for account security or access to your PrepNexo account.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { html, text };
}

export async function sendEmail(options: EmailOptions) {
  if (!resend) {
    console.info(
      `[email:dev] ${options.subject} -> ${options.to}\n${options.text ?? options.html}`,
    );
    return;
  }

  const { error } = await Promise.race([
    resend.emails.send({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
    new Promise<never>((_resolve, reject) => {
      setTimeout(
        () => reject(new Error("Email delivery timed out")),
        EMAIL_TIMEOUT_MS,
      );
    }),
  ]);

  if (error) {
    throw new Error(`Resend email delivery failed: ${error.message}`);
  }
}
