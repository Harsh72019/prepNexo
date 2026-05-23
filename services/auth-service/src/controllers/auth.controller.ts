import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { AuthService } from "../services/auth.service.js";

const auth = new AuthService();

export class AuthController {
  register = async (req: Request, res: Response) => {
    const session = await auth.register(req.body);
    res.status(201).json({ data: session });
  };

  login = async (req: Request, res: Response) => {
    const session = await auth.login(req.body);
    res.json({ data: session });
  };

  refresh = async (req: Request, res: Response) => {
    const session = await auth.refresh(req.body.refreshToken);
    res.json({ data: session });
  };

  logout = async (req: Request, res: Response) => {
    await auth.logout(req.body.refreshToken);
    res.status(204).send();
  };

  forgotPassword = async (req: Request, res: Response) => {
    await auth.forgotPassword(req.body.email);
    res.status(202).json({ data: { accepted: true } });
  };

  resetPassword = async (req: Request, res: Response) => {
    await auth.resetPassword(req.body);
    res.status(204).send();
  };

  verifyEmail = async (req: Request, res: Response) => {
    await auth.verifyEmail(req.body.token);
    res.status(204).send();
  };

  googleRedirect = (_req: Request, res: Response) => {
    res.redirect(auth.getGoogleAuthUrl());
  };

  googleCallback = async (req: Request, res: Response) => {
    const code = String(req.query.code ?? "");
    const session = await auth.handleGoogleCallback(code);
    const params = new URLSearchParams({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    });
    res.redirect(`${env.WEB_URL}/auth/callback?${params.toString()}`);
  };

  me = async (req: Request, res: Response) => {
    const user = await auth.me(req.user!.id);
    res.json({ data: user });
  };
}
