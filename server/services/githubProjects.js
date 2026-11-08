import { config } from "../config.js";

let cachedProjects = [];
let cachedAt = 0;

export async function getGithubProjects({ force = false } = {}) {
  if (!config.githubUsername) {
    return [];
  }

  const now = Date.now();
  if (!force && cachedProjects.length && now - cachedAt < config.githubCacheTtlMs) {
    return cachedProjects;
  }

  try {
    const repos = await fetchGithubRepos();
    cachedProjects = repos
      .filter(isEligibleRepo)
      .sort(compareRepos)
      .map(mapRepoToProject);
    cachedAt = now;
    return cachedProjects;
  } catch (error) {
    console.warn("GitHub projects unavailable:", error.message);
    return cachedProjects;
  }
}

async function fetchGithubRepos() {
  const url = new URL(`https://api.github.com/users/${config.githubUsername}/repos`);
  url.searchParams.set("per_page", "100");
  url.searchParams.set("sort", "updated");
  url.searchParams.set("direction", "desc");

  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (config.githubToken) {
    headers.Authorization = `Bearer ${config.githubToken}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API responded ${response.status}`);
  }

  const repos = await response.json();
  return Array.isArray(repos) ? repos : [];
}

// Flagship repositories come first, the rest by most recent activity.
const featuredRepos = [
  "cocomarket",
  "sdm",
  "crypted_message",
  "baobab",
  "simplon-procurement-backend",
  "elegantfaso",
  "mdm_system",
  "le-grin",
  "devops-capstone-project",
  "customer-accounts-microservice",
];

function compareRepos(a, b) {
  const rankA = getFeaturedRank(a);
  const rankB = getFeaturedRank(b);
  if (rankA !== rankB) return rankA - rankB;
  return new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at);
}

function getFeaturedRank(repo) {
  const index = featuredRepos.indexOf(String(repo.name || "").toLowerCase());
  return index === -1 ? featuredRepos.length : index;
}

function isEligibleRepo(repo) {
  if (!repo || repo.private || repo.fork || repo.archived || repo.disabled) {
    return false;
  }

  if (repo.name === config.githubUsername) {
    return false;
  }

  if (config.githubExcludedRepos.includes(String(repo.name).toLowerCase())) {
    return false;
  }

  if (!config.githubProjectTopics.length) {
    return true;
  }

  const repoTopics = Array.isArray(repo.topics) ? repo.topics.map((topic) => topic.toLowerCase()) : [];
  return repoTopics.some((topic) => config.githubProjectTopics.includes(topic));
}

function mapRepoToProject(repo) {
  const language = repo.language || "Code";
  const topics = Array.isArray(repo.topics) ? repo.topics.slice(0, 6) : [];
  const caseStudy = getRepoCaseStudy(repo, language);
  const tags = ["GitHub", language, ...topics]
    .filter(Boolean)
    .filter((tag, index, all) => all.findIndex((item) => item.toLowerCase() === tag.toLowerCase()) === index)
    .slice(0, 8);
  const updatedAt = repo.pushed_at || repo.updated_at;
  const homepage = normalizeHomepage(repo.homepage);

  return {
    name: caseStudy.name,
    type: caseStudy.type,
    focus: caseStudy.focus,
    description: caseStudy.description,
    detail: buildProjectDetail(repo, language, updatedAt, caseStudy),
    logoUrl: "",
    projectUrl: homepage || repo.html_url,
    githubUrl: repo.html_url,
    githubRepo: repo.full_name,
    githubUpdatedAt: updatedAt,
    githubStars: repo.stargazers_count || 0,
    githubForks: repo.forks_count || 0,
    source: "github",
    apkUrl: "",
    apkName: "",
    screenshots: [],
    tags,
  };
}

function humanizeRepoName(name = "") {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim() || "Projet GitHub";
}

