import { describe, expect, it } from "vitest";
import {
  createVirtualFileSystem,
  readVirtualFile,
  resolveVirtualPath,
  runFind,
  runGrep,
} from "./filesystem";

const content = {
  heroTitle: "Portfolio test",
  heroLead: "Je construis des applications utiles.",
  profileCaption: "Web, mobile, API",
  aboutParagraphs: ["Une phrase de profil."],
  metrics: [["Projets", "4"]],
  identityPillars: [{ title: "Clarte", text: "Interfaces lisibles." }],
  contactLinks: {
    email: "victoire@example.com",
    github: "https://github.com/victoire",
    linkedin: "https://linkedin.com/in/victoire",
    whatsapp: "https://wa.me/000",
  },
  projects: [
    {
      name: "ElegantStyle",
      type: "Mobile",
      focus: "Stylisme",
      description: "Application de style.",
      tags: ["Flutter", "Mode"],
    },
  ],
  stacks: [
    {
      title: "Frontend",
      items: [{ name: "React" }, { name: "TypeScript" }],
    },
  ],
};

describe("VictoireOS filesystem", () => {
  it("creates directories from dynamic projects and stacks", () => {
    expect(createVirtualFileSystem(content)["/home/victoire/projects"]).toContain("elegantstyle.md");
    expect(createVirtualFileSystem(content)["/home/victoire/stack"]).toContain("frontend.txt");
  });

  it("resolves relative paths", () => {
    expect(resolveVirtualPath("projects/elegantstyle.md", "/home/victoire")).toBe("/home/victoire/projects/elegantstyle.md");
    expect(resolveVirtualPath("../about.md", "/home/victoire/projects")).toBe("/home/victoire/about.md");
  });

  it("reads dynamic project files", () => {
    expect(readVirtualFile("/home/victoire/projects/elegantstyle.md", content)).toContain("# ElegantStyle");
  });

  it("finds and greps virtual files", () => {
    expect(runFind('find . -name "*.md"', content, "/home/victoire")).toContain("./about.md");
    expect(runGrep("grep Flutter projects/elegantstyle.md", content, "/home/victoire")[0]).toContain("Flutter");
  });
});
