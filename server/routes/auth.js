import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(async (req, res) => {
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

  return res.json({
    token,
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

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
