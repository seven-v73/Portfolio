export function getManualPage(topic: string) {
  const pages: Record<string, string[]> = {
    help: ["NAME", "  help - affiche les commandes principales de Atelier", "EXAMPLE", "  help"],
    man: ["NAME", "  man - affiche une mini documentation", "EXAMPLE", "  man learn"],
    learn: ["NAME", "  learn - explique un sujet technique simplement", "EXAMPLE", "  learn git"],
    lesson: ["NAME", "  lesson - mini cours structure avec commandes utiles", "EXAMPLE", "  lesson git"],
    grep: ["NAME", "  grep - cherche un mot dans les fichiers virtuels", "EXAMPLE", "  grep api about.md"],
    find: ["NAME", "  find - liste les fichiers du portfolio virtuel", "EXAMPLE", "  find . -name \"*.md\""],
    alias: ["NAME", "  alias - cree ou liste des raccourcis", "EXAMPLE", "  alias moi='whoami'"],
    reboot: ["NAME", "  reboot - redemarre l'interface Atelier sans effacer la memoire", "EXAMPLE", "  reboot"],
    commands: ["NAME", "  commands - affiche ou remet a zero le compteur de commandes", "EXAMPLE", "  commands clear"],
    deploy: ["NAME", "  deploy - simule un deploiement narratif", "EXAMPLE", "  deploy portfolio"],
    sudo: ["NAME", "  sudo - commande immersive a privileges symboliques", "EXAMPLE", "  sudo hire victoire"],
    ssh: ["NAME", "  ssh - connexion symbolique vers une section", "EXAMPLE", "  ssh contact"],
    docker: ["NAME", "  docker - simule le runtime containerise de Atelier", "EXAMPLE", "  docker compose up"],
    python: ["NAME", "  python - lance un interpreteur ou un script virtuel", "EXAMPLE", "  python scripts/portfolio_audit.py"],
    bash: ["NAME", "  bash - lance un script shell virtuel", "EXAMPLE", "  bash scripts/deploy.sh"],
    node: ["NAME", "  node - lance un runtime JavaScript virtuel", "EXAMPLE", "  node scripts/report.js"],
    shellctl: ["NAME", "  shellctl - inspecte l'architecture interne de Atelier", "EXAMPLE", "  shellctl inspect"],
  };
  return pages[topic] || [`Aucune page man pour '${topic}'. Essaie: man learn, man grep, man deploy.`];
}

export function getLearningNotes(topic: string) {
  const lessons: Record<string, string[]> = {
    shell: [
      "Le shell est une conversation precise avec la machine.",
      "Un bon terminal reduit la friction: observer, filtrer, automatiser, repeter.",
      "Commandes utiles ici: ls, cat, grep, find, history, alias.",
    ],
    git: [
      "Git sert a garder une memoire propre du projet.",
      "Routine: git status -> git diff -> git add -> git commit.",
      "Mentalite: petits commits, messages clairs, branche par intention.",
    ],
    docker: [
      "Docker emballe une app avec son environnement.",
      "Utile pour eviter le syndrome 'ca marche chez moi'.",
      "Base: Dockerfile, image, container, volume, compose.",
      "Commandes Atelier: docker ps, docker images, docker compose up, docker logs victoire-api.",
    ],
    bash: [
      "Bash sert a automatiser les routines repetitives.",
      "Ici, les scripts virtuels vivent dans /home/victoire/scripts.",
      "Essaie: bash scripts/deploy.sh ou cat scripts/healthcheck.sh.",
    ],
    python: [
      "Python est utile pour auditer, transformer et raconter les donnees.",
      "Ici, il expose un module virtuel victoire: profile(), projects(), stack().",
      "Essaie: python scripts/portfolio_audit.py ou passe en mode python puis audit().",
    ],
    api: [
      "Une API est un contrat entre interface, serveur et donnees.",
      "Une bonne API a des routes lisibles, des erreurs claires et des donnees previsibles.",
      "Reflexe: verifier auth, validation, status codes, logs.",
    ],
    react: [
      "React aide a decomposer une interface en composants.",
      "La vraie valeur vient de l'etat bien place et des composants lisibles.",
      "Principe: data down, actions up, UI predictable.",
    ],
    linux: [
      "Linux apprend a penser en fichiers, processus et permissions.",
      "Commandes fondatrices: pwd, ls, cd, cat, grep, find, chmod, ps.",
      "La maitrise vient de l'habitude de lire les messages d'erreur.",
    ],
  };
  return lessons[topic] || [`Sujet '${topic}' en cours de documentation. Essaie: learn git, learn docker, learn api.`];
}

