import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Project } from "../models/Project.js";

export const projectsRouter = Router();

projectsRouter.get("/", asyncHandler(async (_req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  return res.json({ projects });
}));

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
  return {
    name: payload.name,
    type: payload.type,
    focus: payload.focus,
    description: payload.description,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    featured: Boolean(payload.featured ?? true),
  };
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
