import { buildVirtualFiles, type FileSystemContent } from "./filesystem";

type RuntimeContent = FileSystemContent & {
  labs: string[];
};

export function runPythonRuntime(target: string, content: RuntimeContent) {
  const script = target.replace(/^\.?\//, "");
  const file = buildVirtualFiles(content)[`/home/victoire/${script}`];
  if (script === "--version" || script === "-V") return ["Python 3.12.4 (Atelier sandbox)"];
  if (script === "repl") {
    return [
      "Python REPL Atelier",
      ">>> import victoire",
      "module victoire loaded",
      ">>> profile()",
      `{ name: "Victoire SAWADOGO", projects: ${content.projects.length}, stack_groups: ${content.stacks.length} }`,
      "Tip: passe en mode python pour taper profile(), audit(), docker().",
    ];
  }
  if (script === "-m venv .venv") {
    return ["created virtual environment: .venv", "activate: source .venv/bin/activate", "note: environnement simule dans Atelier"];
  }
  if (script === "-m pip list" || script === "-m pip freeze") return runPipCommand("list");
  if (file && file.kind !== "python") return [`python: '${target}' existe mais n'est pas un script Python (${file.kind})`];
  if (script === "scripts/portfolio_audit.py") {
    return [
      "python scripts/portfolio_audit.py",
      "loading SiteContent...",
      `projects=${content.projects.length} stack_groups=${content.stacks.length} labs=${content.labs.length}`,
      `contact.email=${content.contactLinks.email ? "ok" : "missing"}`,
      "score=94/100",
      "recommendation=connecter Docker, tests et backend content API dans une story technique claire",
    ];
  }
  if (script === "scripts/generate_report.py") {
    return [
      "python scripts/generate_report.py",
      "rendering report: /var/reports/victoire-profile.json",
      "{",
      `  "title": "${content.heroTitle}",`,
      `  "projects": ${content.projects.length},`,
      '  "runtime": ["python", "bash", "docker", "node", "mongodb"],',
      '  "status": "ready"',
      "}",
    ];
  }
  return [
    `python: can't open file '${target}': fichier virtuel introuvable`,
    "Scripts disponibles: scripts/portfolio_audit.py, scripts/generate_report.py",
  ];
}

export function runBashRuntime(target: string, content: RuntimeContent) {
  const script = target.replace(/^\.?\//, "");
  const file = buildVirtualFiles(content)[`/home/victoire/${script}`];
  if (script === "--version") return ["GNU bash, version 5.2.26(1)-release (Atelier sandbox)", "License GPLv3+: GNU GPL version 3 or later"];
  if (file && file.kind !== "bash") return [`bash: '${target}' existe mais n'est pas un script Bash (${file.kind})`];
  if (script.startsWith("explain ")) {
    const explainedPath = script.replace(/^explain\s+/, "");
    const explainedFile = buildVirtualFiles(content)[`/home/victoire/${explainedPath}`];
    if (!explainedFile) return [`bash explain: ${explainedPath} introuvable`];
    return [
      `bash explain ${explainedPath}`,
      `type: ${explainedFile.kind}`,
      `executable: ${explainedFile.executable ? "yes" : "no"}`,
      `role: ${explainedFile.description}`,
      "lecture:",
      ...explainedFile.content.slice(0, 7).map((line, index) => `${String(index + 1).padStart(2, " ")}  ${line}`),
    ];
  }
  if (script === "scripts/deploy.sh") {
    return [
      "$ bash scripts/deploy.sh",
      "set -euo pipefail",
      "npm ci........................ skipped in sandbox",
      "npm run build.................. ok",
      "docker compose build........... ok",
      "docker compose up -d........... ok",
      `healthcheck profile............ ${content.profileCaption}`,
      "deploy simulated: Atelier services are green",
    ];
  }
  if (script === "scripts/healthcheck.sh") {
    return [
      "$ bash scripts/healthcheck.sh",
      "checking frontend.............. 200 OK",
      "checking api................... 200 OK",
      "checking mongo................. reachable",
      "checking shell sandbox......... isolated",
      "checking content freshness...... dynamic",
    ];
  }
  if (script === "scripts/seed-demo.sh") return ["$ bash scripts/seed-demo.sh", "seed admin user................ ready", "seed projects.................. ready", "seed portfolio content......... ready"];
  return [`bash: ${target}: aucun script virtuel executable`, "Scripts disponibles: scripts/deploy.sh, scripts/healthcheck.sh, scripts/seed-demo.sh"];
}

export function runDockerCommand(target: string, content: RuntimeContent) {
  if (target === "--version" || target === "version") return ["Docker version 27.3.1, build victoireos", "Docker Compose version v2.29.7", "Runtime: simulated containers inside Atelier sandbox"];
  if (!target || target === "--help") return ["Docker sandbox Atelier", "docker ps | docker images | docker compose up | docker compose build", "docker logs victoire-api | docker inspect victoire-web"];
  if (target === "ps") return ["CONTAINER ID   IMAGE                 STATUS          PORTS      NAMES", "vct-web-01     victoireos-web:3.0    Up 12 min       5173/tcp   victoire-web", "vct-api-01     victoireos-api:3.0    Up 12 min       4000/tcp   victoire-api", "vct-db-01      mongo:7               Up 12 min       27017/tcp  victoire-mongo"];
  if (target === "images") return ["REPOSITORY          TAG       SIZE", "victoireos-web      3.0       148MB", "victoireos-api      3.0       96MB", "mongo               7         756MB"];
  if (target === "compose up" || target === "compose up -d") return ["docker compose up -d", "Network victoireos_default    Created", "Container victoire-mongo       Started", "Container victoire-api         Started", "Container victoire-web         Started", `Profile mounted: ${content.projects.length} projects indexed`];
  if (target === "compose ps") return ["NAME              SERVICE   STATUS    PORTS", "victoire-web      web       running   0.0.0.0:5173->80/tcp", "victoire-api      api       running   0.0.0.0:4000->4000/tcp", "victoire-mongo    mongo     running   27017/tcp"];
  if (target === "compose build" || target === "build .") return ["building victoireos-web...", "building victoireos-api...", "cache: vite assets, node_modules, content schema", "build complete: 2 images tagged"];
  if (target === "compose down") return ["Container victoire-web         Stopped", "Container victoire-api         Stopped", "Container victoire-mongo       Stopped", "Network victoireos_default    Removed"];
  if (target.startsWith("logs")) {
    const service = target.replace(/^logs\s*/, "") || "victoire-api";
    return [`${service} | boot content-api bridge`, `${service} | GET /api/content 200`, `${service} | shell module memoryd ready`, `${service} | healthcheck ok`];
  }
  if (target.startsWith("inspect")) {
    const service = target.replace(/^inspect\s*/, "") || "victoire-web";
    return ["{", `  "Name": "${service}",`, '  "State": "running",', '  "Labels": ["portfolio", "interactive-shell", "sandbox"],', '  "Health": "healthy"', "}"];
  }
  return [`docker: commande '${target}' simulee non reconnue. Essaie docker ps ou docker compose up.`];
}

export function runNodeRuntime(target: string, content: RuntimeContent) {
  const script = target.replace(/^\.?\//, "");
  const file = buildVirtualFiles(content)[`/home/victoire/${script}`];
  if (script === "--version" || script === "-v") return ["v22.11.0 (Atelier sandbox)"];
  if (file && file.kind !== "javascript") return [`node: '${target}' existe mais n'est pas un script Node.js (${file.kind})`];
  if (script === "scripts/report.js") {
    return [
      "node scripts/report.js",
      "const profile = require('@victoire/profile')",
      "{",
      `  name: "Victoire SAWADOGO",`,
      `  projects: ${content.projects.length},`,
      `  stack: "${content.stacks.map((group) => group.title).join(" / ")}",`,
      '  runtime: "node + react + express"',
      "}",
    ];
  }
  if (script === "scripts/api-check.js") return ["node scripts/api-check.js", "GET /api/content........ 200", "GET /api/auth/me........ 401 expected without token", "GET /cv-manifest.json... 200", "api contract............ stable"];
  if (script === "-e \"console.log('hello')\"" || script === "-e 'console.log(\"hello\")'") return ["hello"];
  return [`node: cannot find module '${target}' in Atelier sandbox`, "Scripts disponibles: scripts/report.js"];
}

export function runGitCommand(target: string) {
  if (!target || target === "status") return ["On branch main", "Changes not staged for commit:", "  modified: src/App.tsx", "  modified: src/styles.css", "nothing committed in sandbox"];
  if (target === "log --oneline" || target === "log") return ["a11y7c2 improve Atelier layer", "9f2d1ac wire content API and CV admin", "43bd88e build immersive portfolio shell"];
  if (target === "branch") return ["* main", "  feature/victoireos-runtimes", "  lab/backend-sandbox"];
  if (target === "diff") return ["diff -- Atelier", "+ memoryd, missiond, autopilotd", "+ python/bash/docker virtual runtimes"];
  return [`git: '${target}' disponible en mode demo: status, diff, log --oneline`];
}

export function runNpmCommand(target: string) {
  if (target === "run build") return ["> portfolio-tech-africain@0.1.0 build", "> tsc -b && vite build", "vite build complete", "assets optimized, shell modules bundled"];
  if (target === "run dev") return ["> vite --host 0.0.0.0", "Local: http://localhost:5173/", "Atelier dev server simulated"];
  if (target === "test") return ["> vitest run", "unit tests configured for VictoireOS pure modules", "next: extend coverage to shell command resolvers"];
  return ["npm scripts: npm run dev | npm run build | npm test"];
}

export function runPipCommand(target: string) {
  if (!target || target === "list" || target === "freeze") return ["Package              Version", "fastapi              0.115.0", "pydantic             2.9.0", "rich                 13.8.0", "python-dotenv        1.0.1", "victoireos-sdk       3.0.0"];
  if (target.startsWith("install ")) return [`Collecting ${target.replace("install ", "")}`, "Installing collected packages in sandbox", "Successfully installed virtual package"];
  return ["pip usage: pip list | pip install <package>"];
}

export function runWhich(target: string) {
  const binaries: Record<string, string> = {
    python: "/usr/bin/python",
    python3: "/usr/bin/python3",
    bash: "/usr/bin/bash",
    sh: "/usr/bin/sh",
    docker: "/usr/bin/docker",
    git: "/usr/bin/git",
    npm: "/usr/bin/npm",
    node: "/usr/bin/node",
  };
  if (!target) return ["usage: which <binary>"];
  return [binaries[target] || `which: no ${target} in (/usr/bin:/usr/local/bin:/home/victoire/scripts)`];
}

export function runChmod(target: string) {
  if (!target) return ["usage: chmod +x <script>"];
  return [`chmod: permissions updated in sandbox for ${target}`];
}
