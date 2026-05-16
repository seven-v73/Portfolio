import type { VirtualFile } from "../types";
import { slugify } from "./slug";

export type FileSystemContent = {
  heroTitle: string;
  heroLead: string;
  profileCaption: string;
  aboutParagraphs: string[];
  metrics: string[][];
  identityPillars: Array<{ title: string; text: string }>;
  contactLinks: {
    email: string;
    github: string;
    linkedin: string;
    whatsapp: string;
  };
  projects: Array<{
    name: string;
    type: string;
    focus: string;
    description: string;
    tags: string[];
  }>;
  stacks: Array<{
    title: string;
    items: Array<{ name: string }>;
  }>;
};

function getRoadmap() {
  return [
    "Roadmap d'apprentissage",
    "[now] Renforcer React, TypeScript, API Node et design d'interfaces utiles.",
    "[next] Approfondir Docker, tests, CI/CD et architecture backend.",
    "[lab] Explorer IA appliquee, recommandation, vision produit et experiences culturelles.",
    "[share] Transformer chaque apprentissage en mini explication claire dans ce shell.",
  ];
}

export function buildVirtualFiles(content: FileSystemContent): Record<string, VirtualFile> {
  return {
    "/home/victoire/README.md": {
      kind: "markdown",
      description: "Point d'entree de Atelier",
      content: [
        "# Atelier",
        "Bienvenue dans le mini OS de shell de Victoire SAWADOGO.",
        "",
        "Objectif: explorer un profil de developpeur comme un systeme vivant.",
        "",
        "Quickstart:",
        "  neofetch",
        "  ls",
        "  cat about.md",
        "  python scripts/portfolio_audit.py",
        "  bash scripts/deploy.sh",
        "  docker compose up",
        "  shellctl inspect",
        "",
        "Ce shell est sandboxe: il enseigne, raconte et navigue, sans executer de vraies commandes serveur.",
      ],
    },
    "/home/victoire/logs/learning.log": {
      kind: "text",
      description: "Journal d'apprentissage",
      content: [
        "2026-05-12 09:00 boot Atelier layer",
        "2026-05-12 09:08 module memoryd records visitor intent locally",
        "2026-05-12 09:14 module missiond maps recruiter, tech-lead and curious paths",
        "2026-05-12 09:21 module autopilotd recommends the next useful command",
        "2026-05-12 09:30 content-api bridge keeps portfolio data editable from backend",
      ],
    },
    "/home/victoire/inbox/messages.md": {
      kind: "markdown",
      description: "Messages contextuels selon le visiteur",
      content: [
        "# Inbox",
        "- Recruteur: lance mission start recruiter pour obtenir le parcours le plus direct.",
        "- Tech lead: lance mission start tech-lead pour inspecter stack, architecture et signaux de qualite.",
        "- Curieux: lance mission start curious pour explorer le systeme comme un atelier.",
      ],
    },
    "/home/victoire/scripts/deploy.sh": {
      kind: "bash",
      executable: true,
      description: "Pipeline de deploiement simule",
      content: [
        "#!/usr/bin/env bash",
        "set -euo pipefail",
        "",
        "npm run build",
        "docker compose -f docker/compose.yaml build",
        "docker compose -f docker/compose.yaml up -d",
        "bash scripts/healthcheck.sh",
      ],
    },
    "/home/victoire/scripts/healthcheck.sh": {
      kind: "bash",
      executable: true,
      description: "Controle sante frontend, API et containers",
      content: [
        "#!/usr/bin/env bash",
        "set -euo pipefail",
        "",
        "curl -fsS http://localhost:5173 >/dev/null",
        "curl -fsS http://localhost:4000/api/content >/dev/null",
        "docker ps --filter name=victoire",
      ],
    },
    "/home/victoire/scripts/seed-demo.sh": {
      kind: "bash",
      executable: true,
      description: "Seed demo pour contenu et admin",
      content: [
        "#!/usr/bin/env bash",
        "set -euo pipefail",
        "",
        "node server/seedAdmin.js",
        "node -e \"console.log('portfolio content seeded')\"",
      ],
    },
    "/home/victoire/scripts/portfolio_audit.py": {
      kind: "python",
      executable: true,
      description: "Audit Python du contenu portfolio",
      content: [
        "from dataclasses import dataclass",
        "from victoire import profile, projects, stack",
        "",
        "@dataclass",
        "class AuditResult:",
        "    score: int",
        "    recommendation: str",
        "",
        "def run():",
        "    signals = len(projects()) + len(stack())",
        "    return AuditResult(score=94, recommendation='document Docker, tests and API contracts')",
        "",
        "print(run())",
      ],
    },
    "/home/victoire/scripts/generate_report.py": {
      kind: "python",
      executable: true,
      description: "Generation d'un rapport JSON du profil",
      content: [
        "import json",
        "from victoire import profile, projects",
        "",
        "report = {",
        "    'profile': profile(),",
        "    'projects': projects(),",
        "    'runtime': ['python', 'bash', 'docker', 'node', 'mongodb'],",
        "}",
        "print(json.dumps(report, indent=2))",
      ],
    },
    "/home/victoire/scripts/report.js": {
      kind: "javascript",
      executable: true,
      description: "Rapport Node.js du profil",
      content: [
        "const profile = require('@victoire/profile');",
        "",
        "console.log({",
        "  name: profile.name,",
        "  runtime: ['node', 'react', 'express', 'mongodb'],",
        "  status: 'ready',",
        "});",
      ],
    },
    "/home/victoire/scripts/api-check.js": {
      kind: "javascript",
      executable: true,
      description: "Controle Node.js du contrat API",
      content: [
        "const endpoints = ['/api/content', '/api/auth/me', '/cv-manifest.json'];",
        "",
        "for (const endpoint of endpoints) {",
        "  console.log(`checking ${endpoint}`);",
        "}",
        "",
        "console.log('api contract stable');",
      ],
    },
    "/home/victoire/docker/Dockerfile.web": {
      kind: "docker",
      description: "Image frontend Atelier",
      content: [
        "FROM node:22-alpine AS build",
        "WORKDIR /app",
        "COPY package*.json ./",
        "RUN npm ci",
        "COPY . .",
        "RUN npm run build",
        "",
        "FROM nginx:alpine",
        "COPY --from=build /app/dist /usr/share/nginx/html",
      ],
    },
    "/home/victoire/docker/Dockerfile.api": {
      kind: "docker",
      description: "Image API Express",
      content: [
        "FROM node:22-alpine",
        "WORKDIR /api",
        "COPY package*.json ./",
        "RUN npm ci --omit=dev",
        "COPY server ./server",
        "EXPOSE 4000",
        "CMD [\"node\", \"server/index.js\"]",
      ],
    },
    "/home/victoire/docker/compose.yaml": {
      kind: "yaml",
      description: "Stack compose web, API et Mongo",
      content: [
        "services:",
        "  web:",
        "    build:",
        "      context: ..",
        "      dockerfile: docker/Dockerfile.web",
        "    ports: ['5173:80']",
        "  api:",
        "    build:",
        "      context: ..",
        "      dockerfile: docker/Dockerfile.api",
        "    ports: ['4000:4000']",
        "  mongo:",
        "    image: mongo:7",
        "    volumes: ['mongo-data:/data/db']",
        "volumes:",
        "  mongo-data:",
      ],
    },
    "/etc/victoire/skills.conf": {
      kind: "text",
      description: "Configuration de competences",
      content: [
        "frontend=React, TypeScript, UX, Framer Motion",
        "mobile=Flutter, Dart, Firebase",
        "backend=Node.js, Express, Laravel, MongoDB, Python",
        "ops=Linux, Bash, Docker, Git, troubleshooting",
        "product=besoin terrain, clarté, impact local",
      ],
    },
    "/etc/victoire/sandbox.policy": {
      kind: "text",
      description: "Politique d'execution future cote backend",
      content: [
        "mode=simulated-first",
        "real_execution=backend-only",
        "allow=runtimes:python,bash,node",
        "deny=network,filesystem-host,secrets,long-running-processes",
        "timeout=3000ms",
        "container=docker --read-only --network none",
      ],
    },
    "/var/status/opportunities.json": {
      kind: "json",
      description: "Statut disponibilite et opportunites",
      content: [
        "{",
        '  "available": true,',
        '  "interests": ["web", "mobile", "IA appliquee", "digitalisation"],',
        '  "best_next_command": "sudo hire victoire"',
        "}",
      ],
    },
    "/var/reports/profile.json": {
      kind: "json",
      description: "Rapport dynamique du profil",
      content: [
        "{",
        '  "name": "Victoire SAWADOGO",',
        `  "title": ${JSON.stringify(content.heroTitle)},`,
        `  "caption": ${JSON.stringify(content.profileCaption)},`,
        `  "projects": ${content.projects.length},`,
        `  "stackGroups": ${content.stacks.length}`,
        "}",
      ],
    },
    "/var/reports/projects.csv": {
      kind: "text",
      description: "Export dynamique des projets",
      content: [
        "name,type,focus,tags",
        ...content.projects.map((project) =>
          [
            project.name,
            project.type,
            project.focus,
            project.tags.join("|"),
          ].map((value) => `"${value.replace(/"/g, '""')}"`).join(","),
        ),
      ],
    },
    "/var/reports/stack.md": {
      kind: "markdown",
      description: "Rapport dynamique de la stack",
      content: [
        "# Stack Atelier",
        "",
        ...content.stacks.flatMap((group) => [
          `## ${group.title}`,
          group.items.map((item) => `- ${item.name}`).join("\n"),
          "",
        ]),
      ],
    },
  };
}

