import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { SiteContent } from "../models/SiteContent.js";
import { siteContentSchema } from "../validation.js";

export const contentRouter = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../../public");
const cvManifestPath = path.join(publicDir, "cv-manifest.json");
const profileManifestPath = path.join(publicDir, "profile-manifest.json");
const allowedCvTypes = new Map([
  ["application/pdf", ".pdf"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

const allowedProfileTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

function createPublicUpload({ allowedTypes, basename, maxSize, unsupportedMessage }) {
  return multer({
    storage: multer.diskStorage({
      destination: async (_req, _file, cb) => {
        try {
          await fs.mkdir(publicDir, { recursive: true });
          cb(null, publicDir);
        } catch (error) {
          cb(error);
        }
      },
      filename: (_req, file, cb) => {
        const extension = allowedTypes.get(file.mimetype);
        cb(null, `${basename}${extension}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (!allowedTypes.has(file.mimetype)) {
        cb(new Error(unsupportedMessage));
        return;
      }
      cb(null, true);
    },
    limits: { fileSize: maxSize },
  });
}

const cvUpload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      try {
        await fs.mkdir(publicDir, { recursive: true });
        cb(null, publicDir);
      } catch (error) {
        cb(error);
      }
    },
    filename: (_req, file, cb) => {
      const extension = allowedCvTypes.get(file.mimetype);
      const basename = file.mimetype === "application/pdf" ? "cv" : "cv-image";
      cb(null, `${basename}${extension}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!allowedCvTypes.has(file.mimetype)) {
      cb(new Error("Format non supporté. Envoie un PDF, JPG, PNG ou WEBP."));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: 8 * 1024 * 1024 },
});

const profileUpload = createPublicUpload({
  allowedTypes: allowedProfileTypes,
  basename: "profile-photo",
  maxSize: 4 * 1024 * 1024,
  unsupportedMessage: "Format non supporté. Envoie une image JPG, PNG ou WEBP.",
});

contentRouter.get("/", asyncHandler(async (_req, res) => {
  const content = await SiteContent.findOne({ key: "main" });
  return res.json({ content: content?.data || null });
}));

contentRouter.put("/", requireAuth, asyncHandler(async (req, res) => {
  const validatedContent = siteContentSchema.parse(req.body || {});
  const content = await SiteContent.findOneAndUpdate(
    { key: "main" },
    { key: "main", data: validatedContent },
    { upsert: true, returnDocument: "after" },
  );

  return res.json({ content: content.data });
}));

contentRouter.post(
  "/cv",
  requireAuth,
  cvUpload.single("cv"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier CV reçu." });
    }

    const isPdf = req.file.mimetype === "application/pdf";
    const manifest = {
      url: `/${req.file.filename}`,
      type: isPdf ? "pdf" : "image",
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
    };

    await removePreviousCv(req.file.filename);
    await fs.writeFile(cvManifestPath, JSON.stringify(manifest, null, 2));

    return res.json({ cv: manifest });
  }),
);

contentRouter.post(
  "/profile-photo",
  requireAuth,
  profileUpload.single("profile"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Aucune photo reçue." });
    }

    const manifest = {
      url: `/${req.file.filename}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
    };

    await removePreviousProfilePhoto(req.file.filename);
    await fs.writeFile(profileManifestPath, JSON.stringify(manifest, null, 2));

    return res.json({ profile: manifest });
  }),
);

async function removePreviousCv(currentFilename) {
  const filenames = ["cv.pdf", "cv-image.jpg", "cv-image.png", "cv-image.webp"];
  await Promise.all(
    filenames
      .filter((filename) => filename !== currentFilename)
      .map((filename) => fs.rm(path.join(publicDir, filename), { force: true })),
  );
}

async function removePreviousProfilePhoto(currentFilename) {
  const filenames = ["profile-photo.jpg", "profile-photo.png", "profile-photo.webp"];
  await Promise.all(
    filenames
      .filter((filename) => filename !== currentFilename)
      .map((filename) => fs.rm(path.join(publicDir, filename), { force: true })),
  );
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