export function getLesson(topic: string) {
  if (topic === "git") {
    return [
      "Mini lesson: Git en 5 gestes",
      "1. git status        # observer",
      "2. git diff          # comprendre",
      "3. git add <file>    # selectionner",
      "4. git commit -m     # raconter",
      "5. git log --oneline # relire l'histoire",
    ];
  }
  return [`Aucune lecon structuree pour '${topic}'. Essaie: lesson git.`];
}

export function getRoadmap() {
  return [
    "Roadmap d'apprentissage",
    "[now] Renforcer React, TypeScript, API Node et design d'interfaces utiles.",
    "[next] Approfondir Docker, tests, CI/CD et architecture backend.",
    "[lab] Explorer IA appliquee, recommandation, vision produit et experiences culturelles.",
    "[share] Transformer chaque apprentissage en mini explication claire dans ce shell.",
  ];
}

export function getDebugMindset(target: string) {
  return [
    `Debug mindset${target ? `: ${target}` : ""}`,
    "1. Reproduire le bug calmement.",
    "2. Lire l'erreur avant de changer le code.",
    "3. Isoler: entree, etat, sortie.",
    "4. Verifier avec un test ou une commande simple.",
    "5. Documenter la cause pour ne pas refaire la meme chasse.",
  ];
}

export function getProcessList() {
  return [
    "PID   TTY      TIME     CMD",
    "101   pts/0    00:01    curiosityd --watch",
    "204   pts/0    00:03    product-sense --human-first",
    "312   pts/1    00:02    api-builder --clean-contracts",
    "404   pts/2    00:00    bug-hunter --calm",
    "512   pts/3    00:04    knowledge-share --teach",
  ];
}

export function getTopSnapshot() {
  return [
    "Atelier top - live learning monitor",
    "Tasks: 5 running, 0 sleeping, 0 blocked",
    "%CPU  %MEM  COMMAND",
    "34.0  18.0  building-products",
    "26.0  15.0  learning-by-doing",
    "18.0  12.0  debugging",
    "12.0  10.0  documenting",
    "10.0   8.0  mentoring",
  ];
}

export function getQuiz(topic: string) {
  if (topic === "git") {
    return [
      "Quiz Git",
      "Q1: Quelle commande permet de voir les fichiers modifies ?",
      "A: git status",
      "Q2: Quelle commande montre les differences avant commit ?",
      "A: git diff",
      "Q3: Bonne pratique: gros commits rares ou petits commits lisibles ?",
      "A: petits commits lisibles",
    ];
  }
  return [`Quiz '${topic}' pas encore installe. Essaie: quiz git.`];
}

export function getChallenge(topic: string) {
  if (topic === "shell") {
    return [
      "Challenge shell: explorer Atelier sans souris",
      "1. cat README.md",
      "2. find . -name \"*.md\"",
      "3. grep api about.md",
      "4. cd projects && ls",
      "5. cat elegantstyle.md",
    ];
  }
  return [`Challenge '${topic}' pas encore disponible. Essaie: challenge shell.`];
}

export function getMessageOfTheDay() {
  return [
    "Message of the day",
    "Construire n'est pas seulement ecrire du code.",
    "C'est comprendre un besoin, choisir une direction, livrer, apprendre, puis transmettre.",
  ];
}

export function getOpenSourceSignal() {
  return [
    "Open-source mindset",
    "README clair, scripts reproductibles, issues lisibles, commits comprehensibles.",
    "Objectif: permettre a quelqu'un d'autre de comprendre le projet sans deviner.",
  ];
}
