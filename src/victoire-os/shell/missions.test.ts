import { describe, expect, it } from "vitest";
import { defaultMemory } from "./memory";
import {
  getMissionProgress,
  getMissionStart,
  getNextBestCommand,
  updateMemoryAfterCommand,
  visitorToMission,
  visitorToPersona,
} from "./missions";

const content = {
  projects: [
    { name: "ElegantStyle" },
    { name: "BAOBAB / MonBaobab" },
  ],
};

describe("VictoireOS missions", () => {
  it("maps visitor roles to personas and missions", () => {
    expect(visitorToPersona("recruiter")).toBe("recruiter");
    expect(visitorToPersona("student")).toBe("mentor");
    expect(visitorToMission("developer")).toBe("tech-lead");
  });

  it("starts a mission with ordered steps", () => {
    expect(getMissionStart("recruiter")).toContain("Prochaine commande: whoami");
  });

  it("reports mission progress", () => {
    expect(getMissionProgress({ ...defaultMemory, mission: "recruiter", missionStep: 2 })[0]).toBe("Mission recruteur: 2/5");
  });

  it("suggests a mission command before generic dashboard", () => {
    expect(getNextBestCommand({ ...defaultMemory, visitor: "developer" }, content)).toBe("shellctl inspect");
  });

  it("tracks project visits and mission steps from commands", () => {
    const nextMemory = updateMemoryAfterCommand(
      { ...defaultMemory, mission: "recruiter", missionStep: 1 },
      "projects",
      content,
    );
    expect(nextMemory.missionStep).toBe(2);

    const projectMemory = updateMemoryAfterCommand(nextMemory, "explain project elegantstyle", content);
    expect(projectMemory.visitedProjects).toContain("ElegantStyle");
  });
});
