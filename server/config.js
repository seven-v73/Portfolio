import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const defaultJwtSecret = "dev-only-change-this-secret";
const defaultAdminPassword = "Portfolio@2026!";

if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === defaultJwtSecret)) {
  throw new Error("JWT_SECRET must be set to a strong secret in production.");
}

if (isProduction && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === defaultAdminPassword)) {
  throw new Error("ADMIN_PASSWORD must be set to a strong password in production.");
}

const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  isProduction,
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio",
  corsOrigins,
  jwtSecret: process.env.JWT_SECRET || defaultJwtSecret,
  adminName: process.env.ADMIN_NAME || "Portfolio Admin",
  adminEmail: process.env.ADMIN_EMAIL || "admin@portfolio.local",
  adminPassword: process.env.ADMIN_PASSWORD || defaultAdminPassword,
};
