import { z } from "zod";

function addHttpsProtocol(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("/") || /^[a-z][a-z\d+.-]*:/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const urlSchema = z.preprocess(addHttpsProtocol, z.string().trim().url().or(z.literal("")));
const publicAssetSchema = z.preprocess(
  addHttpsProtocol,
  z.string().trim().startsWith("/").or(z.string().trim().url()).or(z.literal("")),
);

const stackItemSchema = z.object({
  name: z.string().trim().min(1).max(80),
  logo: z.string().trim().startsWith("/").or(z.string().trim().url()),
});

const stackGroupSchema = z.object({
  title: z.string().trim().min(1).max(80),
  items: z.array(stackItemSchema).min(1).max(12),
});

const projectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.string().trim().min(1).max(140),
  focus: z.string().trim().min(1).max(140),
  description: z.string().trim().min(1).max(700),
  detail: z.string().trim().max(1400).optional().default(""),
  logoUrl: publicAssetSchema.optional().default(""),
  projectUrl: urlSchema.optional().default(""),
  githubUrl: urlSchema.optional().default(""),
  githubRepo: z.string().trim().max(180).optional().default(""),
  githubUpdatedAt: z.string().trim().max(80).optional().default(""),
  githubStars: z.coerce.number().min(0).optional().default(0),
  githubForks: z.coerce.number().min(0).optional().default(0),
  source: z.enum(["manual", "github"]).optional().default("manual"),
  privateRepo: z.boolean().optional().default(false),
  apkUrl: publicAssetSchema.optional().default(""),
  apkName: z.string().trim().max(180).optional().default(""),
  screenshots: z.array(z.object({
    url: z.string().trim().startsWith("/").or(urlSchema),
    alt: z.string().trim().max(160).optional().default(""),
  })).max(8).optional().default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  featured: z.boolean().optional(),
});

const timelineItemSchema = z.object({
  period: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(160),
  detail: z.string().trim().min(1).max(700),
});

const identityPillarSchema = z.object({
  title: z.string().trim().min(1).max(160),
  text: z.string().trim().min(1).max(700),
});

// Admin list editors add blank rows; they are dropped instead of failing the whole save.
function dropEmpty(items) {
  return items.filter(Boolean);
}

export const siteContentSchema = z.object({
  heroEyebrow: z.string().trim().min(1).max(140),
  heroTitle: z.string().trim().min(1).max(220),
  heroLead: z.string().trim().min(1).max(800),
  profileCaption: z.string().trim().min(1).max(180),
  metrics: z.array(z.tuple([
    z.string().trim().min(1).max(80),
    z.string().trim().min(1).max(120),
  ])).min(1).max(8),
  techMarquee: z.array(z.string().trim().min(1).max(60)).min(1).max(24),
  aboutTitle: z.string().trim().min(1).max(220),
  aboutParagraphs: z.array(z.string().trim().min(1).max(900)).min(1).max(6),
  identityTitle: z.string().trim().min(1).max(220),
  identityIntro: z.string().trim().min(1).max(700),
  identityPillars: z.array(identityPillarSchema).min(1).max(8),
  journeyTitle: z.string().trim().min(1).max(220),
  journeyIntro: z.string().trim().min(1).max(700),
  professionalTimeline: z.array(timelineItemSchema).min(1).max(12),
  academicTimeline: z.array(timelineItemSchema).min(1).max(12),
  stacks: z.array(stackGroupSchema).min(1).max(8),
  projects: z.array(projectSchema).min(1).max(20),
  labTitle: z.string().trim().min(1).max(220),
  labIntro: z.string().trim().min(1).max(700),
  labs: z.array(z.string().trim().min(1).max(240)).min(1).max(16),
  contactTitle: z.string().trim().min(1).max(220),
  contactText: z.string().trim().min(1).max(700),
  contactLinks: z.object({
    email: z.string().trim().email(),
    github: urlSchema,
    linkedin: urlSchema,
    whatsapp: urlSchema,
  }),
  cv: z.object({
    headline: z.string().trim().max(180).optional().default(""),
    summary: z.string().trim().max(900).optional().default(""),
    location: z.string().trim().max(120).optional().default(""),
    phone: z.string().trim().max(40).optional().default(""),
    website: z.string().trim().max(200).optional().default(""),
    languages: z.array(z.string().trim().max(80)).max(8).transform(dropEmpty).optional().default([]),
    interests: z.array(z.string().trim().max(80)).max(8).transform(dropEmpty).optional().default([]),
    projects: z.array(z.string().trim().min(1).max(120)).max(8).optional().default([]),
  }).optional(),
});

export const projectInputSchema = projectSchema.extend({
  featured: z.boolean().default(true),
});
