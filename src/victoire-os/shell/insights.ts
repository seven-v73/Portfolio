import type { ShellMode, PersonaMode, VictoireMemory, VisitorRole } from "../types";
import type { FileSystemContent } from "./filesystem";
import { getNextBestCommand, missionPlans, visitorToMission } from "./missions";
import { slugify } from "./slug";

type InsightsContent = FileSystemContent;

export function getVisitorProfile(visitor: VisitorRole, content: InsightsContent) {
  const nextMission = visitorToMission(visitor);
  const profileLines: Record<VisitorRole, string[]> = {
    unknown: ["visitor: unknown"],
    recruiter: [
      "visitor: recruiter",
      "Priorite: preuves rapides, projets, CV, contact.",
      "Atelier active le parcours recruteur.",
    ],
    developer: [
      "visitor: developer",
      "Priorite: stack, architecture, scripts, Docker, qualite.",
      "Atelier active le parcours tech lead.",
    ],
    student: [
      "visitor: student",
      "Priorite: apprendre, comprendre les commandes, explorer les scripts.",
      "Atelier active le mode mentor.",
    ],
    client: [
      "visitor: client",
      "Priorite: besoins, impact, projets concrets et contact.",
      `Projet a regarder: ${content.projects[0]?.name || "projects"}.`,
    ],
  };
  return [
    ...profileLines[visitor],
    nextMission ? `Mission active: ${nextMission}` : "Mission active: standby",
    `Prochaine commande: ${nextMission ? missionPlans[nextMission].steps[0] : "dashboard"}`,
  ];
}

export function getSmartTimeline(
  memory: VictoireMemory,
  content: InsightsContent,
  currentDirectory: string,
  mode: ShellMode,
) {
  const recentCommands = memory.commands.slice(-8);
  return [
    "Atelier timeline",
    `visitor..... ${memory.visitor}`,
    `mode........ ${mode}`,
    `cwd......... ${currentDirectory}`,
    `mission..... ${memory.mission || "standby"}${memory.mission ? ` step ${memory.missionStep}/${missionPlans[memory.mission].steps.length}` : ""}`,
    `projects.... ${memory.visitedProjects.length ? memory.visitedProjects.join(", ") : "aucun projet ouvert"}`,
    "recent commands:",
    ...(recentCommands.length ? recentCommands.map((command, index) => `  ${index + 1}. ${command}`) : ["  aucune commande persistante"]),
    `next........ ${getNextBestCommand(memory, content)}`,
  ];
}

export function getCoachAdvice(command: string, output: string[], memory: VictoireMemory, content: InsightsContent) {
  const normalizedCommand = command.toLowerCase();
  if (normalizedCommand === "coach on" || normalizedCommand === "coach off") return [];
  return ["", "[coach] " + getCoachMessage(normalizedCommand, output, memory, content)];
}

export function getCoachMessage(command: string, output: string[], memory: VictoireMemory, content: InsightsContent) {
  if (output.some((line) => line.toLowerCase().includes("introuvable") || line.toLowerCase().includes("unknown"))) {
    return "Commande non reconnue: essaie help, shellctl commands ou utilise Tab pour completer.";
  }
  if (command.startsWith("cat ")) return "Bon reflexe: lire le fichier avant d'executer. Prochaine etape utile: lancer le script correspondant.";
  if (command.startsWith("docker")) return "Docker est sain dans le sandbox. Prochaine etape: docker compose ps ou bash scripts/healthcheck.sh.";
  if (command.startsWith("python")) return "Python sert ici a auditer et generer des rapports. Prochaine etape: cat /var/reports/profile.json.";
  if (command.startsWith("test") || command === "coverage") return "Qualite inspectee. Prochaine etape: shellctl inspect pour voir l'architecture.";
  return `Prochaine action suggeree: ${getNextBestCommand(memory, content)}`;
}

