import { buildVirtualFiles, type FileSystemContent } from "./filesystem";

type SystemContent = FileSystemContent;

export function runVirtualPackageManager(target: string) {
  const packages = [
    "human-ux",
    "clean-api",
    "mobile-craft",
    "linux-habits",
    "debug-mindset",
    "culture-tech",
  ];
  if (!target || target === "list") return packages.map((item) => `installed ${item}`);
  if (target.startsWith("install ")) {
    const packageName = target.replace("install ", "");
    return [
      `resolving ${packageName}...`,
      "checking compatibility with Atelier... ok",
      `installed ${packageName} as a learning module`,
    ];
  }
  if (target === "update") return ["syncing learning index...", "all modules are already fresh"];
  return ["vpm usage: vpm list | vpm install <module> | vpm update"];
}

export function runShellControl(target: string, content: SystemContent) {
  if (target === "inspect" || !target) {
    return [
      "Atelier shell architecture",
      "ui............. React prompt, history, autocomplete, output renderer",
      "router......... declarative runtime command handlers",
      "runtimes....... bash, python, node, docker, git, npm, pip",
      "filesystem..... typed virtual files with executable metadata",
      "memory......... localStorage profile, missions, autopilot",
      "sandbox........ simulated by default; backend Docker sandbox can be added later",
    ];
  }
  if (target === "commands") {
    return [
      "Runtime commands",
      "python, python3, bash, sh, node, docker, docker-compose, git, npm, pip",
      "Core commands",
      "help, ls, cd, cat, grep, find, tree, history, alias, man, which, chmod",
      "Autonomous commands",
      "dashboard, memory, visitor, timeline, mission, mode, autopilot, coach, shellctl, test, coverage",
    ];
  }
  if (target === "fs") {
    const files = buildVirtualFiles(content);
    return [
      "Typed virtual filesystem",
      ...Object.entries(files).map(([path, file]) =>
        `${file.executable ? "x" : "-"} ${file.kind.padEnd(10, " ")} ${path} - ${file.description}`,
      ),
    ];
  }
  return ["usage: shellctl inspect | shellctl commands | shellctl fs"];
}

export function runVirtualTests(target: string, content: SystemContent) {
  const suites: Record<string, string[]> = {
    all: [
      "Atelier test runner",
      "shell........ 18 passed",
      "api.......... 9 passed",
      "ui........... 12 passed",
      "runtimes..... 15 passed",
      "result....... 54 passed, 0 failed",
    ],
    shell: [
      "test shell",
      "✓ routes commands through runtime handlers",
      "✓ resolves typed virtual files",
      "✓ completes python/bash/docker suggestions",
      "✓ preserves sandbox boundaries",
    ],
    api: [
      "test api",
      "✓ GET /api/content returns portfolio content",
      "✓ CV manifest fallback works",
      "✓ auth rejects missing token",
      "✓ content bridge can hydrate Atelier",
    ],
    ui: [
      "test ui",
      "✓ terminal prompt renders",
      "✓ Ctrl+K palette opens",
      "✓ dashboard cards do not resize terminal layout",
      `✓ ${content.projects.length} projects visible to command layer`,
    ],
  };
  return suites[target] || ["usage: test | test shell | test api | test ui"];
}

export function getCoverageReport(content: SystemContent) {
  return [
    "Atelier coverage",
    "command router........ 92%",
    "runtime adapters...... 88%",
    "virtual filesystem.... 95%",
    "autonomy modules...... 84%",
    "ui terminal........... 81%",
    `content indexed....... ${content.projects.length} projects / ${content.stacks.length} stack groups`,
    "next improvement...... extend Vitest coverage around resolveShellCommand",
  ];
}

export function runSystemctl(target: string) {
  if (!target) return ["usage: systemctl status <service>"];
  const [action, service = "portfolio"] = target.split(/\s+/);
  if (action !== "status") return [`systemctl: action '${action}' is simulated as read-only`];
  const services: Record<string, string[]> = {
    portfolio: ["portfolio.service - Victoire portfolio experience", "Active: active (running)", "Loaded: React, TypeScript, Express, MongoDB"],
    victoire: ["victoire.service - Autonomous portfolio OS", "Active: active (adaptive)", "Modules: memoryd, missiond, autopilotd, content-api bridge"],
    api: ["api.service - Content API", "Active: active (proxied)", "Health: accepts content, auth and CV uploads"],
    shell: ["shell.service - Atelier interactive shell", "Active: active (sandboxed)", "Security: no real system command execution"],
  };
  return services[service] || [`Unit ${service}.service could not be found.`];
}

export function getSystemJournal(target: string) {
  const lines = [
    "10:04 boot: profile mounted successfully",
    "10:05 shell: README.md opened by visitor",
    "10:06 learning: git lesson requested",
    "10:07 contact: ssh handshake ready",
    "10:08 deploy: human signal verified",
  ];
  const countMatch = target.match(/-n\s+(\d+)/);
  const count = countMatch ? Number(countMatch[1]) : lines.length;
  return lines.slice(-count);
}

export function getHealthCheck(content: SystemContent) {
  return [
    "Atelier healthcheck",
    `content.projects: ${content.projects.length ? "ok" : "empty"}`,
    `content.stack: ${content.stacks.length ? "ok" : "empty"}`,
    `contact.email: ${content.contactLinks.email ? "ok" : "missing"}`,
    "runtime.python: ready",
    "runtime.bash: ready",
    "runtime.docker: simulated",
    "shell.security: sandboxed",
    "learning.mode: enabled",
  ];
}

export function getSkillMatrix(content: SystemContent) {
  return [
    "Skill matrix",
    ...content.stacks.map((group) => `${group.title.padEnd(12, " ")} ${"#".repeat(Math.min(10, group.items.length + 5))}`),
    "Transmission ###.......",
    "Product      #######...",
    "Debugging    #######...",
  ];
}
