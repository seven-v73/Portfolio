import jwt from "jsonwebtoken";
import { config } from "../config.js";

const sessionCookieName = "portfolio_admin_session";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const token = bearerToken || getCookie(req.headers.cookie || "", sessionCookieName);

  if (!token) {
    return res.status(401).json({ message: "Authentification requise." });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: "Session invalide ou expirée." });
  }
}

function getCookie(cookieHeader, name) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || "";
}