export function getPersonaMessage(persona: PersonaMode) {
  const messages: Record<PersonaMode, string[]> = {
    recruiter: [
      "mode recruiter: actif",
      "Le shell privilegie les preuves rapides: profil, projets, CV, contact.",
      "Suggestion: mission start recruiter",
    ],
    dev: [
      "mode dev: actif",
      "Le shell met en avant stack, architecture, debug, commandes systeme et projets.",
      "Suggestion: systemctl status victoire",
    ],
    mentor: [
      "mode mentor: actif",
      "Le shell explique davantage les concepts et propose des exercices progressifs.",
      "Suggestion: learn git",
    ],
    playful: [
      "mode playful: actif",
      "Le shell devient plus immersif, avec exploration libre et signaux narratifs.",
      "Suggestion: mission start curious",
    ],
  };
  return messages[persona];
}

export function getAutopilotPulse(
  content: InsightsContent,
  memory: VictoireMemory,
  currentDirectory: string,
  entriesCount: number,
) {
  const nextCommand = getNextBestCommand(memory, content);
  const project = content.projects.find((item) => !memory.visitedProjects.includes(item.name)) || content.projects[0];
  return [
    "Suggestion de parcours",
    `Objectif: ${memory.goal}`,
    `Dossier: ${currentDirectory}`,
    `Activité: ${entriesCount} interactions`,
    project ? `Projet à regarder: ${project.name} - ${project.focus}` : "À regarder: stack et contact",
    `Prochaine commande: ${nextCommand}`,
  ];
}

export function getSystemDashboard(
  content: InsightsContent,
  memory: VictoireMemory,
  currentDirectory: string,
  historyCount: number,
) {
  const activeMission = memory.mission ? missionPlans[memory.mission] : null;
  return [
    "Atelier dashboard",
    `objectif.... ${memory.goal}`,
    `visiteur.... ${memory.visitor}`,
    `profil...... ${memory.persona}`,
    `parcours.... ${memory.mission || "libre"}${activeMission ? ` (${memory.missionStep}/${activeMission.steps.length})` : ""}`,
    `suggestions. ${memory.autopilot ? "actives" : "désactivées"}`,
    `aide........ ${memory.coach ? "active" : "simple"}`,
    `dossier..... ${currentDirectory}`,
    `historique.. ${historyCount} session / ${memory.commands.length} gardées`,
    `projects.... ${content.projects.length} indexed`,
    `stack....... ${content.stacks.map((group) => `${group.title}:${group.items.length}`).join("  ")}`,
    `contact..... ${content.contactLinks.email}`,
    `next........ ${getNextBestCommand(memory, content)}`,
  ];
}

export function explainTarget(target: string, content: InsightsContent) {
  const [kind, ...rest] = target.split(/\s+/);
  if (kind !== "project") return ["Usage: explain project <nom-du-projet>"];
  const projectSlug = rest.join("-");
  const project = content.projects.find((item) => slugify(item.name).includes(projectSlug));
  if (!project) return ["Projet introuvable. Essaie: projects puis explain project elegantstyle."];
  return [
    `Projet: ${project.name}`,
    `Probleme: ${project.focus}`,
    `Angle produit: ${project.description}`,
    `Stack probable: ${project.tags.join(", ")}`,
    "Valeur: montrer que la technologie peut partir d'un besoin local et devenir un produit utilisable.",
  ];
}

export function explainStackChoice(tech: string, content: InsightsContent) {
  if (!tech) return ["Usage: why stack <tech>"];
  const found = content.stacks
    .flatMap((group) => group.items.map((item) => ({ ...item, group: group.title })))
    .find((item) => item.name.toLowerCase().includes(tech.toLowerCase()));
  if (!found) return [`${tech}: pas encore documente dans la stack.`];
  return [
    `${found.name} (${found.group})`,
    "Pourquoi: outil choisi pour livrer vite, garder une base maintenable et construire une experience claire.",
    "Vision: la stack n'est pas une vitrine, c'est un levier pour resoudre un probleme utilisateur.",
  ];
}
