import cors from "cors";
import express from "express";
import helmet from "helmet";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { config } from "./config.js";
import { connectDb } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { contentRouter } from "./routes/content.js";
import { projectsRouter } from "./routes/projects.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const publicDir = path.resolve(__dirname, "../public");

app.disable("x-powered-by");
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'", ...config.corsOrigins],
        fontSrc: ["'self'", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }),
);
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
    }
  });
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: "mongodb" });
});

app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/projects", projectsRouter);

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? `Le fichier est trop lourd. Taille maximale: ${error.field === "apk" ? "40 Mo" : error.field === "logo" ? "3 Mo" : error.field === "screenshot" ? "5 Mo" : error.field === "profile" ? "4 Mo" : "8 Mo"}.`
          : "Upload impossible. Vérifie le fichier envoyé.",
    });
  }

  if (error.message?.includes("Format non supporté")) {
    return res.status(400).json({ message: error.message });
  }

  if (error.name === "ZodError") {
    return res.status(400).json({
      message: "Données invalides.",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  return res.status(500).json({
    message:
      "Erreur serveur. Vérifie que MongoDB est lancé et que MONGODB_URI pointe vers la bonne base.",
  });
});

connectDb()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`API running on http://localhost:${config.port}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to MongoDB:", error.message);
    process.exit(1);
  });