function normalizeHomepage(homepage) {
  if (!homepage || typeof homepage !== "string") {
    return "";
  }

  const value = homepage.trim();
  if (!value) {
    return "";
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function getRepoCaseStudy(repo, language) {
  const key = String(repo.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const knownProjects = {
    "sevenos": {
      name: "SevenOS",
      type: "Portfolio interactif, terminal, React",
      focus: "Portfolio interactif",
      description: "Mon portfolio sous forme de petit OS: navigation flottante, terminal, contenus éditables et parcours rapide pour recruteur.",
      role: "Front React, direction UI, logique d'édition et intégration des contenus.",
      problem: "Je voulais une interface personnelle sans perdre l'accès rapide aux preuves.",
      solution: "J'ai gardé un univers visuel fort, mais avec des accès directs vers projets, CV, certifications et contact.",
      decisions: "i18n, thème clair/sombre, terminal guidé, synchronisation GitHub et animations plus sobres.",
      next: "Ajouter plus de captures réelles et continuer à alléger le front.",
    },
    "cocomarket": {
      name: "CocoMarket",
      type: "Systèmes distribués, retail",
      focus: "Ventes résilientes hors ligne",
      description: "Remontée asynchrone des ventes de plusieurs caisses vers le siège, sans perte ni double comptage, même pendant une coupure réseau.",
      role: "Architecture, développement backend et exploitation.",
      problem: "Une caisse doit continuer à vendre quand le réseau tombe, et le siège ne doit jamais compter une vente deux fois.",
      solution: "Outbox SQLite locale, RabbitMQ avec publisher confirms, files quorum, retry et DLQ, consommateur idempotent côté siège.",
      decisions: "Livraison au moins une fois et idempotence, healthchecks, métriques Prometheus, X-Request-ID et simulation de coupure.",
      next: "Ajouter des tests de charge et un tableau de bord de supervision.",
    },
    "sdm": {
      name: "Simplon Device Manager",
      type: "Gestion de parc, systèmes",
      focus: "Cycle de vie des machines",
      description: "Plateforme pour savoir où se trouve chaque machine, qui l'utilise, si elle est conforme, et pouvoir la verrouiller, l'auditer ou l'effacer.",
      role: "Architecture, API, dashboard et agent système.",
      problem: "Recenser un parc ne suffit pas: il faut pouvoir agir sur chaque machine et garder une trace.",
      solution: "API NestJS avec Prisma, PostgreSQL, Redis/BullMQ et WebSocket, dashboard Next.js et agent Windows en Rust.",
      decisions: "Agent exécuté comme service système, session admin JWT et bootstrap protégé par secret.",
      next: "Étendre l'agent à Linux et ajouter des politiques de conformité.",
    },
    "crypted-message": {
      name: "Crypted Message",
      type: "Cryptographie, sécurité réseau",
      focus: "Messagerie face à un attaquant",
      description: "Messagerie entre deux machines avec un attaquant qui écoute ou modifie le trafic: RSA, courbes elliptiques et El-Gamal.",
      role: "Conception des scénarios et implémentation cryptographique.",
      problem: "Les garanties de la cryptographie restent abstraites tant qu'on ne voit pas un attaquant échouer.",
      solution: "Trois démonstrations entre Alice et Bob, avec Eve qui contrôle le relais réseau en mode passif ou actif.",
      decisions: "RSA-2048 OAEP et RSA-PSS, ECDH P-256 avec HKDF et AES-256-GCM, El-Gamal écrit à la main sur un groupe RFC 3526.",
      next: "Ajouter un scénario d'échange authentifié de clés.",
    },
    "mdm-system": {
      name: "Seven Control",
      type: "Administration de postes, C++",
      focus: "Parc apprenant",
      description: "Adaptation opérationnelle de Veyon pour inventorier, vérifier, verrouiller et administrer des postes apprenants.",
      role: "Adaptation de Veyon et outillage d'exploitation.",
      problem: "Administrer une salle de postes apprenants demande des outils simples pour le quotidien des formateurs.",
      solution: "Une couche Seven Control au-dessus du moteur Veyon, dont l'historique upstream est conservé.",
      decisions: "Garder Veyon intact pour suivre ses mises à jour et isoler les ajouts dans seven-control/.",
      next: "Documenter le déploiement et les scénarios de salle.",
    },
    "le-grin": {
      name: "Le Grin",
      type: "Plateforme, TypeScript",
      focus: "Apprentissage et mentorat",
      description: "Prototype full-stack autour de parcours d'apprentissage, de mentorat, d'espaces entreprise et membres.",
      role: "Cadrage produit, frontend et API.",
      problem: "Apprenants, mentors et entreprises se croisent rarement au même endroit.",
      solution: "Next.js et React côté interface, API Express avec Prisma et PostgreSQL.",
      decisions: "Espaces séparés par profil et authentification dédiée.",
      next: "Mettre une démo en ligne.",
    },
    "elegantfaso": {
      name: "ElegantStyle",
      type: "Mode, marketplace, mobile",
      focus: "Marketplace mode multi-rôles",
      description: "Application Flutter de mode: un compte unique et des espaces cohérents pour clients, créateurs, boutiques et administration.",
      role: "Conception produit et développement mobile.",
      problem: "Clients, créateurs et boutiques ont des besoins différents mais partagent le même catalogue.",
      solution: "Un Salon public et un espace métier par rôle, avec un Catalogue Express pour publier depuis des photos.",
      decisions: "Flutter et Firebase, architecture multi-rôles autour d'un compte unique.",
      next: "Publier une version de test.",
    },
    "baobab": {
      name: "MonBaobab",
      type: "Culture, e-commerce, communauté",
      focus: "Plateforme culturelle africaine",
      description: "Plateforme full-stack pour découvrir, valoriser et transmettre les cultures africaines: contenus, communautés, boutique et back-office.",
      role: "Architecture full-stack, API et back-office.",
      problem: "Les contenus culturels et les créateurs africains sont dispersés et peu visibles.",
      solution: "Frontend React et TypeScript, API Express et MongoDB, boutique avec paiement Stripe.",
      decisions: "JWT avec refresh token, double authentification TOTP et modération des communautés.",
      next: "Mettre une démo publique en ligne.",
    },
    "devops-capstone-project": {
      name: "DevOps Capstone",
      type: "CI/CD, conteneurs, OpenShift",
      focus: "Pipeline de livraison",
      description: "Service Flask livré par GitHub Actions et Tekton, puis déployé sur OpenShift.",
      role: "Pipeline CI/CD et manifestes de déploiement.",
      problem: "Livrer un service de façon répétable, testée et observable.",
      solution: "Lint et tests automatisés, image Docker, tâches Tekton et manifestes OpenShift.",
      decisions: "Endpoint /health pour les sondes et pipeline découpé en tâches réutilisables.",
      next: "Ajouter un déploiement progressif.",
    },
    "customer-accounts-microservice": {
      name: "Customer Accounts",
      type: "Microservice, API REST",
      focus: "Service testé en CI",
      description: "Microservice REST de gestion de comptes clients, testé automatiquement à chaque modification.",
      role: "API, tests et intégration continue.",
      problem: "Un microservice doit rester fiable à chaque changement.",
      solution: "API CRUD en Python, suite pytest et workflow GitHub Actions.",
      decisions: "Tests avant fonctionnalités et conteneurisation Docker.",
      next: "Ajouter une documentation OpenAPI.",
    },
    "final-project-emotion-detection": {
      name: "Emotion Detection",
      type: "IA, NLP, API",
      focus: "Analyse d'émotions",
      description: "Application web Flask qui détecte les émotions d'un texte avec le service Watson NLP et affiche l'émotion dominante.",
      role: "Intégration du modèle, application web et tests.",
      problem: "Rendre un modèle de NLP utilisable depuis une interface simple.",
      solution: "Package Python qui interroge Watson NLP, application Flask et gestion des réponses invalides.",
      decisions: "Gestion des entrées vides et tests unitaires.",
      next: "Comparer plusieurs modèles.",
    },
    "scripts-bash": {
      name: "Scripts Bash",
      type: "Automatisation, terminal, scripts",
      focus: "Automatisation",
      description: "Une collection de scripts pour éviter de retaper les mêmes commandes et garder un environnement plus propre.",
      role: "Écriture de scripts, simplification de commandes et documentation d'usage.",
      problem: "Certaines tâches techniques reviennent trop souvent pour rester manuelles.",
      solution: "J'ai regroupé des commandes utiles dans des scripts faciles à relancer.",
      decisions: "Bash pour rester proche du terminal et des environnements Linux.",
      next: "Ajouter une documentation par script et des exemples d'exécution.",
    },
    "simplondevices-management": {
      name: "Simplondevices Management",
      type: "Gestion IT, web, inventaire",
      focus: "Parc matériel",
      description: "Un outil de gestion pour suivre du matériel et rendre le support informatique plus simple à organiser.",
      role: "Analyse du besoin, structure de données et interface de suivi.",
      problem: "Le suivi du matériel devient vite fragile quand les statuts ne sont pas centralisés.",
      solution: "J'ai travaillé une base où inventaire, statuts et actions restent au même endroit.",
      decisions: "Construire d'abord le parcours de suivi avant d'ajouter des fonctionnalités avancées.",
      next: "Ajouter authentification par rôle, historique et export.",
    },
    "simplon-procurement-backend": {
      name: "Simplon Procurement",
      type: "Outil interne, workflow métier",
      focus: "Achats validés en 3 étapes",
      description: "Gestion des demandes d'achat avec validation multi-niveaux par rôle: employé, moyens généraux, comptabilité, direction.",
      role: "Conception API, logique métier et sécurité.",
      problem: "Un processus d'achat a besoin de traces claires: qui demande, où ça bloque, ce qui est validé.",
      solution: "API Django REST Framework et PostgreSQL, notifications Mailjet, pièces jointes Cloudinary et journal d'activité.",
      decisions: "JWT en cookies HttpOnly, workflow à 3 étapes et rôles séparés.",
      next: "Ajouter tests d'intégration et documentation OpenAPI.",
    },
  };

  const fallbackName = humanizeRepoName(repo.name);
  return knownProjects[key] || {
    name: fallbackName,
    type: `${language} project`,
    focus: repo.description ? "Projet public documenté" : "Code source public",
    description: repo.description
      ? `${repo.description} Le code est public et je peux expliquer les choix derrière le projet.`
      : `${fallbackName} est un projet public GitHub. J'y garde le code, la structure et les évolutions.`,
    role: "Développement et organisation du code.",
    problem: "Passer d'une idée ou d'un besoin technique à une base consultable.",
    solution: "Construire une première version propre, versionnée et facile à reprendre.",
    decisions: `Langage principal: ${language}.`,
    next: "Ajouter captures, contexte métier et résultats plus concrets.",
  };
}

function buildProjectDetail(repo, language, updatedAt, caseStudy) {
  const parts = [
    `Mon rôle: ${caseStudy.role}`,
    `Le point de départ: ${caseStudy.problem}`,
    `Ce que j'ai construit: ${caseStudy.solution}`,
    `Choix techniques: ${caseStudy.decisions}`,
    `Langage principal: ${language}.`,
  ];

  if (updatedAt) {
    parts.push(`Dernière mise à jour GitHub: ${new Date(updatedAt).toLocaleDateString("fr-FR")}.`);
  }

  if (repo.homepage) {
    parts.push("Une démo ou page publique est liée depuis le repository.");
  }

  parts.push(`À améliorer ensuite: ${caseStudy.next}`);

  return parts.join(" ");
}
