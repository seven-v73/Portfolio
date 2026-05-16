import { describe, expect, it } from "vitest";
import {
  runBashRuntime,
  runDockerCommand,
  runGitCommand,
  runNodeRuntime,
  runNpmCommand,
  runPipCommand,
  runPythonRuntime,
  runWhich,
} from "./runtimes";

const content = {
  heroTitle: "Portfolio test",
  heroLead: "Je construis des applications utiles.",
  profileCaption: "Web, mobile, API",
  aboutParagraphs: ["Une phrase de profil."],
  metrics: [["Projets", "4"]],
  identityPillars: [{ title: "Clarte", text: "Interfaces lisibles." }],
  labs: ["Prototype mobile"],
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

describe("VictoireOS runtimes", () => {
  it("runs python audit scripts", () => {
    expect(runPythonRuntime("scripts/portfolio_audit.py", content)).toContain("score=94/100");
  });

  it("explains bash scripts", () => {
    expect(runBashRuntime("explain scripts/deploy.sh", content)[0]).toBe("bash explain scripts/deploy.sh");
  });

  it("simulates docker compose", () => {
    expect(runDockerCommand("compose up", content)).toContain("Container victoire-web         Started");
  });

  it("runs node report scripts", () => {
    expect(runNodeRuntime("scripts/report.js", content).join("\n")).toContain("projects: 1");
  });

  it("keeps simple tool commands deterministic", () => {
    expect(runGitCommand("branch")).toContain("* main");
    expect(runNpmCommand("test")).toContain("> vitest run");
    expect(runPipCommand("list")[0]).toContain("Package");
    expect(runWhich("docker")).toEqual(["/usr/bin/docker"]);
  });
});
