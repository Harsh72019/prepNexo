import type { TokenType } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export class TokenRepository {
  createRefreshToken(input: { tokenHash: string; userId: string; familyId: string; expiresAt: Date }) {
    return prisma.refreshToken.create({ data: input });
  }

  findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
  }

  revokeRefreshToken(id: string, replacedBy?: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), replacedBy }
    });
  }

  revokeRefreshFamily(familyId: string) {
    return prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  createAuthToken(input: { type: TokenType; tokenHash: string; userId: string; expiresAt: Date }) {
    return prisma.authToken.create({ data: input });
  }

  findAuthToken(tokenHash: string, type: TokenType) {
    return prisma.authToken.findUnique({ where: { tokenHash }, include: { user: true } }).then((token) => {
      if (token?.type !== type) return null;
      return token;
    });
  }

  markAuthTokenUsed(id: string) {
    return prisma.authToken.update({ where: { id }, data: { usedAt: new Date() } });
  }
}
