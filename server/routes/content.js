import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { SiteContent } from "../models/SiteContent.js";

export const contentRouter = Router();

contentRouter.get("/", asyncHandler(async (_req, res) => {
  const content = await SiteContent.findOne({ key: "main" });
  return res.json({ content: content?.data || null });
}));

contentRouter.put("/", requireAuth, asyncHandler(async (req, res) => {
  const content = await SiteContent.findOneAndUpdate(
    { key: "main" },
    { key: "main", data: req.body || {} },
    { upsert: true, returnDocument: "after" },
  );

  return res.json({ content: content.data });
}));

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
