import jwt from "jsonwebtoken";
import type { AuthUser } from "@interview-battlefield/types";
import { env } from "../config/env.js";

type AccessPayload = {
  sub: string;
  email: string;
  role: AuthUser["role"];
};

export function signAccessToken(user: Pick<AuthUser, "id" | "email" | "role">) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role } satisfies AccessPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"]
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload & jwt.JwtPayload;
}