export function createVirtualFileSystem(content: FileSystemContent): Record<string, string[]> {
  return {
    "/": ["home/", "etc/", "var/"],
    "/home": ["victoire/"],
    "/home/victoire": ["README.md", "about.md", "values.md", "mission.env", "roadmap.md", "logs/", "inbox/", "scripts/", "docker/", "projects/", "stack/", "contact/"],
    "/home/victoire/logs": ["learning.log"],
    "/home/victoire/inbox": ["messages.md"],
    "/home/victoire/scripts": ["deploy.sh", "healthcheck.sh", "seed-demo.sh", "portfolio_audit.py", "generate_report.py", "report.js", "api-check.js"],
    "/home/victoire/docker": ["Dockerfile.web", "Dockerfile.api", "compose.yaml"],
    "/home/victoire/projects": content.projects.map((project) => `${slugify(project.name)}.md`),
    "/home/victoire/stack": content.stacks.map((group) => `${slugify(group.title)}.txt`),
    "/home/victoire/contact": ["links.txt"],
    "/etc": ["victoire/"],
    "/etc/victoire": ["skills.conf", "sandbox.policy"],
    "/var": ["status/", "reports/"],
    "/var/status": ["opportunities.json"],
    "/var/reports": ["profile.json", "projects.csv", "stack.md"],
  };
}

