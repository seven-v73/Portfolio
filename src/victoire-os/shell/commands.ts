import type { MissionId, PersonaMode, ShellMode, VictoireMemory, VisitorRole } from "../types";
import {
  buildVirtualFiles,
  createVirtualFileSystem,
  readVirtualFile,
  resolveVirtualPath,
  runFind,
  runGrep,
  type FileSystemContent,
} from "./filesystem";
import { modeHint, normalizeShellMode } from "./core";
import {
  getChallenge,
  getDebugMindset,
  getLearningNotes,
  getLesson,
  getManualPage,
  getMessageOfTheDay,
  getOpenSourceSignal,
  getProcessList,
  getQuiz,
  getRoadmap,
  getTopSnapshot,
} from "./knowledge";
import {
  explainStackChoice,
  explainTarget,
  getAutopilotPulse,
  getPersonaMessage,
  getSmartTimeline,
  getSystemDashboard,
  getVisitorProfile,
} from "./insights";
import { resolveNodeCommand, resolvePowerShellCommand, resolvePythonCommand, resolveSqlCommand } from "./interpreters";
import { defaultMemory } from "./memory";
import {
  getMissionProgress,
  getMissionStart,
  getNextBestCommand,
  missionPlans,
  visitorToMission,
  visitorToPersona,
} from "./missions";
import {
  runBashRuntime,
  runChmod,
  runDockerCommand,
  runGitCommand,
  runNodeRuntime,
  runNpmCommand,
  runPipCommand,
  runPythonRuntime,
  runWhich,
} from "./runtimes";
import { slugify } from "./slug";
import { toRelativeVirtualPath } from "./suggestions";
import {
  getCoverageReport,
  getHealthCheck,
  getSkillMatrix,
  getSystemJournal,
  runShellControl,
  runSystemctl,
  runVirtualPackageManager,
  runVirtualTests,
} from "./system";

type CommandProject = FileSystemContent["projects"][number] & {
  detail?: string;
  logoUrl?: string;
  projectUrl?: string;
  apkUrl?: string;
  apkName?: string;
  screenshots?: Array<{ url: string; alt?: string }>;
};

export type CommandContent = FileSystemContent & {
  heroEyebrow: string;
  identityIntro: string;
  labs: string[];
  professionalTimeline: Array<{ period: string; title: string }>;
  academicTimeline: Array<{ period: string; title: string }>;
  projects: CommandProject[];
};

export type ShellResult = {
  output: string[];
  nextDirectory?: string;
  nextMode?: ShellMode;
  nextAliases?: Record<string, string>;
  nextMemory?: VictoireMemory;
};

export type ShellContext = {
  memory: VictoireMemory;
  entriesCount: number;
};

export type ShellEffects = {
  openSection?: (sectionId: string) => void;
  openProject?: (projectName: string, intent: "open" | "screenshots") => void;
  downloadApk?: (apkUrl: string) => void;
  now?: () => Date;
};

type CommandHandler = (target: string, content: CommandContent) => ShellResult;

const shellModeLabels: Record<ShellMode, string> = {
  bash: "bash",
  python: "python",
  powershell: "powershell",
  node: "node",
  sql: "sql",
};

function createRuntimeCommandHandlers(): Record<string, CommandHandler> {
  return {
    python: (target, content) => ({
      output: target ? runPythonRuntime(target, content) : ["Interpreteur actif: python.", modeHint("python")],
      nextMode: target ? undefined : "python",
    }),
    python3: (target, content) => ({ output: runPythonRuntime(target || "--version", content) }),
    bash: (target, content) => ({
      output: target ? runBashRuntime(target, content) : ["Interpreteur actif: bash.", modeHint("bash")],
      nextMode: "bash",
    }),
    sh: (target, content) => ({ output: runBashRuntime(target || "--version", content) }),
    docker: (target, content) => ({ output: runDockerCommand(target, content) }),
    "docker-compose": (target, content) => ({ output: runDockerCommand(`compose ${target}`, content) }),
    node: (target, content) =>
      target ? { output: runNodeRuntime(target, content) } : { output: ["Interpreteur actif: node.", modeHint("node")], nextMode: "node" },
    npm: (target) => ({ output: runNpmCommand(target) }),
    git: (target) => ({ output: runGitCommand(target) }),
    pip: (target) => ({ output: runPipCommand(target) }),
    pip3: (target) => ({ output: runPipCommand(target) }),
  };
}

