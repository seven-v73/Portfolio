import type { ShellMode } from "../types";

export function getBootOutput() {
  return [
    "Profil chargé: Victoire SAWADOGO",
    "Espace prêt: projets, CV, contact, stack",
    "Tape help, projects, cv ou contact pour explorer rapidement.",
  ];
}

export function normalizeShellMode(command: string): ShellMode {
  if (command === "pwsh") return "powershell";
  if (command === "javascript" || command === "js") return "node";
  if (command === "python" || command === "powershell" || command === "node" || command === "sql") return command;
  return "bash";
}

export function modeHint(mode: ShellMode) {
  if (mode === "python") return "Essaie: about(), stack(), projects(), docker(), audit(), from victoire import profile, print('hello'), 2 + 2, exit";
  if (mode === "powershell") return "Essaie: Get-Profile, Get-Stack, Get-Projects, Get-Contact, Get-Help, exit";
  if (mode === "node") return "Essaie: about(), stack(), projects(), console.log('hello'), exit";
  if (mode === "sql") return "Essaie: SELECT * FROM projects; SELECT * FROM stack; SELECT * FROM contact;";
  return "Essaie: ls, cat about.md, bash scripts/deploy.sh, python scripts/portfolio_audit.py, docker ps";
}

export function expandAlias(command: string, aliases: Record<string, string>) {
  const [base, ...rest] = command.split(/\s+/);
  if (!aliases[base]) return command;
  return [aliases[base], ...rest].join(" ");
}

export function toTildePath(directory: string) {
  return directory.replace(/^\/home\/victoire/, "~");
}
