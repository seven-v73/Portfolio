import { buildVirtualFiles, createVirtualFileSystem, type FileSystemContent } from "./filesystem";
import { slugify } from "./slug";

export const defaultAliases: Record<string, string> = {
  me: "whoami",
  ll: "ls",
  cls: "clear",
  py: "python",
  ps: "powershell",
  js: "node",
  hire: "sudo hire victoire",
};

export function toRelativeVirtualPath(pathname: string, currentDirectory: string) {
  if (pathname.startsWith(`${currentDirectory}/`)) return pathname.replace(`${currentDirectory}/`, "");
  if (pathname.startsWith("/home/victoire/")) return pathname.replace("/home/victoire/", "");
  return pathname;
}

export function getBaseCommands(content: FileSystemContent, aliases: Record<string, string>) {
  return [
    "help",
    "cat README.md",
    "man learn",
    "history",
    "alias",
    "reboot",
    "commands count",
    "commands clear",
    "dashboard",
    "hire --why",
    "hire --contact",
    "status",
    "shellctl inspect",
    "shellctl commands",
    "shellctl fs",
    "visitor recruiter",
    "visitor developer",
    "visitor student",
    "visitor client",
    "timeline",
    "coach on",
    "test",
    "test shell",
    "test api",
    "test ui",
    "coverage",
    "memory show",
    "set goal \"trouver une alternance\"",
    "autopilot on",
    "mission start recruiter",
    "mission progress",
    "mode recruiter",
    "pwd",
    "ls",
    "cd projects",
    "cat about.md",
    "open project elegantstyle",
    "download apk burkinaloc",
    "view screenshots elegantstyle",
    "grep culture about.md",
    "find . -name \"*.md\"",
    "python scripts/portfolio_audit.py",
    "python scripts/generate_report.py",
    "bash scripts/deploy.sh",
    "bash scripts/healthcheck.sh",
    "node --version",
    "node scripts/report.js",
    "docker ps",
    "docker images",
    "docker compose up",
    "docker logs victoire-api",
    "git status",
    "npm run build",
    "pip list",
    "learn git",
    "learn docker",
    "learn api",
    "lesson git",
    "explain project elegantstyle",
    "why stack react",
    "roadmap",
    "debug mindset",
    "ps",
    "vpm list",
    "systemctl status portfolio",
    "systemctl status victoire",
    "journalctl -n 5",
    "quiz git",
    "challenge shell",
    "health",
    "skills",
    "motd",
    "sudo hire victoire",
    "ssh contact",
    "deploy portfolio",
    "neofetch",
    "python",
    "powershell",
    "node",
    "sql",
    ...Object.keys(aliases),
    ...content.projects.map((project) => `cat projects/${slugify(project.name)}.md`),
  ];
}

export function getRuntimeCommandSuggestions(input: string, currentDirectory: string, content: FileSystemContent) {
  const trimmedInput = input.trim();
  const [base = "", ...rest] = trimmedInput.split(/\s+/);
  const partial = rest.join(" ").toLowerCase();
  const files = buildVirtualFiles(content);
  const executableFiles = Object.entries(files)
    .filter(([, file]) => file.executable)
    .map(([path, file]) => ({ path, file, relativePath: toRelativeVirtualPath(path, currentDirectory) }));
  const runtimeSuggestions: Record<string, string[]> = {
    python: [
      "python --version",
      "python repl",
      "python -m pip list",
      "python -m venv .venv",
      ...executableFiles.filter(({ file }) => file.kind === "python").map(({ relativePath }) => `python ${relativePath}`),
    ],
    python3: ["python3 --version"],
    bash: [
      "bash --version",
      "bash explain scripts/deploy.sh",
      ...executableFiles.filter(({ file }) => file.kind === "bash").map(({ relativePath }) => `bash ${relativePath}`),
    ],
    sh: executableFiles.filter(({ file }) => file.kind === "bash").map(({ relativePath }) => `sh ${relativePath}`),
    node: [
      "node --version",
      "node scripts/api-check.js",
      ...executableFiles.filter(({ file }) => file.kind === "javascript").map(({ relativePath }) => `node ${relativePath}`),
    ],
    docker: [
      "docker --version",
      "docker ps",
      "docker images",
      "docker compose up",
      "docker compose ps",
      "docker compose build",
      "docker compose down",
      "docker logs victoire-api",
      "docker inspect victoire-web",
    ],
    git: ["git status", "git branch", "git diff", "git log --oneline"],
    npm: ["npm run dev", "npm run build", "npm test"],
    pip: ["pip list", "pip install rich"],
    cat: Object.keys(files).map((path) => `cat ${toRelativeVirtualPath(path, currentDirectory)}`),
    cd: Object.keys(createVirtualFileSystem(content)).map((path) => `cd ${toRelativeVirtualPath(path, currentDirectory)}`),
    shellctl: ["shellctl inspect", "shellctl commands", "shellctl fs"],
    visitor: ["visitor recruiter", "visitor developer", "visitor student", "visitor client"],
    test: ["test", "test shell", "test api", "test ui"],
    coach: ["coach on", "coach off"],
    commands: ["commands count", "commands clear"],
  };
  const suggestions = runtimeSuggestions[base.toLowerCase()] || [];
  if (!suggestions.length) return [];
  return suggestions.filter((suggestion) =>
    suggestion.toLowerCase().startsWith(`${base.toLowerCase()}${partial ? ` ${partial}` : ""}`),
  );
}

export function getCommandSuggestions(
  input: string,
  currentDirectory: string,
  content: FileSystemContent,
  aliases: Record<string, string>,
) {
  const trimmedInput = input.trim().toLowerCase();
  const commands = getBaseCommands(content, aliases);
  if (!trimmedInput) return ["dashboard", "python scripts/portfolio_audit.py", "bash scripts/deploy.sh", "docker ps", "shellctl inspect"];
  const runtimeSuggestions = getRuntimeCommandSuggestions(input, currentDirectory, content);
  const fileSuggestions = createVirtualFileSystem(content)[currentDirectory]?.map((item) =>
    item.endsWith("/") ? `cd ${item.slice(0, -1)}` : `cat ${item}`,
  ) || [];
  return Array.from(new Set([...runtimeSuggestions, ...commands, ...fileSuggestions])).filter((command) =>
    command.toLowerCase().startsWith(trimmedInput),
  );
}

export function getPaletteItems(
  query: string,
  currentDirectory: string,
  content: FileSystemContent,
  aliases: Record<string, string>,
) {
  const files = Object.keys(buildVirtualFiles(content)).map((path) => `cat ${toRelativeVirtualPath(path, currentDirectory)}`);
  const commands = [
    ...getBaseCommands(content, aliases),
    ...files,
    "python repl",
    "bash explain scripts/deploy.sh",
    "docker compose ps",
    "node scripts/api-check.js",
    "git branch",
    "cat /var/reports/profile.json",
    "cat /var/reports/projects.csv",
    "cat /var/reports/stack.md",
  ];
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return commands;
  return commands.filter((command) => command.toLowerCase().includes(normalizedQuery));
}

export function completeCommand(
  input: string,
  currentDirectory: string,
  content: FileSystemContent,
  aliases: Record<string, string>,
) {
  const suggestions = getCommandSuggestions(input, currentDirectory, content, aliases);
  return suggestions[0] || input;
}
