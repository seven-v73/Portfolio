import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { connectDb } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { contentRouter } from "./routes/content.js";
import { projectsRouter } from "./routes/projects.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: "mongodb" });
});

app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/projects", projectsRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
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