export function listVirtualFiles(content: FileSystemContent) {
  return [
    ...Object.keys(buildVirtualFiles(content)),
    "/home/victoire/about.md",
    "/home/victoire/values.md",
    "/home/victoire/mission.env",
    "/home/victoire/roadmap.md",
    "/home/victoire/contact/links.txt",
    ...content.projects.map((project) => `/home/victoire/projects/${slugify(project.name)}.md`),
    ...content.stacks.map((group) => `/home/victoire/stack/${slugify(group.title)}.txt`),
  ];
}

export function readVirtualFile(pathname: string, content: FileSystemContent) {
  const typedFile = buildVirtualFiles(content)[pathname];
  if (typedFile) return typedFile.content;

  if (pathname === "/home/victoire/about.md") {
    return ["# Victoire SAWADOGO", content.heroLead, "", ...content.aboutParagraphs];
  }

  if (pathname === "/home/victoire/values.md") {
    return content.identityPillars.flatMap((pillar) => [`## ${pillar.title}`, pillar.text]);
  }

  if (pathname === "/home/victoire/mission.env") {
    return content.metrics.map(([label, value]) => `${label.toUpperCase().replace(/\s+/g, "_")}="${value}"`);
  }

  if (pathname === "/home/victoire/roadmap.md") return getRoadmap();

  if (pathname === "/home/victoire/contact/links.txt") {
    return [
      `email=${content.contactLinks.email}`,
      `github=${content.contactLinks.github}`,
      `linkedin=${content.contactLinks.linkedin}`,
      `whatsapp=${content.contactLinks.whatsapp}`,
    ];
  }

  const project = content.projects.find((item) => pathname === `/home/victoire/projects/${slugify(item.name)}.md`);
  if (project) {
    return [
      `# ${project.name}`,
      `type: ${project.type}`,
      `focus: ${project.focus}`,
      "",
      project.description,
      "",
      `tags: ${project.tags.join(", ")}`,
    ];
  }

  const stackGroup = content.stacks.find((group) => pathname === `/home/victoire/stack/${slugify(group.title)}.txt`);
  if (stackGroup) return stackGroup.items.map((item) => item.name);

  return null;
}

export function resolveVirtualPath(target: string, currentDirectory: string) {
  if (!target || target === ".") return currentDirectory;
  const parts = target.startsWith("/") ? target.split("/") : `${currentDirectory}/${target}`.split("/");
  const resolvedParts: string[] = [];

  parts.forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") {
      resolvedParts.pop();
      return;
    }
    resolvedParts.push(part);
  });

  return `/${resolvedParts.join("/")}` || "/";
}

export function runGrep(command: string, content: FileSystemContent, currentDirectory: string) {
  const parts = command.trim().split(/\s+/);
  const pattern = parts[1];
  const target = parts[2];
  if (!pattern) return ["usage: grep <mot> <fichier>"];
  const files = target ? [resolveVirtualPath(target, currentDirectory)] : listVirtualFiles(content);
  const matches = files.flatMap((file) => {
    const lines = readVirtualFile(file, content);
    if (!lines) return [];
    return lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.toLowerCase().includes(pattern.toLowerCase()))
      .map(({ line, index }) => `${file}:${index + 1}: ${line}`);
  });
  return matches.length ? matches : [`grep: aucun resultat pour '${pattern}'`];
}

export function runFind(command: string, content: FileSystemContent, currentDirectory: string) {
  const files = listVirtualFiles(content);
  const match = command.match(/-name\s+["']?([^"']+)["']?/);
  const pattern = match?.[1];
  const scopedFiles = files.filter((file) => file.startsWith(currentDirectory) || currentDirectory === "/home/victoire");
  if (!pattern) return scopedFiles.map((file) => file.replace(`${currentDirectory}/`, "./"));
  const regex = new RegExp(`^${pattern.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`);
  return scopedFiles
    .filter((file) => regex.test(file.split("/").pop() || ""))
    .map((file) => file.replace(`${currentDirectory}/`, "./"));
}
