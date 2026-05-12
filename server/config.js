import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio",
  jwtSecret: process.env.JWT_SECRET || "dev-only-change-this-secret",
  adminName: process.env.ADMIN_NAME || "Portfolio Admin",
  adminEmail: process.env.ADMIN_EMAIL || "admin@portfolio.local",
  adminPassword: process.env.ADMIN_PASSWORD || "Portfolio@2026!",
};
