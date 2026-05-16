import { createVirtualFileSystem, readVirtualFile, resolveVirtualPath, type FileSystemContent } from "./filesystem";
import { evaluateSimpleMath } from "./math";
import { runDockerCommand, runPythonRuntime } from "./runtimes";

type InterpreterResult = {
  output: string[];
  nextDirectory?: string;
};

type InterpreterContent = FileSystemContent & {
  heroEyebrow: string;
  labs: string[];
  professionalTimeline: Array<{ period: string; title: string }>;
};

export function resolvePythonCommand(command: string, content: InterpreterContent): InterpreterResult {
  const trimmedCommand = command.trim();
  const normalizedCommand = trimmedCommand.toLowerCase();

  if (normalizedCommand === "help" || normalizedCommand === "dir()") {
    return {
      output: [
        "Python sandbox:",
        "about(), stack(), projects(), journey(), contact(), values(), lab(), docker(), audit()",
        "Imports supportes: import victoire, from victoire import profile",
        "print('texte') et calculs simples comme 2 + 2 sont supportes.",
      ],
    };
  }
  if (normalizedCommand === "import victoire") return { output: ["module victoire loaded: profile(), stack(), projects(), docker(), audit()"] };
  if (normalizedCommand === "from victoire import profile") return { output: ["profile imported. Essaie: profile()"] };
  if (normalizedCommand === "profile()") return { output: ["{", '  "name": "Victoire SAWADOGO",', `  "caption": "${content.profileCaption}",`, `  "projects": ${content.projects.length}`, "}"] };
  if (normalizedCommand === "about()" || normalizedCommand === "whoami()") return { output: ["Victoire SAWADOGO", content.heroLead, content.profileCaption] };
  if (normalizedCommand === "stack()") return { output: content.stacks.map((group) => `${group.title} = [${group.items.map((item) => item.name).join(", ")}]`) };
  if (normalizedCommand === "projects()") return { output: content.projects.map((project, index) => `${index + 1}. ${project.name}: ${project.description}`) };
  if (normalizedCommand === "journey()") return { output: content.professionalTimeline.map((item) => `${item.period} -> ${item.title}`) };
  if (normalizedCommand === "contact()") {
    return { output: [`email = '${content.contactLinks.email}'`, `github = '${content.contactLinks.github}'`, `linkedin = '${content.contactLinks.linkedin}'`, `whatsapp = '${content.contactLinks.whatsapp}'`] };
  }
  if (normalizedCommand === "values()") return { output: content.identityPillars.map((pillar) => `${pillar.title}: ${pillar.text}`) };
  if (normalizedCommand === "lab()") return { output: content.labs };
  if (normalizedCommand === "docker()") return { output: runDockerCommand("ps", content) };
  if (normalizedCommand === "audit()") return { output: runPythonRuntime("scripts/portfolio_audit.py", content) };
  if (normalizedCommand === "len(projects())") return { output: [String(content.projects.length)] };
  if (normalizedCommand === "len(stack())") return { output: [String(content.stacks.flatMap((group) => group.items).length)] };

  const printMatch = trimmedCommand.match(/^print\((["'])(.*)\1\)$/);
  if (printMatch) return { output: [printMatch[2]] };
  if (/^[\d\s+\-*/().%]+$/.test(trimmedCommand)) return { output: [String(evaluateSimpleMath(trimmedCommand))] };

  return { output: [`NameError: name '${trimmedCommand}' is not defined in this sandbox`, "Tape help pour voir les fonctions disponibles."] };
}

export function resolvePowerShellCommand(
  command: string,
  content: InterpreterContent,
  currentDirectory: string,
): InterpreterResult {
  const normalizedCommand = command.trim().toLowerCase();
  if (normalizedCommand === "get-help" || normalizedCommand === "help") {
    return { output: ["PowerShell sandbox:", "Get-Profile, Get-Stack, Get-Projects, Get-Journey, Get-Contact, Get-Values", "Get-Location, Get-ChildItem, Get-Content about.md, Set-Location projects"] };
  }
  if (normalizedCommand === "get-profile") return { output: ["Name: Victoire SAWADOGO", `Bio: ${content.heroLead}`] };
  if (normalizedCommand === "get-stack") return { output: content.stacks.map((group) => `${group.title}: ${group.items.map((item) => item.name).join(", ")}`) };
  if (normalizedCommand === "get-projects") return { output: content.projects.map((project) => `${project.name} | ${project.focus}`) };
  if (normalizedCommand === "get-journey") return { output: content.professionalTimeline.map((item) => `${item.period}: ${item.title}`) };
  if (normalizedCommand === "get-contact") return { output: [`Email    ${content.contactLinks.email}`, `GitHub   ${content.contactLinks.github}`, `LinkedIn ${content.contactLinks.linkedin}`, `WhatsApp ${content.contactLinks.whatsapp}`] };
  if (normalizedCommand === "get-values") return { output: content.identityPillars.map((pillar) => `${pillar.title}: ${pillar.text}`) };
  if (normalizedCommand === "get-location") return { output: [currentDirectory] };
  if (normalizedCommand === "get-childitem" || normalizedCommand === "ls") {
    const items = createVirtualFileSystem(content)[currentDirectory];
    return { output: items ? [items.join("  ")] : [`ls: impossible d'acceder a '${currentDirectory}': aucun dossier virtuel`] };
  }
  if (normalizedCommand.startsWith("set-location ")) {
    const nextDirectory = resolveVirtualPath(command.trim().slice("set-location ".length), currentDirectory);
    if (!createVirtualFileSystem(content)[nextDirectory]) return { output: [`cd: ${nextDirectory}: aucun dossier virtuel`] };
    return { output: [`dossier courant: ${nextDirectory}`], nextDirectory };
  }
  if (normalizedCommand.startsWith("get-content ")) {
    const filePath = resolveVirtualPath(command.trim().slice("get-content ".length), currentDirectory);
    const fileContent = readVirtualFile(filePath, content);
    return { output: fileContent || [`cat: ${filePath}: fichier virtuel introuvable`] };
  }
  if (normalizedCommand === "clear-host" || normalizedCommand === "cls") return { output: ["Utilise clear dans le shell principal pour vider l'ecran."] };
  return { output: [`${command}: commande PowerShell virtuelle inconnue.`, "Tape Get-Help pour voir les commandes disponibles."] };
}

export function resolveNodeCommand(command: string, content: InterpreterContent): InterpreterResult {
  const trimmedCommand = command.trim();
  const normalizedCommand = trimmedCommand.toLowerCase();
  if (normalizedCommand === "help") return { output: ["Node sandbox:", "about(), stack(), projects(), contact(), values()", "console.log('texte') et calculs simples comme 2 + 2 sont supportes."] };
  if (normalizedCommand === "about()" || normalizedCommand === "whoami()") return { output: [`{ name: "Victoire SAWADOGO", bio: "${content.heroLead}" }`] };
  if (normalizedCommand === "stack()") return { output: content.stacks.map((group) => `${group.title}: ${group.items.map((item) => item.name).join(", ")}`) };
  if (normalizedCommand === "projects()") return { output: content.projects.map((project) => `${project.name} => ${project.focus}`) };
  if (normalizedCommand === "contact()") return { output: Object.entries(content.contactLinks).map(([key, value]) => `${key}: ${value}`) };
  if (normalizedCommand === "values()") return { output: content.identityPillars.map((pillar) => `${pillar.title}: ${pillar.text}`) };
  const logMatch = trimmedCommand.match(/^console\.log\((["'])(.*)\1\)$/);
  if (logMatch) return { output: [logMatch[2]] };
  if (/^[\d\s+\-*/().%]+$/.test(trimmedCommand)) return { output: [String(evaluateSimpleMath(trimmedCommand))] };
  return { output: [`ReferenceError: ${trimmedCommand} is not defined in this sandbox`] };
}

export function resolveSqlCommand(command: string, content: InterpreterContent): InterpreterResult {
  const normalizedCommand = command.trim().replace(/;$/, "").toLowerCase();
  if (normalizedCommand === "help" || normalizedCommand === "\\?") return { output: ["Tables virtuelles: me, projects, stack, contact, values", "Exemples: SELECT * FROM projects; SELECT * FROM stack; SELECT * FROM contact;"] };
  if (normalizedCommand === "select * from me") return { output: ["name | role", `Victoire SAWADOGO | ${content.heroEyebrow}`] };
  if (normalizedCommand === "select * from projects") return { output: ["id | name | focus", ...content.projects.map((project, index) => `${index + 1} | ${project.name} | ${project.focus}`)] };
  if (normalizedCommand === "select * from stack") return { output: ["domain | technologies", ...content.stacks.map((group) => `${group.title} | ${group.items.map((item) => item.name).join(", ")}`)] };
  if (normalizedCommand === "select * from contact") return { output: ["channel | value", ...Object.entries(content.contactLinks).map(([key, value]) => `${key} | ${value}`)] };
  if (normalizedCommand === "select * from values") return { output: ["title | detail", ...content.identityPillars.map((pillar) => `${pillar.title} | ${pillar.text}`)] };
  return { output: ["SQL sandbox: requete non reconnue.", "Essaie SELECT * FROM projects; ou SELECT * FROM stack;"] };
}
