import { describe, expect, it } from "vitest";
import { projectInputSchema } from "./validation.js";

describe("projectInputSchema", () => {
  it("normalizes bare public URLs and keeps local asset paths", () => {
    const project = projectInputSchema.parse({
      name: "Projet test",
      type: "Application web",
      focus: "Validation",
      description: "Projet utilisé pour vérifier la validation serveur.",
      logoUrl: "/project-logos/logo.png",
      projectUrl: "example.com",
      githubUrl: "github.com/seven-v73/projet-test",
      apkUrl: "/apks/demo.apk",
      screenshots: [{ url: "/project-screenshots/home.png", alt: "Accueil" }],
      tags: ["React", "API"],
    });

    expect(project).toMatchObject({
      logoUrl: "/project-logos/logo.png",
      projectUrl: "https://example.com",
      githubUrl: "https://github.com/seven-v73/projet-test",
      apkUrl: "/apks/demo.apk",
      featured: true,
      source: "manual",
    });
  });

  it("rejects invalid external asset URLs", () => {
    expect(() =>
      projectInputSchema.parse({
        name: "Projet test",
        type: "Application web",
        focus: "Validation",
        description: "Projet utilisé pour vérifier la validation serveur.",
        logoUrl: "not a valid url",
        tags: ["React"],
      }),
    ).toThrow();
  });

  it("limits screenshot and tag counts", () => {
    const baseProject = {
      name: "Projet test",
      type: "Application web",
      focus: "Validation",
      description: "Projet utilisé pour vérifier la validation serveur.",
    };

    expect(() =>
      projectInputSchema.parse({
        ...baseProject,
        screenshots: Array.from({ length: 9 }, (_, index) => ({
          url: `/project-screenshots/${index}.png`,
        })),
      }),
    ).toThrow();

    expect(() =>
      projectInputSchema.parse({
        ...baseProject,
        tags: Array.from({ length: 13 }, (_, index) => `tag-${index}`),
      }),
    ).toThrow();
  });
});
