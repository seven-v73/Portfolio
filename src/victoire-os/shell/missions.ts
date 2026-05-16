import type { MissionId, PersonaMode, VictoireMemory, VisitorRole } from "../types";
import { slugify } from "./slug";

type ContentWithProjects = {
  projects: Array<{ name: string }>;
};

export const missionPlans: Record<MissionId, { title: string; steps: string[] }> = {
  recruiter: {
    title: "Mission recruteur",
    steps: ["whoami", "projects", "skills", "cv", "sudo hire victoire"],
  },
  "tech-lead": {
    title: "Mission tech lead",
    steps: ["stack", "systemctl status victoire", "explain project elegantstyle", "health", "contact"],
  },
  curious: {
    title: "Mission explorateur",
    steps: ["neofetch", "tree", "cat logs/learning.log", "cat inbox/messages.md", "autopilot on"],
  },
};

export function visitorToPersona(visitor: VisitorRole): PersonaMode {
  if (visitor === "recruiter" || visitor === "client") return "recruiter";
  if (visitor === "student") return "mentor";
  return "dev";
}

export function visitorToMission(visitor: VisitorRole): MissionId | "" {
  if (visitor === "recruiter" || visitor === "client") return "recruiter";
  if (visitor === "developer") return "tech-lead";
  if (visitor === "student") return "curious";
  return "";
}

export function getMissionStart(mission: MissionId) {
  const plan = missionPlans[mission];
  return [
    `${plan.title}: initialisee`,
    "Parcours recommande:",
    ...plan.steps.map((step, index) => `${index + 1}. ${step}`),
    `Prochaine commande: ${plan.steps[0]}`,
  ];
}

export function getMissionProgress(memory: VictoireMemory) {
  if (!memory.mission) {
    return ["Aucune mission active.", "Essaie: mission start recruiter, mission start tech-lead ou mission start curious."];
  }
  const plan = missionPlans[memory.mission];
  const completed = Math.min(memory.missionStep, plan.steps.length);
  return [
    `${plan.title}: ${completed}/${plan.steps.length}`,
    ...plan.steps.map((step, index) => `${index < completed ? "[x]" : "[ ]"} ${index + 1}. ${step}`),
    completed >= plan.steps.length
      ? "Mission complete: le profil a ete explore avec un angle clair."
      : `Prochaine commande: ${plan.steps[completed]}`,
  ];
}

export function getNextBestCommand(memory: VictoireMemory, content: ContentWithProjects) {
  if (memory.mission) {
    const plan = missionPlans[memory.mission];
    return plan.steps[Math.min(memory.missionStep, plan.steps.length - 1)] || "mission progress";
  }
  if (memory.visitor === "recruiter") return "mission start recruiter";
  if (memory.visitor === "developer") return "shellctl inspect";
  if (memory.visitor === "student") return "learn bash";
  if (memory.visitor === "client") return "projects";
  if (memory.persona === "recruiter") return "mission start recruiter";
  if (memory.persona === "mentor") return "learn git";
  if (memory.persona === "playful") return "mission start curious";
  if (!memory.visitedProjects.length && content.projects[0]) return `explain project ${slugify(content.projects[0].name)}`;
  return "dashboard";
}

export function updateMemoryAfterCommand(
  memory: VictoireMemory,
  command: string,
  content: ContentWithProjects,
): VictoireMemory {
  const normalizedCommand = command.trim().toLowerCase();
  const project = content.projects.find((item) =>
    normalizedCommand.includes(slugify(item.name)) || normalizedCommand.includes(item.name.toLowerCase()),
  );
  const mission = memory.mission ? missionPlans[memory.mission] : null;
  const expectedCommand = mission?.steps[memory.missionStep]?.toLowerCase();
  const missionStep = mission && expectedCommand && normalizedCommand.startsWith(expectedCommand)
    ? Math.min(memory.missionStep + 1, mission.steps.length)
    : memory.missionStep;

  return {
    ...memory,
    commands: [...memory.commands, command].slice(-20),
    missionStep,
    visitedProjects: project
      ? Array.from(new Set([...memory.visitedProjects, project.name])).slice(-8)
      : memory.visitedProjects,
    lastActiveAt: new Date().toISOString(),
  };
}
