import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

export const authRouter = Router();
const sessionCookieName = "portfolio_admin_session";
const sessionMaxAgeMs = 8 * 60 * 60 * 1000;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Trop de tentatives. Réessaie dans quelques minutes." },
});

authRouter.post("/login", loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });

  if (!user) {
    return res.status(401).json({ message: "Identifiants incorrects." });
  }

  const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordIsValid) {
    return res.status(401).json({ message: "Identifiants incorrects." });
  }

  const token = jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: "8h" },
  );
  setSessionCookie(res, token);

  return res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}));

authRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  return res.json({ user: req.user });
}));

authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  return res.status(204).send();
});

function setSessionCookie(res, token) {
  res.cookie(sessionCookieName, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
    maxAge: sessionMaxAgeMs,
    path: "/",
  });
}

function clearSessionCookie(res) {
  res.clearCookie(sessionCookieName, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
    path: "/",
  });
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
