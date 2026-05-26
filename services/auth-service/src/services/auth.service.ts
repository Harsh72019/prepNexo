import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { TokenType } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { createOpaqueToken, sha256 } from "../lib/crypto.js";
import { HttpError } from "../lib/http-error.js";
import { signAccessToken } from "../lib/jwt.js";
import { renderPrepNexoEmail, sendEmail } from "../lib/mailer.js";
import { TokenRepository } from "../repositories/token.repository.js";
import { UserRepository } from "../repositories/user.repository.js";

const users = new UserRepository();
const tokens = new TokenRepository();

export class AuthService {
  async register(input: { name: string; email: string; password: string }) {
    const email = input.email.toLowerCase();
    const existing = await users.findByEmail(email);
    if (existing)
      throw new HttpError(
        409,
        "An account already exists for this email",
        "EMAIL_IN_USE",
      );

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await users.create({
      name: input.name,
      email,
      passwordHash,
      profile: { create: {} },
    });

    void this.issueEmailVerification(user.id, user.email).catch((error) => {
      console.error("Email verification setup failed", error);
    });
    return this.createSession(user);
  }

  async login(input: { email: string; password: string }) {
    const user = await users.findByEmail(input.email);
    if (!user?.passwordHash)
      throw new HttpError(
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS",
      );

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid)
      throw new HttpError(
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS",
      );

    return this.createSession(user);
  }

  async refresh(refreshToken: string) {
    const tokenHash = sha256(refreshToken);
    const stored = await tokens.findRefreshToken(tokenHash);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      if (stored?.familyId) await tokens.revokeRefreshFamily(stored.familyId);
      throw new HttpError(
        401,
        "Refresh token is invalid or expired",
        "INVALID_REFRESH_TOKEN",
      );
    }

    const replacement = createOpaqueToken();
    const replacementHash = sha256(replacement);
    const expiresAt = this.refreshExpiry();

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date(), replacedBy: replacementHash },
      }),
      prisma.refreshToken.create({
        data: {
          tokenHash: replacementHash,
          userId: stored.userId,
          familyId: stored.familyId,
          expiresAt,
        },
      }),
    ]);

    return {
      user: users.serialize(stored.user),
      accessToken: signAccessToken(stored.user),
      refreshToken: replacement,
    };
  }

  async logout(refreshToken: string) {
    const stored = await tokens.findRefreshToken(sha256(refreshToken));
    if (stored && !stored.revokedAt) await tokens.revokeRefreshToken(stored.id);
  }

  async forgotPassword(email: string) {
    const user = await users.findByEmail(email);
    if (!user) return;

    const token = createOpaqueToken();
    await tokens.createAuthToken({
      type: TokenType.PASSWORD_RESET,
      tokenHash: sha256(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    });

    const resetUrl = `${env.WEB_URL}/reset-password?token=${token}`;
    const emailContent = renderPrepNexoEmail({
      preheader: "Reset your PrepNexo password securely.",
      eyebrow: "Account recovery",
      title: "Reset your PrepNexo password",
      body: "We received a request to reset your password. Use the secure link below to choose a new password. This link expires in 30 minutes.",
      ctaLabel: "Reset password",
      ctaUrl: resetUrl,
      secondaryText:
        "If you did not request this, you can ignore this email. Your current password will stay unchanged.",
    });

    await sendEmail({
      to: user.email,
      subject: "Reset your PrepNexo password",
      ...emailContent,
    });
  }

  async resetPassword(input: { token: string; password: string }) {
    const stored = await tokens.findAuthToken(
      sha256(input.token),
      TokenType.PASSWORD_RESET,
    );
    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new HttpError(
        400,
        "Password reset token is invalid or expired",
        "INVALID_RESET_TOKEN",
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash },
      }),
      prisma.authToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async verifyEmail(token: string) {
    const stored = await tokens.findAuthToken(
      sha256(token),
      TokenType.EMAIL_VERIFICATION,
    );
    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new HttpError(
        400,
        "Email verification token is invalid or expired",
        "INVALID_EMAIL_TOKEN",
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: stored.userId },
        data: { emailVerified: true },
      }),
      prisma.authToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  getGoogleAuthUrl() {
    const client = this.googleClient();
    return client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "consent",
    });
  }

  async handleGoogleCallback(code: string) {
    const client = this.googleClient();
    const { tokens: googleTokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: googleTokens.id_token ?? "",
      audience: env.GOOGLE_CLIENT_ID,
    });
    const profile = ticket.getPayload();
    if (!profile?.email || !profile.sub)
      throw new HttpError(401, "Google profile is missing required fields");
    const googleEmail = profile.email.toLowerCase();
    const googleName =
      profile.name ?? googleEmail.split("@")[0] ?? "Google Candidate";
    const googlePicture = profile.picture;
    const googleEmailVerified = Boolean(profile.email_verified);
    const googleSubject = profile.sub;

    const user = await prisma.$transaction(async (tx) => {
      const account = await tx.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "google",
            providerAccountId: googleSubject,
          },
        },
        include: { user: true },
      });
      if (account) return account.user;

      const existing = await tx.user.findUnique({
        where: { email: googleEmail },
      });
      const createdUser =
        existing ??
        (await tx.user.create({
          data: {
            email: googleEmail,
            name: googleName,
            imageUrl: googlePicture,
            emailVerified: googleEmailVerified,
            profile: { create: {} },
          },
        }));

      await tx.oAuthAccount.create({
        data: {
          provider: "google",
          providerAccountId: googleSubject,
          userId: createdUser.id,
        },
      });

      return createdUser;
    });

    return this.createSession(user);
  }

  async me(userId: string) {
    const user = await users.findById(userId);
    if (!user) throw new HttpError(404, "User not found", "USER_NOT_FOUND");
    return users.serialize(user);
  }

  private async createSession(
    user: Awaited<ReturnType<UserRepository["findById"]>>,
  ) {
    if (!user) throw new HttpError(404, "User not found");

    const refreshToken = createOpaqueToken();
    await tokens.createRefreshToken({
      tokenHash: sha256(refreshToken),
      userId: user.id,
      familyId: nanoid(),
      expiresAt: this.refreshExpiry(),
    });

    return {
      user: users.serialize(user),
      accessToken: signAccessToken(user),
      refreshToken,
    };
  }

  private async issueEmailVerification(userId: string, email: string) {
    const token = createOpaqueToken();
    await tokens.createAuthToken({
      type: TokenType.EMAIL_VERIFICATION,
      tokenHash: sha256(token),
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    const verifyUrl = `${env.WEB_URL}/verify-email?token=${token}`;
    const emailContent = renderPrepNexoEmail({
      preheader: "Confirm your email to secure your PrepNexo account.",
      eyebrow: "Verify email",
      title: "Confirm your PrepNexo email",
      body: "Welcome to PrepNexo. Confirm your email so we can protect your account, save your interview progress, and send important account updates.",
      ctaLabel: "Verify email",
      ctaUrl: verifyUrl,
      secondaryText:
        "This verification link expires in 24 hours. You can still use Google sign in if your Google account email is already verified.",
    });

    await sendEmail({
      to: email,
      subject: "Verify your PrepNexo email",
      ...emailContent,
    });
  }

  private refreshExpiry() {
    return new Date(
      Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
  }

  private googleClient() {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new HttpError(
        503,
        "Google OAuth is not configured",
        "OAUTH_NOT_CONFIGURED",
      );
    }
    return new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      `${env.WEB_URL}/api/auth/google/callback`,
    );
  }
}