function findProjectByQuery(projects: CommandProject[], query: string) {
  const normalizedQuery = slugify(query);
  if (!normalizedQuery) return null;
  return (
    projects.find(
      (project) =>
        slugify(project.name).includes(normalizedQuery) ||
        project.tags.some((tag) => slugify(tag).includes(normalizedQuery)),
    ) || null
  );
}

export function resolveShellCommand(
  command: string,
  content: CommandContent,
  currentDirectory: string,
  mode: ShellMode,
  history: string[],
  aliases: Record<string, string>,
  context: ShellContext,
  effects: ShellEffects = {},
): ShellResult {
  const normalizedCommand = command.trim().toLowerCase();
  const originalParts = command.trim().split(/\s+/);
  const [base, ...args] = normalizedCommand.split(/\s+/);
  const target = args.join(" ");
  const virtualFileSystem = createVirtualFileSystem(content);
  const runtimeCommandHandlers = createRuntimeCommandHandlers();

  if (base === "history") {
    return {
      output: history.length
        ? history.map((item, index) => `${String(index + 1).padStart(3, " ")}  ${item}`)
        : ["history: aucune commande pour le moment"],
    };
  }

  if (base === "alias") {
    if (!target) {
      return { output: Object.entries(aliases).map(([key, value]) => `alias ${key}='${value}'`) };
    }
    const aliasMatch = command.trim().match(/^alias\s+([a-zA-Z][\w-]*)=(["']?)(.+)\2$/);
    if (!aliasMatch) {
      return { output: ["usage: alias nom='commande'"] };
    }
    return {
      output: [`alias ${aliasMatch[1]}='${aliasMatch[3]}'`],
      nextAliases: { ...aliases, [aliasMatch[1]]: aliasMatch[3] },
    };
  }

  if (base === "memory") {
    if (target === "clear") {
      return {
        output: ["memory: preferences, mission et historique local reinitialises"],
        nextMemory: { ...defaultMemory, lastActiveAt: getIsoTimestamp(effects) },
      };
    }
    if (target === "show" || !target) {
      return { output: getMemoryReport(context.memory) };
    }
    return { output: ["usage: memory show | memory clear"] };
  }

  if (base === "commands") {
    if (target === "clear" || target === "reset") {
      return {
        output: ["commands: compteur remis a zero", "La memoire, la mission et le profil visiteur restent conserves."],
        nextMemory: {
          ...context.memory,
          commands: [],
          lastActiveAt: getIsoTimestamp(effects),
        },
      };
    }
    if (target === "count" || !target) {
      return { output: [`commands: ${context.memory.commands.length}`] };
    }
    return { output: ["usage: commands count | commands clear"] };
  }

  if (base === "visitor") {
    const visitor = args[0] as VisitorRole | undefined;
    if (!visitor || !["recruiter", "developer", "student", "client"].includes(visitor)) {
      return { output: ["usage: visitor recruiter | visitor developer | visitor student | visitor client"] };
    }
    return {
      output: getVisitorProfile(visitor, content),
      nextMemory: {
        ...context.memory,
        visitor,
        persona: visitorToPersona(visitor),
        mission: visitorToMission(visitor),
        missionStep: 0,
        lastActiveAt: getIsoTimestamp(effects),
      },
    };
  }

  if (base === "timeline") {
    return { output: getSmartTimeline(context.memory, content, currentDirectory, mode) };
  }

  if (base === "set" && args[0] === "goal") {
    const goal = command.trim().replace(/^set\s+goal\s+/i, "").replace(/^["']|["']$/g, "");
    if (!goal || goal === command.trim()) return { output: ["usage: set goal \"objectif\""] };
    return {
      output: [`goal: ${goal}`, "Atelier adaptera ses suggestions a cet objectif."],
      nextMemory: { ...context.memory, goal, lastActiveAt: getIsoTimestamp(effects) },
    };
  }

  if (base === "mode") {
    const persona = args[0] as PersonaMode | undefined;
    if (!persona || !["recruiter", "dev", "mentor", "playful"].includes(persona)) {
      return { output: ["Modes: recruiter, dev, mentor, playful", "Exemple: mode recruiter"] };
    }
    return {
      output: getPersonaMessage(persona),
      nextMemory: { ...context.memory, persona, lastActiveAt: getIsoTimestamp(effects) },
    };
  }

  if (base === "mission") {
    if (args[0] === "start") {
      const mission = args[1] as MissionId | undefined;
      if (!mission || !missionPlans[mission]) {
        return { output: ["Missions: recruiter, tech-lead, curious", "Exemple: mission start recruiter"] };
      }
      return {
        output: getMissionStart(mission),
        nextMemory: {
          ...context.memory,
          mission,
          missionStep: 0,
          lastActiveAt: getIsoTimestamp(effects),
        },
      };
    }
    if (args[0] === "progress" || !args[0]) {
      return { output: getMissionProgress(context.memory) };
    }
    if (args[0] === "stop") {
      return {
        output: ["Parcours arrêté.", "L'atelier reste disponible via dashboard et help."],
        nextMemory: { ...context.memory, mission: "", missionStep: 0, lastActiveAt: getIsoTimestamp(effects) },
      };
    }
    return { output: ["usage: mission start <recruiter|tech-lead|curious> | mission progress | mission stop"] };
  }

  if (base === "autopilot") {
    if (target === "on") {
      return {
        output: [
          "Suggestions automatiques activées.",
          ...getAutopilotPulse(content, { ...context.memory, autopilot: true }, currentDirectory, context.entriesCount),
        ],
        nextMemory: { ...context.memory, autopilot: true, lastActiveAt: getIsoTimestamp(effects) },
      };
    }
    if (target === "off") {
      return {
        output: ["Suggestions automatiques désactivées.", "L'atelier attend tes commandes."],
        nextMemory: { ...context.memory, autopilot: false, lastActiveAt: getIsoTimestamp(effects) },
      };
    }
    return { output: ["usage: autopilot on | autopilot off"] };
  }

  if (base === "coach") {
    if (target === "on") {
      return {
        output: [
          "coach: on",
          "Atelier analysera tes commandes et proposera une prochaine action utile.",
          `Suggestion immediate: ${getNextBestCommand({ ...context.memory, coach: true }, content)}`,
        ],
        nextMemory: { ...context.memory, coach: true, lastActiveAt: getIsoTimestamp(effects) },
      };
    }
    if (target === "off") {
      return {
        output: ["coach: off", "L'atelier reste disponible, sans conseils après chaque commande."],
        nextMemory: { ...context.memory, coach: false, lastActiveAt: getIsoTimestamp(effects) },
      };
    }
    return { output: ["usage: coach on | coach off"] };
  }

  if (base === "hire") {
    if (!target || target === "--why") {
      return {
        output: [
          "Pourquoi contacter Victoire",
          `Profil: ${content.heroEyebrow}`,
          `Preuves: ${content.projects.length} projets visibles, ${content.stacks.length} groupes de stack, CV public et liens directs.`,
          "Points forts: applications web/mobile, API, logique produit, déploiement et maintenance.",
          "Prochaine action: contact ou sudo hire victoire.",
        ],
      };
    }
    if (target === "--contact") {
      return {
        output: [
          `Email: ${content.contactLinks.email}`,
          `LinkedIn: ${content.contactLinks.linkedin}`,
          `WhatsApp: ${content.contactLinks.whatsapp}`,
        ],
      };
    }
    if (target.startsWith("--for ")) {
      const need = target.replace("--for ", "");
      const matchingProjects = content.projects.filter((project) =>
        [project.name, project.type, project.focus, project.description, project.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(need),
      );
      return {
        output: [
          `Besoin: ${need}`,
          matchingProjects.length
            ? `Projet pertinent: ${matchingProjects[0].name} - ${matchingProjects[0].focus}`
            : "Projet pertinent: regarde projects puis open project <nom> pour explorer les preuves.",
          "Prochaine action: open projects ou hire --contact.",
        ],
      };
    }
    return { output: ["usage: hire --why | hire --for mobile | hire --for api | hire --contact"] };
  }

  if (base === "dashboard" || base === "metrics" || base === "status") {
    return { output: getSystemDashboard(content, context.memory, currentDirectory, history.length) };
  }

  if (base === "shellctl") return { output: runShellControl(target, content) };
  if (base === "test") return { output: runVirtualTests(target || "all", content) };
  if (base === "coverage") return { output: getCoverageReport(content) };
  if (base === "man") return { output: getManualPage(target || "help") };

  if (runtimeCommandHandlers[base]) {
    return runtimeCommandHandlers[base](target, content);
  }

  if (base.startsWith("./") || base.startsWith("scripts/")) {
    return runExecutableVirtualFile(command.trim(), content, currentDirectory);
  }

  if (["powershell", "pwsh", "javascript", "js", "sql"].includes(base)) {
    const nextMode = normalizeShellMode(base);
    return {
      output: [`Interpreteur actif: ${shellModeLabels[nextMode]}.`, modeHint(nextMode)],
      nextMode,
    };
  }

  if (["exit", "quit"].includes(base) && mode !== "bash") {
    return {
      output: ["Retour au shell bash virtuel."],
      nextMode: "bash",
    };
  }

  if (base === "languages" || base === "interpreters") {
    return {
      output: [
        "Interpreteurs disponibles:",
        "bash        - navigation systeme virtuel, scripts .sh, git, npm, docker",
        "python      - print(), about(), stack(), projects(), dataclasses, scripts .py",
        "powershell  - Get-Profile, Get-Stack, Get-Projects, Get-Contact",
        "node        - console.log(), about(), stack(), projects()",
        "sql         - SELECT * FROM projects; SELECT * FROM stack;",
      ],
    };
  }

  if (mode === "python") return resolvePythonCommand(command, content);
  if (mode === "powershell") return resolvePowerShellCommand(command, content, currentDirectory);
  if (mode === "node") return resolveNodeCommand(command, content);
  if (mode === "sql") return resolveSqlCommand(command, content);

  if (base === "pwd") return { output: [currentDirectory] };
  if (base === "which") return { output: runWhich(target) };
  if (base === "chmod") return { output: runChmod(target) };
  if (base === "mkdir") return { output: [`mkdir: '${target || ""}' cree dans le sandbox volatile`] };
  if (base === "touch") return { output: [`touch: '${target || ""}' marque comme present dans le sandbox volatile`] };

  if (base === "ls" || base === "dir") {
    const directory = resolveVirtualPath(target || currentDirectory, currentDirectory);
    const items = virtualFileSystem[directory];
    if (!items) {
      return { output: [`ls: impossible d'acceder a '${target}': aucun dossier virtuel`] };
    }
    return { output: [items.join("  ")] };
  }

  if (base === "cd") {
    const nextDirectory = resolveVirtualPath(target || "/home/victoire", currentDirectory);
    if (!virtualFileSystem[nextDirectory]) {
      return { output: [`cd: ${target || ""}: aucun dossier virtuel`] };
    }
    return { output: [`dossier courant: ${nextDirectory}`], nextDirectory };
  }

  if (base === "cat") {
    const filePath = resolveVirtualPath(target, currentDirectory);
    const fileContent = readVirtualFile(filePath, content);
    if (!fileContent) {
      return { output: [`cat: ${target || ""}: fichier virtuel introuvable`] };
    }
    return { output: fileContent };
  }

  if (base === "grep") return { output: runGrep(command, content, currentDirectory) };
  if (base === "find") return { output: runFind(command, content, currentDirectory) };
  if (base === "learn") return { output: getLearningNotes(target || "shell") };
  if (base === "lesson") return { output: getLesson(target || "git") };
  if (base === "explain") return { output: explainTarget(target, content) };
  if (base === "roadmap") return { output: getRoadmap() };
  if (base === "debug") return { output: getDebugMindset(target) };
  if (base === "ps") return { output: getProcessList() };
  if (base === "top" || base === "htop") return { output: getTopSnapshot() };
  if (base === "uptime") return { output: ["up 24 years, learning load average: 0.42, 0.73, 1.00"] };

  if (base === "free") {
    return {
      output: [
        "              total        used        free",
        "curiosity     100%         87%         13%",
        "focus         100%         76%         24%",
      ],
    };
  }

  if (base === "df") {
    return {
      output: [
        "Filesystem      Size  Used Avail Mounted on",
        "ideas           1T    62G  938G /home/victoire/projects",
        "learning        1T    51G  949G /home/victoire/skills",
      ],
    };
  }

  if (base === "vpm") return { output: runVirtualPackageManager(target) };
  if (base === "systemctl") return { output: runSystemctl(target) };
  if (base === "journalctl") return { output: getSystemJournal(target) };
  if (base === "quiz") return { output: getQuiz(target || "git") };
  if (base === "challenge") return { output: getChallenge(target || "shell") };
  if (base === "health") return { output: getHealthCheck(content) };
  if (base === "skills") return { output: getSkillMatrix(content) };
  if (base === "motd") return { output: getMessageOfTheDay() };
  if (base === "open-source") return { output: getOpenSourceSignal() };
  if (base === "sudo") return runSudo(target, effects);
  if (base === "ssh") return runSsh(target, effects);
  if (base === "deploy") return runDeploy(target, content);

  if (base === "tree") {
    return {
      output: [
        "/home/victoire",
        "|-- README.md",
        "|-- about.md",
        "|-- values.md",
        "|-- mission.env",
        "|-- roadmap.md",
        "|-- logs/",
        "|   `-- learning.log",
        "|-- inbox/",
        "|   `-- messages.md",
        "|-- scripts/",
        "|   |-- deploy.sh",
        "|   |-- healthcheck.sh",
        "|   |-- seed-demo.sh",
        "|   |-- portfolio_audit.py",
        "|   |-- generate_report.py",
        "|   |-- report.js",
        "|   `-- api-check.js",
        "|-- docker/",
        "|   |-- Dockerfile.web",
        "|   |-- Dockerfile.api",
        "|   `-- compose.yaml",
        "|-- projects/",
        "|   |-- elegantstyle.md",
        "|   |-- baobab-monbaobab.md",
        "|   |-- burkinaloc.md",
        "|   `-- cotisations.md",
        "|-- stack/",
        "|   |-- frontend.txt",
        "|   |-- mobile.txt",
        "|   |-- backend.txt",
        "|   `-- devops-it.txt",
        "|-- /etc/victoire/",
        "|   |-- skills.conf",
        "|   `-- sandbox.policy",
        "|-- /var/status/",
        "|   `-- opportunities.json",
        "|-- /var/reports/",
        "|   |-- profile.json",
        "|   |-- projects.csv",
        "|   `-- stack.md",
        "`-- contact/",
        "    `-- links.txt",
      ],
    };
  }

  if (base === "neofetch") {
    return {
      output: [
        "        VS        victoire@sawadogo",
        "      VSSV        -----------------",
        "    VS    VS      OS: Atelier Portfolio Edition",
        "   VS CODE VS     Kernel: React + TypeScript + Human UX",
        "    VS    VS      Shell: immersive-sandbox",
        "      VSSV        Focus: Fullstack, Mobile, IA, Culture",
        "        VS        Status: building useful products",
      ],
    };
  }

  if (base === "uname") return { output: ["Atelier portfolio 1.0.0 immersive-shell react-typescript"] };
  if (base === "date") return { output: [getCurrentDate(effects).toLocaleString("fr-FR")] };
  if (base === "echo") return { output: [originalParts.slice(1).join(" ")] };

  if (base === "env") {
    return {
      output: [
        "USER=victoire",
        "ROLE=fullstack_mobile_developer",
        "MISSION=build_human_products",
        "REGION=africa",
        "SHELL=/bin/portfolio",
      ],
    };
  }

  if (base === "help") {
    return {
      output: [
        "Commandes disponibles:",
        "Systeme: pwd, ls, cd <dir>, cat <file>, tree, find, grep, history, alias, man, reboot",
        "Compteur: commands count, commands clear",
        "Runtime: python scripts/portfolio_audit.py, bash scripts/deploy.sh, docker ps, docker compose up",
        "Architecture: shellctl inspect, shellctl commands, shellctl fs",
        "Vue rapide: dashboard, status, metrics, memory show, set goal",
        "Guidage: visitor recruiter/developer/student/client, timeline, coach on/off",
        "Qualite: test, test shell, test api, test ui, coverage",
        "Missions: mission start recruiter, mission start tech-lead, mission start curious, mission progress",
        "Personnalite: mode recruiter, mode dev, mode mentor, mode playful",
        "Ops: ps, top, uptime, free, df, vpm, systemctl, journalctl, health",
        "Interpreteurs: bash, python, powershell, node, sql, languages",
        "Portfolio: whoami, stack, projects, open project <nom>, download apk <nom>, view screenshots <nom>",
        "Conversion: hire --why, hire --for mobile, hire --for api, hire --contact",
        "Transmission: learn <topic>, lesson git, quiz git, challenge shell, explain project <nom>",
        "Immersion: roadmap, debug mindset, sudo hire victoire, ssh contact, deploy portfolio",
        "Ergonomie: Tab autocomplete, Ctrl+L clear, fleches haut/bas history",
      ],
    };
  }

  if (base === "readme.md") return { output: readVirtualFile("/home/victoire/README.md", content) || [] };

  if (base === "whoami") {
    return {
      output: ["Victoire SAWADOGO", content.heroLead, `Signature: ${content.profileCaption}`],
    };
  }

  if (base === "stack") {
    return {
      output: content.stacks.map((group) => `${group.title}: ${group.items.map((item) => item.name).join(", ")}`),
    };
  }

  if (base === "projects" || base === "projets") {
    return {
      output: content.projects.map((project, index) => `0${index + 1} ${project.name} - ${project.focus}`),
    };
  }

  if (base === "journey" || base === "parcours") {
    return {
      output: [
        ...content.professionalTimeline.map((item) => `${item.period}: ${item.title}`),
        ...content.academicTimeline.map((item) => `${item.period}: ${item.title}`),
      ],
    };
  }

  if (base === "cv") {
    return {
      output: [
        "CV disponible dans la section #cv.",
        "Commande visuelle: clique sur Visionner ou Télécharger pour ouvrir le fichier public.",
      ],
    };
  }

  if (base === "contact") {
    return {
      output: [
        `Email: ${content.contactLinks.email}`,
        `GitHub: ${content.contactLinks.github}`,
        `LinkedIn: ${content.contactLinks.linkedin}`,
        `WhatsApp: ${content.contactLinks.whatsapp}`,
      ],
    };
  }

  if (base === "lab" || base === "labo") {
    return { output: content.labs.map((item) => `lab: ${item}`) };
  }

  if (base === "values" || base === "valeurs") {
    return { output: content.identityPillars.map((pillar) => `${pillar.title}: ${pillar.text}`) };
  }

  if (base === "why") {
    if (args[0] === "stack") {
      return { output: explainStackChoice(args.slice(1).join(" "), content) };
    }
    return { output: [content.identityIntro, ...content.aboutParagraphs] };
  }

  if (base === "current") {
    const currentProject = content.projects[0];
    return {
      output: [
        content.professionalTimeline[0]?.title || "Developpeur Fullstack & Mobile",
        currentProject
          ? `Focus produit: ${currentProject.name} - ${currentProject.description}`
          : "Focus produit: construire des experiences utiles et humaines.",
      ],
    };
  }

  if (base === "open") {
    if (args[0] === "project") {
      const project = findProjectByQuery(content.projects, args.slice(1).join(" "));
      if (!project) {
        return { output: ["Projet introuvable. Essaie: projects puis open project <nom>."] };
      }
      effects.openProject?.(project.name, "open");
      return {
        output: [
          `Ouverture du projet: ${project.name}`,
          project.projectUrl ? `Lien public: ${project.projectUrl}` : "Lien public: non renseigne",
          project.apkUrl ? `APK disponible: ${project.apkName || project.apkUrl}` : "APK: non renseigne",
        ],
      };
    }

    const sectionAliases: Record<string, string> = {
      profil: "profil",
      profile: "profil",
      stack: "stack",
      projects: "projets",
      projets: "projets",
      journey: "parcours",
      parcours: "parcours",
      lab: "labo",
      labo: "labo",
      cv: "cv",
      contact: "contact",
    };
    const sectionId = sectionAliases[target];
    if (!sectionId) {
      return { output: ["Section inconnue. Exemple: open projects, open stack, open contact."] };
    }
    effects.openSection?.(sectionId);
    return { output: [`Navigation vers #${sectionId}.`] };
  }

  if (base === "download" && args[0] === "apk") {
    const project = findProjectByQuery(content.projects, args.slice(1).join(" "));
    if (!project) {
      return { output: ["Projet introuvable. Essaie: projects puis download apk <nom>."] };
    }
    if (!project.apkUrl) {
      return { output: [`${project.name}: aucun APK n'est encore disponible.`] };
    }
    effects.downloadApk?.(project.apkUrl);
    return { output: [`Téléchargement APK: ${project.apkName || project.name}`] };
  }

  if (base === "view" && args[0] === "screenshots") {
    const project = findProjectByQuery(content.projects, args.slice(1).join(" "));
    if (!project) {
      return { output: ["Projet introuvable. Essaie: projects puis view screenshots <nom>."] };
    }
    const screenshots = project.screenshots || [];
    if (!screenshots.length && !project.logoUrl) {
      return { output: [`${project.name}: aucune capture n'est encore disponible.`] };
    }
    effects.openProject?.(project.name, "screenshots");
    return { output: [`Galerie ouverte: ${project.name}`, `${screenshots.length} capture(s) disponible(s).`] };
  }

  return {
    output: [`Commande inconnue: ${command}`, "Tape help pour voir les commandes disponibles."],
  };
}

function getIsoTimestamp(effects: ShellEffects) {
  return getCurrentDate(effects).toISOString();
}

function getCurrentDate(effects: ShellEffects) {
  return effects.now?.() || new Date();
}

function getMemoryReport(memory: VictoireMemory) {
  return [
    "Atelier memory",
    `goal: ${memory.goal}`,
    `visitor: ${memory.visitor}`,
    `persona: ${memory.persona}`,
    `mission: ${memory.mission || "standby"}`,
    `autopilot: ${memory.autopilot ? "on" : "off"}`,
    `coach: ${memory.coach ? "on" : "off"}`,
    `visitedProjects: ${memory.visitedProjects.length ? memory.visitedProjects.join(", ") : "none"}`,
    `lastActiveAt: ${memory.lastActiveAt || "not yet"}`,
    "recent commands:",
    ...(memory.commands.length ? memory.commands.slice(-6).map((item) => `  ${item}`) : ["  none"]),
  ];
}

function runExecutableVirtualFile(command: string, content: CommandContent, currentDirectory: string): ShellResult {
  const [scriptPath] = command.split(/\s+/);
  const filePath = resolveVirtualPath(scriptPath.replace(/^\.\//, ""), currentDirectory);
  const file = buildVirtualFiles(content)[filePath];
  if (!file) {
    return { output: [`${scriptPath}: fichier executable virtuel introuvable`] };
  }
  if (!file.executable) {
    return { output: [`${scriptPath}: permission denied. Essaie chmod +x ${scriptPath}`] };
  }
  const relativePath = toRelativeVirtualPath(filePath, "/home/victoire");
  if (file.kind === "bash") return { output: runBashRuntime(relativePath, content) };
  if (file.kind === "python") return { output: runPythonRuntime(relativePath, content) };
  if (file.kind === "javascript") return { output: runNodeRuntime(relativePath, content) };
  return { output: [`${scriptPath}: type executable non supporte (${file.kind})`] };
}

function runSudo(target: string, effects: ShellEffects): ShellResult {
  if (target === "hire victoire") {
    effects.openSection?.("contact");
    return {
      output: [
        "[sudo] password for visitor: ********",
        "access granted: contact section opened",
        "Reason: Victoire sait construire, apprendre et transmettre.",
      ],
    };
  }
  return { output: [`sudo: ${target}: permission denied in portfolio sandbox`] };
}

function runSsh(target: string, effects: ShellEffects): ShellResult {
  const section = target || "contact";
  const aliases: Record<string, string> = {
    contact: "contact",
    projects: "projets",
    projets: "projets",
    stack: "stack",
    lab: "labo",
    labo: "labo",
  };
  const sectionId = aliases[section];
  if (!sectionId) return { output: [`ssh: could not resolve host ${section}`] };
  effects.openSection?.(sectionId);
  return { output: [`Connecting to ${section}...`, "Handshake complete.", `Mounted section #${sectionId}.`] };
}

function runDeploy(target: string, content: CommandContent): ShellResult {
  if (target && target !== "portfolio") {
    return { output: [`deploy: target '${target}' not configured. Try deploy portfolio.`] };
  }
  return {
    output: [
      "npm run build",
      "checking UX................ ok",
      "checking shell immersion.... ok",
      "checking human signal....... ok",
      `shipping identity.......... ${content.profileCaption}`,
      "deploy complete: portfolio ready to be explored.",
    ],
  };
}
