import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { Project } from "../models/Project.js";
import { projectInputSchema } from "../validation.js";

export const projectsRouter = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../../public");
const apkDir = path.join(publicDir, "apks");
const logoDir = path.join(publicDir, "project-logos");
const screenshotDir = path.join(publicDir, "project-screenshots");
const allowedLogoTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/svg+xml", ".svg"],
]);

function createImageUpload({ directory, label, maxSize }) {
  return multer({
    storage: multer.diskStorage({
      destination: async (_req, _file, cb) => {
        try {
          await fs.mkdir(directory, { recursive: true });
          cb(null, directory);
        } catch (error) {
          cb(error);
        }
      },
      filename: (_req, file, cb) => {
        const extension = allowedLogoTypes.get(file.mimetype);
        const safeBase = path
          .basename(file.originalname, path.extname(file.originalname))
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 60) || label;
        cb(null, `${safeBase}-${Date.now()}${extension}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (!allowedLogoTypes.has(file.mimetype)) {
        cb(new Error(`Format non supporté. Envoie ${label === "logo" ? "un logo" : "une capture"} JPG, PNG, WEBP ou SVG.`));
        return;
      }
      cb(null, true);
    },
    limits: { fileSize: maxSize },
  });
}

const logoUpload = createImageUpload({
  directory: logoDir,
  label: "logo",
  maxSize: 3 * 1024 * 1024,
});

const screenshotUpload = createImageUpload({
  directory: screenshotDir,
  label: "capture",
  maxSize: 5 * 1024 * 1024,
});

const apkUpload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      try {
        await fs.mkdir(apkDir, { recursive: true });
        cb(null, apkDir);
      } catch (error) {
        cb(error);
      }
    },
    filename: (_req, file, cb) => {
      const safeBase = path
        .basename(file.originalname, path.extname(file.originalname))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || "application";
      cb(null, `${safeBase}-${Date.now()}.apk`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith(".apk")) {
      cb(new Error("Format non supporté. Envoie un fichier APK."));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: 80 * 1024 * 1024 },
});

projectsRouter.get("/", asyncHandler(async (_req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  return res.json({ projects });
}));

projectsRouter.post(
  "/logo",
  requireAuth,
  logoUpload.single("logo"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun logo reçu." });
    }

    return res.status(201).json({
      logo: {
        url: `/project-logos/${req.file.filename}`,
        originalName: req.file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });
  }),
);

projectsRouter.post(
  "/apk",
  requireAuth,
  apkUpload.single("apk"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier APK reçu." });
    }

    return res.status(201).json({
      apk: {
        url: `/apks/${req.file.filename}`,
        originalName: req.file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });
  }),
);

projectsRouter.post(
  "/screenshot",
  requireAuth,
  screenshotUpload.single("screenshot"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Aucune capture reçue." });
    }

    return res.status(201).json({
      screenshot: {
        url: `/project-screenshots/${req.file.filename}`,
        alt: req.body?.alt || "",
        originalName: req.file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });
  }),
);

projectsRouter.post("/", requireAuth, asyncHandler(async (req, res) => {
  const project = await Project.create(normalizeProject(req.body));
  return res.status(201).json({ project });
}));

projectsRouter.put("/:id", requireAuth, asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    normalizeProject(req.body),
    { new: true, runValidators: true },
  );

  if (!project) {
    return res.status(404).json({ message: "Projet introuvable." });
  }

  return res.json({ project });
}));

projectsRouter.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Projet introuvable." });
  }

  return res.status(204).send();
}));

function normalizeProject(payload = {}) {
  return projectInputSchema.parse(payload);
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
