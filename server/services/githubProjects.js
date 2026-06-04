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
      .sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at))
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

function isEligibleRepo(repo) {
  if (!repo || repo.private || repo.fork || repo.archived || repo.disabled) {
    return false;
  }

  if (repo.name === config.githubUsername) {
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
    "mdm-system": {
      name: "MDM System",
      type: "Gestion, backend, tableau de bord",
      focus: "Suivi interne",
      description: "Un système de gestion pour regrouper des informations, suivre des statuts et éviter les vérifications dans plusieurs endroits.",
      role: "Structure des données, logique métier et interface de consultation.",
      problem: "Les suivis deviennent vite flous quand les informations vivent dans plusieurs fichiers ou messages.",
      solution: "J'ai posé une base de gestion plus centralisée, avec des statuts faciles à lire.",
      decisions: "Parcours simple, validations et données rangées avant les fonctionnalités secondaires.",
      next: "Ajouter des rôles, des exports et quelques indicateurs.",
    },
    "le-grin": {
      name: "Le Grin",
      type: "Plateforme locale, TypeScript",
      focus: "Service local",
      description: "Une base de plateforme locale autour de publications, échanges et services de proximité.",
      role: "Cadrage produit, interface et structure technique.",
      problem: "Les interactions locales existent déjà, mais elles sont souvent dispersées et peu visibles.",
      solution: "J'ai commencé par une base web lisible pour publier, découvrir et contacter plus simplement.",
      decisions: "TypeScript pour garder une base plus propre à mesure que le projet grandit.",
      next: "Clarifier les parcours et mettre une démo en ligne.",
    },
    "elegantfaso": {
      name: "Elegantfaso",
      type: "Mode, mobile, Dart",
      focus: "Mode mobile",
      description: "Un projet mobile autour du style: garder des idées de tenues, préparer un look et organiser les inspirations.",
      role: "Développement mobile et réflexion produit autour des usages mode.",
      problem: "Préparer un style devient vite dispersé entre images, idées, couleurs et contexte.",
      solution: "J'ai travaillé une base mobile pour regrouper les inspirations et rendre le choix plus simple.",
      decisions: "Dart pour avancer vers une expérience mobile stable.",
      next: "Ajouter des captures, des données de test et un parcours de recommandation.",
    },
    "baobab": {
      name: "BAOBAB",
      type: "Culture, web, plateforme",
      focus: "Culture locale",
      description: "Une piste de plateforme culturelle pour présenter des contenus, savoir-faire et créateurs locaux.",
      role: "Cadrage de l'expérience et construction d'une base web.",
      problem: "Les contenus culturels et les créateurs sont souvent visibles par petits morceaux, rarement au même endroit.",
      solution: "J'ai posé une structure web pour rassembler les informations sans créer un catalogue lourd.",
      decisions: "Structure simple, pensée pour évoluer vers contenus, profils et boutique.",
      next: "Clarifier les catégories, ajouter des visuels réels et une démo.",
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
      name: "Simplon Procurement Backend",
      type: "Backend, achats, API",
      focus: "Achats et statuts",
      description: "Un backend pour organiser des demandes, des statuts et des traitements liés aux achats.",
      role: "Conception API, logique métier et préparation des données.",
      problem: "Un processus d'achat a besoin de traces claires: qui demande, où ça bloque, ce qui est validé.",
      solution: "J'ai posé une API centrée sur les entités, les statuts et les opérations métier.",
      decisions: "Séparer les responsabilités pour faire évoluer le backend sans tout casser.",
      next: "Ajouter tests d'intégration, rôles et documentation OpenAPI.",
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
