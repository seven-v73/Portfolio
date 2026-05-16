import { describe, expect, it, vi } from "vitest";
import { resolveShellCommand, type CommandContent, type ShellContext } from "./commands";
import { defaultMemory } from "./memory";
import { defaultAliases } from "./suggestions";

const content: CommandContent = {
  heroTitle: "Victoire SAWADOGO",
  heroEyebrow: "Developpeur fullstack et mobile",
  heroLead: "Je transforme des besoins concrets en produits web et mobile utilisables.",
  profileCaption: "Produit, code et usage reel.",
  aboutParagraphs: ["Je construis des interfaces lisibles.", "Je relie backend, mobile et produit."],
  metrics: [["4", "projets"]],
  identityIntro: "Je cherche les solutions simples, maintenables et utiles.",
  identityPillars: [{ title: "Clarte", text: "Rendre les parcours comprehensibles." }],
  contactLinks: {
    email: "contact@example.com",
    github: "https://github.com/victoire",
    linkedin: "https://linkedin.com/in/victoire",
    whatsapp: "https://wa.me/22600000000",
  },
  labs: ["Prototypage mobile", "API utiles"],
  professionalTimeline: [{ period: "2026", title: "Developpeur fullstack" }],
  academicTimeline: [{ period: "2025", title: "Formation informatique" }],
  projects: [
    {
      name: "ElegantStyle",
      type: "Mobile",
      focus: "Stylisme virtuel",
      description: "Application mobile de mode.",
      tags: ["Flutter", "Mobile"],
      projectUrl: "https://example.com/elegantstyle",
      apkUrl: "/uploads/elegantstyle.apk",
      apkName: "ElegantStyle APK",
      screenshots: [{ url: "/uploads/elegantstyle-1.png" }],
    },
    {
      name: "BAOBAB",
      type: "Culture",
      focus: "Patrimoine digital",
      description: "Plateforme culturelle.",
      tags: ["React", "Node.js"],
    },
  ],
  stacks: [
    { title: "Frontend", items: [{ name: "React" }, { name: "TypeScript" }] },
    { title: "Mobile", items: [{ name: "Flutter" }] },
  ],
};

const context: ShellContext = {
  memory: defaultMemory,
  entriesCount: 1,
};

function run(command: string) {
  return resolveShellCommand(command, content, "/home/victoire", "bash", [], defaultAliases, context, {
    now: () => new Date("2026-05-12T10:00:00.000Z"),
  });
}

describe("VictoireOS command router", () => {
  it("returns help and basic filesystem output", () => {
    expect(run("help").output[0]).toBe("Commandes disponibles:");
    expect(run("pwd").output).toEqual(["/home/victoire"]);
    expect(run("cd projects").nextDirectory).toBe("/home/victoire/projects");
  });

  it("updates visitor memory for guided paths", () => {
    const result = run("visitor recruiter");

    expect(result.nextMemory?.visitor).toBe("recruiter");
    expect(result.nextMemory?.persona).toBe("recruiter");
    expect(result.nextMemory?.mission).toBe("recruiter");
    expect(result.nextMemory?.lastActiveAt).toBe("2026-05-12T10:00:00.000Z");
  });

  it("opens project details through injected UI effects", () => {
    const openProject = vi.fn();
    const result = resolveShellCommand(
      "open project elegant",
      content,
      "/home/victoire",
      "bash",
      [],
      defaultAliases,
      context,
      { openProject },
    );

    expect(openProject).toHaveBeenCalledWith("ElegantStyle", "open");
    expect(result.output).toContain("Ouverture du projet: ElegantStyle");
  });

  it("downloads apk through injected UI effects", () => {
    const downloadApk = vi.fn();
    const result = resolveShellCommand(
      "download apk elegantstyle",
      content,
      "/home/victoire",
      "bash",
      [],
      defaultAliases,
      context,
      { downloadApk },
    );

    expect(downloadApk).toHaveBeenCalledWith("/uploads/elegantstyle.apk");
    expect(result.output).toEqual(["Téléchargement APK: ElegantStyle APK"]);
  });

  it("keeps navigation commands testable outside the browser", () => {
    const openSection = vi.fn();
    const result = resolveShellCommand(
      "sudo hire victoire",
      content,
      "/home/victoire",
      "bash",
      [],
      defaultAliases,
      context,
      { openSection },
    );

    expect(openSection).toHaveBeenCalledWith("contact");
    expect(result.output[1]).toBe("access granted: contact section opened");
  });
});
