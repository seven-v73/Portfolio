import { lazy, Suspense, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Code2,
  Cpu,
  Download,
  Eye,
  FileText,
  Globe2,
  GraduationCap,
  Github,
  Layers3,
  Linkedin,
  LockKeyhole,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  Network,
  Search,
  ServerCog,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import {
  clearAdminDraft,
  formatDateTime,
  getContentSnapshot,
  readAdminDraft,
  stripRuntimeFields,
  writeAdminDraft,
} from "./utils/adminDraft";
import SystemsGlobe from "./SystemsGlobe";
import type { CvContentLoader } from "./CvBuilder";
import { getArchitecture, getNodeName } from "./data/architectures";
import { systemLayers } from "./data/layers";
import { cloneItem, moveItem } from "./utils/collections";
import { filterProjects, getProjectTags } from "./utils/projectFilters";
import { resolveShellCommand, type ShellContext } from "./victoire-os/shell/commands";
import { expandAlias } from "./victoire-os/shell/core";
import { getCoachAdvice } from "./victoire-os/shell/insights";
import { loadVictoireMemory, saveVictoireMemory } from "./victoire-os/shell/memory";
import { updateMemoryAfterCommand } from "./victoire-os/shell/missions";
import {
  completeCommand,
  defaultAliases,
  getPaletteItems,
} from "./victoire-os/shell/suggestions";
import type { ShellMode, VictoireMemory } from "./victoire-os/types";
import { enLocale } from "./i18n/en";
import { frLocale } from "./i18n/fr";
import type { IdentityPillar, Language, ProjectItem, SiteContent, StackGroup, TimelineItem, UiCopy } from "./i18n/types";
import {
  certificationDomains,
  formatIssuedDate,
  getCertificationStats,
  getCredentialUrl,
  getProofUrl,
  type Certification,
} from "./data/certifications";

const locales = {
  fr: frLocale,
  en: enLocale,
} satisfies Record<Language, typeof frLocale>;

const CvBuilder = lazy(() => import("./CvBuilder"));
const isE2E = import.meta.env.VITE_E2E === "true";
const appleEase = [0.25, 0.1, 0.25, 1] as const;

type Theme = "light" | "dark";

const navItemIds = ["profil", "projets", "stack", "certifications", "parcours", "labo", "cv", "contact"] as const;
const navSectionIds = ["top", "systeme", ...navItemIds] as const;

const stacks = [
  {
    title: "Frontend",
    icon: Layers3,
    items: [
      {
        name: "HTML",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
      },
      {
        name: "CSS",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
      },
      {
        name: "React",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
      },
      {
        name: "Next.js",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
      },
      {
        name: "TypeScript",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
      },
      {
        name: "Tailwind",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
      },
      {
        name: "Framer Motion",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/framermotion/framermotion-original.svg",
      },
    ],
  },
  {
    title: "Mobile",
    icon: Smartphone,
    items: [
      {
        name: "Flutter",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg",
      },
      {
        name: "Firebase",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg",
      },
      {
        name: "Dart",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dart/dart-original.svg",
      },
      {
        name: "Android",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/android/android-original.svg",
      },
    ],
  },
  {
    title: "Backend",
    icon: ServerCog,
    items: [
      {
        name: "Node.js",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
      },
      {
        name: "Express",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg",
      },
      {
        name: "Laravel",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg",
      },
      {
        name: "Python",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
      },
      {
        name: "MongoDB",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg",
      },
      {
        name: "MySQL",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg",
      },
    ],
  },
  {
    title: "DevOps & IT",
    icon: Cpu,
    items: [
      {
        name: "Docker",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
      },
      {
        name: "Linux",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg",
      },
      {
        name: "Bash",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bash/bash-original.svg",
      },
      {
        name: "PowerShell",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/powershell/powershell-original.svg",
      },
      {
        name: "Java",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg",
      },
      {
        name: "Git",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg",
      },
    ],
  },
];

const projects: ProjectItem[] = [
  {
    name: "ElegantStyle",
    type: "Mode, mobile, recommandation",
    focus: "Stylisme virtuel",
    description:
      "Application mobile pour explorer des tenues, préparer un style et valoriser des inspirations vestimentaires africaines.",
    detail:
      "Rôle: conception produit et développement mobile. Travail clé: transformer un besoin très visuel en parcours simple, avec fiches tenues, inspirations et logique de recommandation. Valeur: aider l'utilisateur à préparer un look plus vite tout en donnant de la place aux références locales.",
    tags: ["Flutter", "Mode", "Mobile", "Produit"],
  },
  {
    name: "BAOBAB / MonBaobab",
    type: "Culture, e-commerce, communauté",
    focus: "Patrimoine digital",
    description:
      "Espace web pensé pour réunir contenus, boutiques, créateurs et communautés autour de la culture et des savoir-faire locaux.",
    detail:
      "Rôle: cadrage de la plateforme, architecture web et logique de contenu. Travail clé: organiser culture, boutique et communauté dans une expérience lisible. Valeur: rendre les créateurs, produits et savoir-faire plus découvrables depuis une interface unique.",
    tags: ["React", "Node.js", "MongoDB", "Culture"],
  },
  {
    name: "BurkinaLoc",
    type: "Produit digital local",
    focus: "Service de proximité",
    description:
      "Service local pour rendre la recherche, la publication et la gestion d'offres plus simples au quotidien.",
    detail:
      "Rôle: prototype produit et expérience utilisateur. Travail clé: clarifier les étapes de publication, de recherche et de contact pour un usage local. Valeur: réduire la friction entre une personne qui cherche un service et une personne qui publie une offre.",
    tags: ["Produit", "UX", "Web"],
  },
  {
    name: "Suivi de cotisations",
    type: "Gestion, automatisation, clarté",
    focus: "Gestion communautaire",
    description:
      "Outil de suivi pour savoir qui a cotisé, ce qui reste à faire et quelles informations doivent être partagées.",
    detail:
      "Rôle: conception de l'outil, modélisation des données et parcours dashboard. Travail clé: rendre l'état des paiements vérifiable rapidement. Valeur: éviter les oublis, les doubles vérifications manuelles et les messages dispersés.",
    tags: ["Gestion", "Backend", "Dashboard"],
  },
];

const labs = [
  "Essayage et préparation de looks pour la mode africaine",
  "Recommandations de style selon l'usage, la morphologie et le contexte",
  "Espaces de vente pour artisans, créateurs et marques locales",
  "Outils simples pour la gestion, la santé, la finance et les services de proximité",
];

const metrics = [
  ["Ce que je livre", "Web, API, mobile"],
  ["Ma méthode", "Ecouter, prototyper, tester"],
  ["Mon angle", "Produits utiles, contexte local"],
];

const techMarquee = [
  "Flutter",
  "React",
  "TypeScript",
  "Node.js",
  "MongoDB",
  "Docker",
  "Bash",
  "PowerShell",
  "Laravel",
  "Java",
  "Firebase",
  "Automatisation",
];

const maxProjects = 20;
const maxStackGroups = 8;
const maxStackItems = 12;

const projectTemplates: Record<string, ProjectItem> = {
  web: {
    name: "Nouveau projet web",
    type: "Application web",
    focus: "Interface et API",
    description: "Présente le besoin, la solution livrée et ce que l'utilisateur peut faire.",
    detail: "Ajoute ici le contexte, les choix techniques, les écrans importants et les prochaines évolutions.",
    logoUrl: "",
    projectUrl: "",
    githubUrl: "",
    apkUrl: "",
    apkName: "",
    screenshots: [],
    tags: ["React", "Node.js", "Web"],
  },
  mobile: {
    name: "Nouvelle application mobile",
    type: "Application mobile",
    focus: "Usage terrain",
    description: "Explique le problème mobile traité, le public visé et le parcours principal.",
    detail: "Ajoute ici les fonctionnalités clés, les choix Flutter/Android et les tests réalisés.",
    logoUrl: "",
    projectUrl: "",
    githubUrl: "",
    apkUrl: "",
    apkName: "",
    screenshots: [],
    tags: ["Flutter", "Mobile", "APK"],
  },
  gestion: {
    name: "Nouvel outil de gestion",
    type: "Gestion et automatisation",
    focus: "Suivi opérationnel",
    description: "Décris ce qui est suivi, qui l'utilise et comment l'outil fait gagner du temps.",
    detail: "Ajoute ici les rôles, les données gérées, les tableaux de bord et les règles métier.",
    logoUrl: "",
    projectUrl: "",
    githubUrl: "",
    apkUrl: "",
    apkName: "",
    screenshots: [],
    tags: ["Gestion", "Dashboard", "Backend"],
  },
};

const stackGroupTemplates = {
  frontend: {
    title: "Frontend",
    items: [
      {
        name: "React",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
      },
      {
        name: "TypeScript",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
      },
    ],
  },
  mobile: {
    title: "Mobile",
    items: [
      {
        name: "Flutter",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg",
      },
      {
        name: "Firebase",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg",
      },
    ],
  },
  backend: {
    title: "Backend",
    items: [
      {
        name: "Node.js",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
      },
      {
        name: "MongoDB",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg",
      },
      {
        name: "Python",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
      },
    ],
  },
  devops: {
    title: "DevOps & IT",
    items: [
      {
        name: "Docker",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
      },
      {
        name: "Linux",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg",
      },
      {
        name: "Bash",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bash/bash-original.svg",
      },
      {
        name: "PowerShell",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/powershell/powershell-original.svg",
      },
    ],
  },
};

const identityPillars = [
  {
    title: "Je pars du besoin réel",
    text: "Avant l'interface, je clarifie l'usage: qui va l'utiliser, pourquoi, et ce qui doit devenir plus simple.",
  },
  {
    title: "Je construis pour maintenir",
    text: "J'aime les interfaces lisibles, les API compréhensibles, les logs utiles et les choix techniques que l'on peut reprendre plus tard.",
  },
  {
    title: "Je garde le terrain en tête",
    text: "Support IT, mobile, backend et accompagnement m'aident à construire avec les contraintes réelles des utilisateurs.",
  },
];

const workflowCommands = [
  ["01", "écouter", "comprendre le besoin avant de coder"],
  ["02", "maquetter", "poser une interface claire et rapide à scanner"],
  ["03", "développer", "livrer frontend, API, mobile ou automatisation"],
  ["04", "améliorer", "tester, documenter, intégrer les retours"],
];

const professionalTimeline = [
  {
    period: "Parcours actuel",
    title: "Développeur Fullstack & Mobile",
    detail:
      "Conception d'applications web et mobiles avec React, Flutter, Node.js, MongoDB, Docker, Laravel et Java.",
  },
  {
    period: "Simplon CI",
    title: "Support IT, maintenance et accompagnement technique",
    detail:
      "Support, maintenance, développement et accompagnement autour d'outils utilisés par de vraies équipes.",
  },
  {
    period: "Produits en construction",
    title: "Produits numériques utiles au terrain",
    detail:
      "Construction de projets comme ElegantStyle, BAOBAB / MonBaobab, BurkinaLoc et des outils de gestion communautaire.",
  },
];

const academicTimeline = [
  {
    period: "Formation & pratique",
    title: "Développement fullstack, mobile et produit numérique",
    detail:
      "Renforcement continu sur le web, le mobile, le backend, le déploiement et la qualité produit.",
  },
  {
    period: "Culture technique",
    title: "Veille, projets personnels et apprentissage par la pratique",
    detail:
      "Prototypes, lectures, tests d'outils et documentation personnelle pour progresser sans perdre le lien avec l'usage.",
  },
];

type CvInfo = {
  url: string;
  type: "pdf" | "image";
  originalName?: string;
  mimeType?: string;
  uploadedAt?: string;
};

type ProfilePhotoInfo = {
  url: string;
  originalName?: string;
  mimeType?: string;
  uploadedAt?: string;
};

const defaultContent: SiteContent = frLocale.content;

const stackIcons = {
  Frontend: Layers3,
  Mobile: Smartphone,
  "Backend": ServerCog,
  "DevOps & IT": Cpu,
  Langages: Code2,
  Languages: Code2,
  "Web & Mobile": Layers3,
  "Données & messagerie": ServerCog,
  "Data & messaging": ServerCog,
  "Cloud, DevOps & systèmes": Cpu,
  "Cloud, DevOps & systems": Cpu,
};

function App() {
  const isLoginRoute = window.location.pathname === "/login";
  const isCvBuilderRoute = window.location.pathname === "/cv-builder";
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());
  const locale = locales[language];
  const [content, setContent] = useState<SiteContent>(locale.content);
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    localStorage.setItem("portfolio_language", language);
    document.documentElement.lang = language;
    const url = new URL(window.location.href);
    if (language === "en") {
      url.searchParams.set("lang", "en");
    } else {
      url.searchParams.delete("lang");
    }
    window.history.replaceState(window.history.state, "", url);
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
    try {
      localStorage.setItem("portfolio_theme", theme);
    } catch {
      // Private browsing: the theme simply is not remembered.
    }
  }, [theme]);

  useEffect(() => {
    if (!isE2E) return;
    document.documentElement.dataset.e2e = "true";
  }, []);

  useEffect(() => {
    if (isLoginRoute || isCvBuilderRoute) return;

    let isMounted = true;

    async function loadPublicContent() {
      let nextContent = locale.content;

      try {
        const contentResponse = await fetch(contentUrl(language));
        if (contentResponse.ok) {
          const data = await readJsonResponse(contentResponse);
          if (data.content) {
            nextContent = mergeContent(data.content, locale.content);
          }
        }
      } catch {
        nextContent = locale.content;
      }

      try {
        const projectsResponse = await fetch("/api/projects");
        if (projectsResponse.ok) {
          const data = await readJsonResponse(projectsResponse);
          if (Array.isArray(data.projects) && data.projects.length) {
            const apiProjects = data.projects.map(normalizePublicProject);
            const nextProjects = mergePublicProjects(nextContent.projects, apiProjects, language);
            nextContent = {
              ...nextContent,
              projects: nextProjects,
            };
          }
        }
      } catch {
        // Static preview or offline API: keep the content fallback.
      }

      if (isMounted) {
        setContent(nextContent);
      }
    }

    loadPublicContent();
    return () => {
      isMounted = false;
    };
  }, [isCvBuilderRoute, isLoginRoute, language, locale.content]);

  if (isCvBuilderRoute) {
    return (
      <Suspense fallback={null}>
        <CvBuilder initialLanguage={language} loadContent={loadCvContent} />
      </Suspense>
    );
  }

  return isLoginRoute ? (
    <LoginPage />
  ) : (
    <MotionConfig reducedMotion="user">
      <div className="site">
        <a className="skip-link" href="#profil">
          {locale.ui.skipLink}
        </a>
        <Header
          language={language}
          theme={theme}
          ui={locale.ui}
          onToggleLanguage={() => setLanguage(language === "fr" ? "en" : "fr")}
          onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
        />
        <main>
          <Hero content={content} ui={locale.ui} theme={theme} />
          <SystemLayers ui={locale.ui} language={language} />
          <About content={content} ui={locale.ui} />
          <Projects content={content} ui={locale.ui} language={language} />
          <Stack content={content} ui={locale.ui} />
          <CertificationsSection ui={locale.ui} language={language} />
          <Journey content={content} ui={locale.ui} />
          <Lab content={content} ui={locale.ui} />
          <CvSection ui={locale.ui} />
          <Contact content={content} ui={locale.ui} />
        </main>
        <Footer ui={locale.ui} />
      </div>
    </MotionConfig>
  );
}

function contentUrl(language: Language) {
  return language === "en" ? "/api/content?lang=en" : "/api/content";
}

// The resume builder reads the published content, or the admin's unpublished draft when asked to.
const loadCvContent: CvContentLoader = async (language, useDraft) => {
  const baseContent = locales[language].content;
  if (useDraft) {
    const draft = readAdminDraft<SiteContent>(language);
    if (draft) {
      return { content: mergeContent(draft.content, baseContent), fromDraft: true };
    }
  }

  try {
    const response = await fetch(contentUrl(language));
    if (response.ok) {
      const data = await readJsonResponse(response);
      if (data.content) {
        return { content: mergeContent(data.content, baseContent), fromDraft: false };
      }
    }
  } catch {
    // Offline or static preview: the default content still makes a complete resume.
  }

  return { content: baseContent, fromDraft: false };
};

function getInitialTheme(): Theme {
  try {
    const storedTheme = localStorage.getItem("portfolio_theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
  } catch {
    // Storage unavailable: fall back to the light theme.
  }

  return "light";
}

function getInitialLanguage(): Language {
  const urlLanguage = new URLSearchParams(window.location.search).get("lang");
  if (urlLanguage === "fr" || urlLanguage === "en") {
    return urlLanguage;
  }

  const storedLanguage = localStorage.getItem("portfolio_language");
  if (storedLanguage === "fr" || storedLanguage === "en") {
    return storedLanguage;
  }

  return "fr";
}

function mergeContent(content: Partial<SiteContent>, baseContent = defaultContent): SiteContent {
  const refreshedContent = refreshLegacyCopy(content, baseContent);
  const professionalTimeline = sanitizeProfessionalTimeline(isLegacyTimeline(refreshedContent.professionalTimeline, [
    "Développeur Fullstack & Mobile",
    "Support IT, maintenance et accompagnement technique",
    "Produits numériques utiles au terrain",
  ])
    ? baseContent.professionalTimeline
    : refreshedContent.professionalTimeline);
  const academicTimeline = isLegacyTimeline(refreshedContent.academicTimeline, [
    "Développement fullstack, mobile et produit numérique",
    "Veille, projets personnels et apprentissage par la pratique",
  ])
    ? baseContent.academicTimeline
    : refreshedContent.academicTimeline;

  return {
    ...baseContent,
    ...refreshedContent,
    professionalTimeline: professionalTimeline || baseContent.professionalTimeline,
    academicTimeline: academicTimeline || baseContent.academicTimeline,
    stacks: withLocalLogos(withRequiredStackItems(refreshedContent.stacks || baseContent.stacks, baseContent.stacks), baseContent.stacks),
    contactLinks: normalizeContactLinks(refreshedContent.contactLinks, baseContent.contactLinks),
    cv: { ...baseContent.cv, ...(refreshedContent.cv || {}) },
  };
}

const deviconCdnPrefix = /^https:\/\/cdn\.jsdelivr\.net\/gh\/devicons\/devicon@[^/]+\/icons\//;

// Content saved before the logos moved to public/tech still points at the CDN: swap in the local copy
// when one exists.
function withLocalLogos(stacks: StackGroup[], baseStacks: StackGroup[]): StackGroup[] {
  const localLogos = new Set(baseStacks.flatMap((stack) => stack.items.map((item) => item.logo)));
  return stacks.map((stack) => ({
    ...stack,
    items: stack.items.map((item) => {
      const localLogo = item.logo.replace(deviconCdnPrefix, "/tech/");
      return localLogos.has(localLogo) ? { ...item, logo: localLogo } : item;
    }),
  }));
}

function withRequiredStackItems(stacks: StackGroup[], baseStacks: StackGroup[]): StackGroup[] {
  return stacks.map((stack) => {
    const baseStack = baseStacks.find((candidate) => candidate.title.toLowerCase() === stack.title.toLowerCase());
    if (!baseStack) {
      return stack;
    }

    const nextItems = [...stack.items];
    baseStack.items.forEach((baseItem) => {
      const hasItem = nextItems.some((item) => item.name.toLowerCase() === baseItem.name.toLowerCase());
      if (!hasItem) {
        nextItems.push(baseItem);
      }
    });

    return { ...stack, items: nextItems };
  });
}

function refreshLegacyCopy(content: Partial<SiteContent>, baseContent: SiteContent): Partial<SiteContent> {
  const nextContent = { ...content };
  const legacyCopy: Partial<Record<keyof SiteContent, string[]>> = {
    heroEyebrow: ["Développeur Fullstack & Mobile", "Terminal-minded fullstack developer", "Fullstack, mobile, support IT"],
    heroTitle: [
      "Je construis des applications utiles, claires et prêtes à évoluer.",
      "Je transforme les idées en produits qui respirent le code.",
      "Je construis des interfaces qu'on peut vraiment utiliser.",
      "Je crée des interfaces vraiment utiles.",
      "Je conçois des outils clairs pour des usages réels.",
    ],
    heroLead: [
      "Ingénieur logiciel et systèmes à Abidjan, je construis des applications full-stack, des services distribués et des outils d'administration, avec une attention constante à la fiabilité, à la sécurité et aux usages réels.",
      "Je conçois des interfaces, des API et des applications mobiles pour transformer un besoin concret en produit utilisable: comprendre, prototyper, livrer, puis améliorer avec les retours.",
      "Développeur Fullstack & Mobile, je construis des expériences utiles avec une culture de ligne de commande: comprendre, prototyper, automatiser, livrer et rendre la technologie plus humaine.",
      "J'aime partir d'un besoin simple, le clarifier, puis livrer quelque chose de propre: une page, une API, une app mobile ou un outil interne.",
      "Je travaille entre produit, code et terrain pour créer des interfaces, des API et des expériences mobiles simples à comprendre, agréables à utiliser et faciles à reprendre.",
    ],
    profileCaption: ["Web, mobile, API et produits de terrain", "Fullstack, mobile, terminal et innovation africaine", "Web, mobile, support IT, projets livrés", "Développeur fullstack & mobile, attentif au terrain et à la clarté"],
    aboutTitle: ["Un développeur qui relie interface, backend et usage réel.", "Vision"],
    identityTitle: ["Une présence simple: ce que je fais, comment je travaille, ce que j'ai déjà construit."],
    identityIntro: [
      "Cette plateforme rassemble mon profil, mes projets, mon CV, mes liens et un atelier interactif pour explorer mon travail sans se perdre.",
      "Le portfolio devient une fenêtre sur ton atelier: commandes, décisions produit, projets en chantier et attention portée aux utilisateurs.",
    ],
    journeyTitle: [
      "Formation, terrain et expériences techniques.",
      "Professionnel, académique et produit, sans récit inventé.",
      "Études, support IT et réalisations concrètes.",
    ],
    journeyIntro: [
      "Un parcours construit entre études informatiques, stages techniques et pratique sur des projets web, mobile et support IT.",
      "Les éléments ci-dessous reprennent uniquement les informations sûres. Les dates et diplômes exacts peuvent être ajoutés dès que tu me les donnes.",
      "Mon parcours relie la formation informatique, le support terrain et des projets web/mobile que je construis jusqu'à une version utilisable.",
    ],
    labTitle: ["Des idées testées vite, puis améliorées avec le terrain."],
    labIntro: ["Je garde ici les pistes de produits, les prototypes et les sujets qui peuvent devenir des solutions utiles."],
    contactTitle: ["Discutons d'un besoin concret."],
    contactText: [
      "Disponible pour des projets web, mobile, API, digitalisation, maintenance et accompagnement technique.",
      "Je suis disponible pour concevoir, clarifier ou remettre au propre une interface, une API, une application mobile ou un outil interne.",
    ],
  };

  for (const [key, legacyValues] of Object.entries(legacyCopy) as [keyof SiteContent, string[]][]) {
    const currentValue = nextContent[key];
    if (typeof currentValue === "string" && legacyValues.includes(currentValue)) {
      nextContent[key] = baseContent[key] as never;
    }
  }

  if (Array.isArray(nextContent.metrics)) {
    const oldMetricLabels = new Set(["Ce que je livre", "Ma méthode", "Mon angle", "Mode build", "Approche", "Mission", "Je fais", "Je connais", "Je préfère", "Comprendre", "Créer", "Transmettre"]);
    if (nextContent.metrics.some(([label]) => oldMetricLabels.has(label))) {
      nextContent.metrics = baseContent.metrics;
    }
  }

  if (Array.isArray(nextContent.aboutParagraphs) && nextContent.aboutParagraphs.some((paragraph) => paragraph.startsWith("Je travaille sur des plateformes culturelles") || paragraph.startsWith("Je développe pour simplifier ce qui ralentit"))) {
    nextContent.aboutParagraphs = baseContent.aboutParagraphs;
  }

  if (Array.isArray(nextContent.identityPillars) && nextContent.identityPillars.some((pillar) => pillar.title === "Je pars du besoin réel" || pillar.text.startsWith("Observer les usages, les contraintes"))) {
    nextContent.identityPillars = baseContent.identityPillars;
  }

  if (Array.isArray(nextContent.techMarquee) && nextContent.techMarquee.includes("Automatisation")) {
    nextContent.techMarquee = baseContent.techMarquee;
  }

  if (Array.isArray(nextContent.labs) && nextContent.labs.some((lab) => lab.startsWith("Essayage et préparation de looks"))) {
    nextContent.labs = baseContent.labs;
  }

  // SevenOS moved from the ideas list to the projects.
  if (Array.isArray(nextContent.labs)) {
    nextContent.labs = nextContent.labs.filter((lab) => !lab.startsWith("SevenOS :"));
  }

  const legacyStackTitles = new Set(["Frontend", "Mobile", "Backend", "DevOps & IT"]);
  if (Array.isArray(nextContent.stacks) && nextContent.stacks.every((stack) => legacyStackTitles.has(stack.title))) {
    nextContent.stacks = baseContent.stacks;
  }

  const legacyProjectNames = new Set(["ElegantStyle", "BAOBAB / MonBaobab", "BurkinaLoc", "Suivi de cotisations"]);
  if (Array.isArray(nextContent.projects) && nextContent.projects.length && nextContent.projects.every((project) => legacyProjectNames.has(project.name))) {
    nextContent.projects = baseContent.projects;
  }

  if (
    Array.isArray(nextContent.academicTimeline) &&
    nextContent.academicTimeline.some((item) => item.title === "Licence en Informatique") &&
    !nextContent.academicTimeline.some((item) => item.title?.includes("MBDS"))
  ) {
    nextContent.academicTimeline = baseContent.academicTimeline;
  }

  if (
    Array.isArray(nextContent.professionalTimeline) &&
    nextContent.professionalTimeline.some((item) => item.detail?.startsWith("Abidjan. Support technique, maintenance informatique et accompagnement utilisateur"))
  ) {
    nextContent.professionalTimeline = baseContent.professionalTimeline;
  }

  return nextContent;
}

function normalizeLinkedinLink(value: string) {
  if (!value || value === "https://www.linkedin.com/") {
    return "https://www.linkedin.com/in/victoire-sawadogo-679113253/";
  }

  return value;
}

function normalizeContactLinks(
  links: Partial<SiteContent["contactLinks"]> | undefined,
  fallback: SiteContent["contactLinks"],
) {
  const nextLinks = {
    ...fallback,
    ...(links || {}),
  };

  if (!nextLinks.email || nextLinks.email === "contact@example.com") {
    nextLinks.email = fallback.email;
  }

  if (!nextLinks.github || nextLinks.github === "https://github.com/") {
    nextLinks.github = fallback.github;
  }
  nextLinks.github = nextLinks.github.replace(/\/$/, "");

  if (!nextLinks.whatsapp || nextLinks.whatsapp === "https://wa.me/") {
    nextLinks.whatsapp = fallback.whatsapp;
  }
  nextLinks.whatsapp = nextLinks.whatsapp.replace(/\/$/, "");

  nextLinks.linkedin = normalizeLinkedinLink(nextLinks.linkedin || fallback.linkedin);
  return nextLinks;
}

function isLegacyTimeline(timeline: Partial<TimelineItem>[] | undefined, legacyTitles: string[]) {
  if (!Array.isArray(timeline) || !timeline.length) return false;
  const titles = new Set(timeline.map((item) => item.title));
  return legacyTitles.some((title) => titles.has(title));
}

function sanitizeProfessionalTimeline(timeline: Partial<TimelineItem>[] | undefined) {
  if (!Array.isArray(timeline)) return timeline;
  const hiddenTitles = new Set([
    "ALPHABETCLIC - Stage en développement mobile",
    "ALPHABETCLIC - Mobile development intern",
    "SONABEL - Stage en télécommunication",
    "SONABEL - Telecommunication intern",
  ]);
  return timeline.filter((item) => !hiddenTitles.has(item.title || "")) as TimelineItem[];
}

// A curated project keeps its own copy; the matching GitHub repo only adds live metadata.
function withGithubMetadata(project: ProjectItem, githubProject: ProjectItem): ProjectItem {
  return {
    ...project,
    projectUrl: project.projectUrl || githubProject.projectUrl,
    githubUrl: githubProject.githubUrl || project.githubUrl,
    githubRepo: githubProject.githubRepo,
    githubUpdatedAt: githubProject.githubUpdatedAt,
    githubStars: githubProject.githubStars,
    githubForks: githubProject.githubForks,
    source: "github",
  };
}

function mergePublicProjects(fallbackProjects: ProjectItem[], apiProjects: ProjectItem[], language: Language) {
  // Admin-edited projects are stored in French only, so English keeps its translated copy.
  const manualProjects = language === "fr" ? apiProjects.filter((project) => project.source !== "github") : [];
  const githubProjects = apiProjects.filter((project) => project.source === "github");
  const byName = (projects: ProjectItem[]) => new Map(projects.map((project) => [project.name.toLowerCase(), project]));
  const fallbackByName = byName(fallbackProjects);
  const manualByName = byName(manualProjects);
  const githubByName = byName(githubProjects);
  const names = [...new Set([...fallbackProjects, ...manualProjects, ...githubProjects].map((project) => project.name.toLowerCase()))];

  return names.map((name) => {
    const project = manualByName.get(name) || fallbackByName.get(name);
    const githubProject = githubByName.get(name);
    if (!project) return githubProject as ProjectItem;
    return githubProject ? withGithubMetadata(project, githubProject) : project;
  });
}

function normalizePublicProject(project: ProjectItem): ProjectItem {
  return {
    name: project.name,
    type: project.type,
    focus: project.focus,
    description: project.description,
    detail: project.detail || "",
    logoUrl: project.logoUrl || "",
    projectUrl: project.projectUrl || "",
    githubUrl: project.githubUrl || "",
    githubRepo: project.githubRepo || "",
    githubUpdatedAt: project.githubUpdatedAt || "",
    githubStars: Number(project.githubStars || 0),
    githubForks: Number(project.githubForks || 0),
    source: project.source === "github" ? "github" : "manual",
    apkUrl: project.apkUrl || "",
    apkName: project.apkName || "",
    screenshots: Array.isArray(project.screenshots) ? project.screenshots : [],
    tags: Array.isArray(project.tags) ? project.tags : [],
  };
}

type AuthUser = {
  id?: string;
  sub?: string;
  name: string;
  email: string;
  role: string;
};

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", {
      credentials: "include",
    })
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => undefined);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Connexion impossible.");
      }

      setUser(data.user);
      setPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Connexion impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    setUser(null);
  }

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="login-title">
        {user ? (
          <ContentManager user={user} onLogout={logout} />
        ) : (
          <>
            <div className="admin-badge">
              <LockKeyhole size={28} />
            </div>
            <p className="section-kicker">Accès privé</p>
            <h1 id="login-title">Connexion gestion portfolio</h1>
            <p>
              Connecte-toi pour modifier les textes, les projets, les liens et
              le CV affichés sur le portfolio.
            </p>
            <form className="login-form" onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label>
                Mot de passe
                <input
                  autoComplete="current-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              {message ? <p className="form-error">{message}</p> : null}
              <button className="primary-action button-action" type="submit" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

function ContentManager({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [editLanguage, setEditLanguage] = useState<Language>("fr");
  const [contentLanguage, setContentLanguage] = useState<Language>("fr");
  const baseContent = locales[editLanguage].content;
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [status, setStatus] = useState("");
  const [cvStatus, setCvStatus] = useState("");
  const [cvStatusKind, setCvStatusKind] = useState<"success" | "error">("success");
  const [cvInfo, setCvInfo] = useState<CvInfo | null>(null);
  const [certificationsStatus, setCertificationsStatus] = useState("");
  const [certificationsStatusKind, setCertificationsStatusKind] = useState<"success" | "error">("success");
  const [certificationsInfo, setCertificationsInfo] = useState<CvInfo | null>(null);
  const [profilePhotoInfo, setProfilePhotoInfo] = useState<ProfilePhotoInfo | null>(null);
  const [profilePhotoStatus, setProfilePhotoStatus] = useState("");
  const [profilePhotoStatusKind, setProfilePhotoStatusKind] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isUploadingCertifications, setIsUploadingCertifications] = useState(false);
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false);
  const [hasLoadedContent, setHasLoadedContent] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<SiteContent>(defaultContent);
  const [lastSavedContentSnapshot, setLastSavedContentSnapshot] = useState("");
  const [draftSavedAt, setDraftSavedAt] = useState("");
  const [uploadingProjectApkIndex, setUploadingProjectApkIndex] = useState<number | null>(null);
  const [uploadingProjectLogoIndex, setUploadingProjectLogoIndex] = useState<number | null>(null);
  const [uploadingProjectScreenshotIndex, setUploadingProjectScreenshotIndex] = useState<number | null>(null);

  useEffect(() => {
    const languageBase = locales[editLanguage].content;
    setHasLoadedContent(false);
    fetch(contentUrl(editLanguage))
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => setManagedContent(mergeContent(data.content || languageBase, languageBase), editLanguage))
      .catch(() => setManagedContent(languageBase, editLanguage));

    const draft = readAdminDraft<SiteContent>(editLanguage);
    setDraftSavedAt(draft ? draft.savedAt : "");
  }, [editLanguage]);

  useEffect(() => {
    fetch(`/cv-manifest.json?t=${Date.now()}`)
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => setCvInfo(data))
      .catch(() => setCvInfo(null));

    fetch(`/certifications-manifest.json?t=${Date.now()}`)
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => setCertificationsInfo(data))
      .catch(() => setCertificationsInfo(null));

    fetch(`/profile-manifest.json?t=${Date.now()}`)
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => setProfilePhotoInfo(data))
      .catch(() => setProfilePhotoInfo(null));
  }, []);

  useEffect(() => {
    if (!hasLoadedContent) return;

    const snapshot = getContentSnapshot(content);
    if (snapshot === lastSavedContentSnapshot) return;

    const savedAt = writeAdminDraft(content, contentLanguage);
    setDraftSavedAt(savedAt);
  }, [content, contentLanguage, hasLoadedContent, lastSavedContentSnapshot]);

  function setManagedContent(nextContent: SiteContent, language: Language = editLanguage) {
    setContentLanguage(language);
    setContent(nextContent);
    setLastSavedContent(nextContent);
    setLastSavedContentSnapshot(getContentSnapshot(nextContent));
    setHasLoadedContent(true);
  }

  const hasUnsavedChanges = hasLoadedContent && getContentSnapshot(content) !== lastSavedContentSnapshot;

  function updateField<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  function updateContactLink(key: keyof SiteContent["contactLinks"], value: string) {
    setContent((current) => ({
      ...current,
      contactLinks: { ...current.contactLinks, [key]: value },
    }));
  }

  function syncStructuredField<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
    setStatus("");
  }

  function updateProject(index: number, key: keyof ProjectItem, value: string | string[]) {
    const nextProjects = content.projects.map((project, projectIndex) =>
      projectIndex === index ? { ...project, [key]: value } : project,
    );
    syncStructuredField("projects", nextProjects);
  }

  function addProject(template: keyof typeof projectTemplates = "web") {
    if (content.projects.length >= maxProjects) {
      setStatus(`Tu as atteint la limite de ${maxProjects} projets.`);
      return;
    }
    syncStructuredField("projects", [...content.projects, cloneItem(projectTemplates[template])]);
  }

  function duplicateProject(index: number) {
    if (content.projects.length >= maxProjects) {
      setStatus(`Tu as atteint la limite de ${maxProjects} projets.`);
      return;
    }
    const project = content.projects[index];
    if (!project) return;
    syncStructuredField("projects", [
      ...content.projects.slice(0, index + 1),
      {
        ...cloneItem(project),
        name: `${project.name} copie`,
      },
      ...content.projects.slice(index + 1),
    ]);
  }

  function moveProject(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= content.projects.length) return;
    syncStructuredField("projects", moveItem(content.projects, index, nextIndex));
  }

  function removeProject(index: number) {
    if (content.projects.length <= 1) {
      setStatus("Garde au moins un projet dans le portfolio.");
      return;
    }
    syncStructuredField("projects", content.projects.filter((_, projectIndex) => projectIndex !== index));
  }

  function updateStringList(key: "aboutParagraphs" | "techMarquee" | "labs", index: number, value: string) {
    syncStructuredField(key, content[key].map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function addStringListItem(key: "aboutParagraphs" | "techMarquee" | "labs", value: string) {
    syncStructuredField(key, [...content[key], value]);
  }

  function removeStringListItem(key: "aboutParagraphs" | "techMarquee" | "labs", index: number) {
    if (content[key].length <= 1) {
      setStatus("Garde au moins un élément dans cette liste.");
      return;
    }
    syncStructuredField(key, content[key].filter((_, itemIndex) => itemIndex !== index));
  }

  function updateMetric(index: number, position: 0 | 1, value: string) {
    const nextMetrics = content.metrics.map((metric, metricIndex) =>
      metricIndex === index ? metric.map((item, itemIndex) => (itemIndex === position ? value : item)) : metric,
    ) as string[][];
    syncStructuredField("metrics", nextMetrics);
  }

  function addMetric() {
    syncStructuredField("metrics", [...content.metrics, ["Nouvelle métrique", "Valeur à afficher"]]);
  }

  function removeMetric(index: number) {
    if (content.metrics.length <= 1) {
      setStatus("Garde au moins une métrique dans le hero.");
      return;
    }
    syncStructuredField("metrics", content.metrics.filter((_, metricIndex) => metricIndex !== index));
  }

  function updateIdentityPillar(index: number, key: keyof IdentityPillar, value: string) {
    const nextPillars = content.identityPillars.map((pillar, pillarIndex) =>
      pillarIndex === index ? { ...pillar, [key]: value } : pillar,
    );
    syncStructuredField("identityPillars", nextPillars);
  }

  function addIdentityPillar() {
    syncStructuredField("identityPillars", [
      ...content.identityPillars,
      { title: "Nouveau point fort", text: "Explique ce point avec des mots simples." },
    ]);
  }

  function removeIdentityPillar(index: number) {
    if (content.identityPillars.length <= 1) {
      setStatus("Garde au moins un pilier d'identité.");
      return;
    }
    syncStructuredField("identityPillars", content.identityPillars.filter((_, pillarIndex) => pillarIndex !== index));
  }

  function updateTimelineItem(
    key: "professionalTimeline" | "academicTimeline",
    index: number,
    field: keyof TimelineItem,
    value: string,
  ) {
    const nextTimeline = content[key].map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    syncStructuredField(key, nextTimeline);
  }

  function addTimelineItem(key: "professionalTimeline" | "academicTimeline") {
    syncStructuredField(key, [
      ...content[key],
      {
        period: "Période",
        title: "Nouvelle étape",
        detail: "Décris cette étape avec un résultat ou une compétence concrète.",
      },
    ]);
  }

  function removeTimelineItem(key: "professionalTimeline" | "academicTimeline", index: number) {
    if (content[key].length <= 1) {
      setStatus("Garde au moins une étape dans ce parcours.");
      return;
    }
    syncStructuredField(key, content[key].filter((_, itemIndex) => itemIndex !== index));
  }

  function updateStackGroup(index: number, title: string) {
    const nextStacks = content.stacks.map((group, groupIndex) =>
      groupIndex === index ? { ...group, title } : group,
    );
    syncStructuredField("stacks", nextStacks);
  }

  function addStackGroup(template: keyof typeof stackGroupTemplates = "frontend") {
    if (content.stacks.length >= maxStackGroups) {
      setStatus(`Tu as atteint la limite de ${maxStackGroups} groupes de stack.`);
      return;
    }
    syncStructuredField("stacks", [...content.stacks, cloneItem(stackGroupTemplates[template]) as StackGroup]);
  }

  function duplicateStackGroup(index: number) {
    if (content.stacks.length >= maxStackGroups) {
      setStatus(`Tu as atteint la limite de ${maxStackGroups} groupes de stack.`);
      return;
    }
    const group = content.stacks[index];
    if (!group) return;
    syncStructuredField("stacks", [
      ...content.stacks.slice(0, index + 1),
      {
        ...(cloneItem(group) as StackGroup),
        title: `${group.title} copie`,
      } as StackGroup,
      ...content.stacks.slice(index + 1),
    ]);
  }

  function moveStackGroup(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= content.stacks.length) return;
    syncStructuredField("stacks", moveItem(content.stacks, index, nextIndex));
  }

  function removeStackGroup(index: number) {
    if (content.stacks.length <= 1) {
      setStatus("Garde au moins un groupe de stack.");
      return;
    }
    syncStructuredField("stacks", content.stacks.filter((_, groupIndex) => groupIndex !== index));
  }

  function updateStackItem(groupIndex: number, itemIndex: number, field: "name" | "logo", value: string) {
    const nextStacks = content.stacks.map((group, currentGroupIndex) =>
      currentGroupIndex === groupIndex
        ? {
            ...group,
            items: group.items.map((item, currentItemIndex) =>
              currentItemIndex === itemIndex ? { ...item, [field]: value } : item,
            ),
          }
        : group,
    );
    syncStructuredField("stacks", nextStacks);
  }

  function addStackItem(groupIndex: number) {
    const group = content.stacks[groupIndex];
    if (!group || group.items.length >= maxStackItems) {
      setStatus(`Tu as atteint la limite de ${maxStackItems} technologies dans ce groupe.`);
      return;
    }
    const nextStacks = content.stacks.map((group, currentGroupIndex) =>
      currentGroupIndex === groupIndex
        ? {
            ...group,
            items: [
              ...group.items,
              {
                name: "Technologie",
                logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
              },
            ],
          }
        : group,
    );
    syncStructuredField("stacks", nextStacks);
  }

  function duplicateStackItem(groupIndex: number, itemIndex: number) {
    const group = content.stacks[groupIndex];
    if (!group || group.items.length >= maxStackItems) {
      setStatus(`Tu as atteint la limite de ${maxStackItems} technologies dans ce groupe.`);
      return;
    }
    const item = group.items[itemIndex];
    if (!item) return;
    const nextStacks = content.stacks.map((currentGroup, currentGroupIndex) =>
      currentGroupIndex === groupIndex
        ? {
            ...currentGroup,
            items: [
              ...currentGroup.items.slice(0, itemIndex + 1),
              { ...item, name: `${item.name} copie` },
              ...currentGroup.items.slice(itemIndex + 1),
            ],
          }
        : currentGroup,
    );
    syncStructuredField("stacks", nextStacks);
  }

  function moveStackItem(groupIndex: number, itemIndex: number, direction: -1 | 1) {
    const group = content.stacks[groupIndex];
    const nextItemIndex = itemIndex + direction;
    if (!group || nextItemIndex < 0 || nextItemIndex >= group.items.length) return;
    const nextStacks = content.stacks.map((currentGroup, currentGroupIndex) =>
      currentGroupIndex === groupIndex
        ? { ...currentGroup, items: moveItem(currentGroup.items, itemIndex, nextItemIndex) }
        : currentGroup,
    );
    syncStructuredField("stacks", nextStacks);
  }

  function removeStackItem(groupIndex: number, itemIndex: number) {
    const group = content.stacks[groupIndex];
    if (!group || group.items.length <= 1) {
      setStatus("Garde au moins une technologie dans ce groupe.");
      return;
    }
    const nextStacks = content.stacks.map((currentGroup, currentGroupIndex) =>
      currentGroupIndex === groupIndex
        ? { ...currentGroup, items: currentGroup.items.filter((_, currentItemIndex) => currentItemIndex !== itemIndex) }
        : currentGroup,
    );
    syncStructuredField("stacks", nextStacks);
  }

  async function uploadProjectApk(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingProjectApkIndex(index);
    setStatus("");

    try {
      const formData = new FormData();
      formData.append("apk", file);

      const response = await fetch("/api/projects/apk", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Upload de l'APK impossible.");
      }

      const nextProjects = content.projects.map((project, projectIndex) =>
        projectIndex === index
          ? {
              ...project,
              apkUrl: data.apk.url,
              apkName: data.apk.originalName || file.name,
            }
          : project,
      );
      syncStructuredField("projects", nextProjects);
      setStatus("APK ajouté au projet. Sauvegarde le contenu pour publier la fiche.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload de l'APK impossible.");
    } finally {
      setUploadingProjectApkIndex(null);
      event.target.value = "";
    }
  }

  async function uploadProjectLogo(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingProjectLogoIndex(index);
    setStatus("");

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch("/api/projects/logo", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Upload du logo impossible.");
      }

      const nextProjects = content.projects.map((project, projectIndex) =>
        projectIndex === index ? { ...project, logoUrl: data.logo.url } : project,
      );
      syncStructuredField("projects", nextProjects);
      setStatus("Logo ajouté au projet. Sauvegarde le contenu pour publier la fiche.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload du logo impossible.");
    } finally {
      setUploadingProjectLogoIndex(null);
      event.target.value = "";
    }
  }

  async function uploadProjectScreenshot(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingProjectScreenshotIndex(index);
    setStatus("");

    try {
      const formData = new FormData();
      formData.append("screenshot", file);

      const response = await fetch("/api/projects/screenshot", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Upload de la capture impossible.");
      }

      const nextProjects = content.projects.map((project, projectIndex) =>
        projectIndex === index
          ? {
              ...project,
              screenshots: [
                ...(project.screenshots || []),
                {
                  url: data.screenshot.url,
                  alt: data.screenshot.originalName || file.name,
                },
              ].slice(0, 8),
            }
          : project,
      );
      syncStructuredField("projects", nextProjects);
      setStatus("Capture ajoutée au projet. Sauvegarde le contenu pour publier.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload de la capture impossible.");
    } finally {
      setUploadingProjectScreenshotIndex(null);
      event.target.value = "";
    }
  }

  function updateProjectScreenshot(projectIndex: number, screenshotIndex: number, value: string) {
    const nextProjects = content.projects.map((project, currentProjectIndex) =>
      currentProjectIndex === projectIndex
        ? {
            ...project,
            screenshots: (project.screenshots || []).map((screenshot, currentScreenshotIndex) =>
              currentScreenshotIndex === screenshotIndex ? { ...screenshot, alt: value } : screenshot,
            ),
          }
        : project,
    );
    syncStructuredField("projects", nextProjects);
  }

  function removeProjectScreenshot(projectIndex: number, screenshotIndex: number) {
    const nextProjects = content.projects.map((project, currentProjectIndex) =>
      currentProjectIndex === projectIndex
        ? {
            ...project,
            screenshots: (project.screenshots || []).filter((_, currentScreenshotIndex) => currentScreenshotIndex !== screenshotIndex),
          }
        : project,
    );
    syncStructuredField("projects", nextProjects);
  }

  async function saveContent() {
    setIsSaving(true);
    setStatus("");

    try {
      const response = await fetch(contentUrl(editLanguage), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(stripRuntimeFields(content)),
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Sauvegarde impossible.");
      }

      setManagedContent(mergeContent(data.content, baseContent));
      clearAdminDraft(editLanguage);
      setDraftSavedAt("");
      setStatus("Contenu sauvegardé. Le portfolio public est à jour.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sauvegarde impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  function restoreDraft() {
    const draft = readAdminDraft<SiteContent>(editLanguage);
    if (!draft) {
      setDraftSavedAt("");
      setStatus("Aucun brouillon local à restaurer.");
      return;
    }

    setContent(mergeContent(draft.content, baseContent));
    setDraftSavedAt(draft.savedAt);
    setStatus("Brouillon restauré. Vérifie le contenu puis sauvegarde pour publier.");
  }

  function discardDraft() {
    clearAdminDraft(editLanguage);
    setDraftSavedAt("");
    setContent(lastSavedContent);
    setStatus("Brouillon local supprimé. Retour à la dernière version sauvegardée.");
  }

  async function uploadCv(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingCv(true);
    setCvStatus("");
    setCvStatusKind("success");

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const response = await fetch("/api/content/cv", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Upload du CV impossible.");
      }

      setCvInfo(data.cv);
      setCvStatusKind("success");
      setCvStatus("CV uploadé. La section publique est à jour.");
    } catch (error) {
      setCvStatusKind("error");
      setCvStatus(error instanceof Error ? error.message : "Upload du CV impossible.");
    } finally {
      setIsUploadingCv(false);
      event.target.value = "";
    }
  }

  async function uploadCertifications(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingCertifications(true);
    setCertificationsStatus("");
    setCertificationsStatusKind("success");

    try {
      const formData = new FormData();
      formData.append("certifications", file);

      const response = await fetch("/api/content/certifications", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Upload des certifications impossible.");
      }

      setCertificationsInfo(data.certifications);
      setCertificationsStatusKind("success");
      setCertificationsStatus("Certifications uploadées. La section publique est à jour.");
    } catch (error) {
      setCertificationsStatusKind("error");
      setCertificationsStatus(error instanceof Error ? error.message : "Upload des certifications impossible.");
    } finally {
      setIsUploadingCertifications(false);
      event.target.value = "";
    }
  }

  async function uploadProfilePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingProfilePhoto(true);
    setProfilePhotoStatus("");
    setProfilePhotoStatusKind("success");

    try {
      const formData = new FormData();
      formData.append("profile", file);

      const response = await fetch("/api/content/profile-photo", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Upload de la photo impossible.");
      }

      setProfilePhotoInfo(data.profile);
      setProfilePhotoStatusKind("success");
      setProfilePhotoStatus("Photo publiée. Le hero utilisera cette image.");
    } catch (error) {
      setProfilePhotoStatusKind("error");
      setProfilePhotoStatus(error instanceof Error ? error.message : "Upload de la photo impossible.");
    } finally {
      setIsUploadingProfilePhoto(false);
      event.target.value = "";
    }
  }

  return (
    <div className="admin-panel content-admin">
      <div className="admin-header">
        <div>
          <div className="admin-badge">
            <ShieldCheck size={28} />
          </div>
          <p className="section-kicker">Gestion privée</p>
          <h1 id="login-title">Gestion du portfolio</h1>
          <p>
            Connecté avec <strong>{user.email}</strong>. Mets à jour les sections,
            ajoute tes projets, puis sauvegarde pour publier.
          </p>
        </div>
        <div className="admin-header-actions">
          <div className="cv-segmented admin-language" role="group" aria-label="Langue du contenu modifié">
            {(["fr", "en"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={editLanguage === value}
                onClick={() => {
                  if (value === editLanguage) return;
                  setEditLanguage(value);
                  setStatus(hasUnsavedChanges ? "Brouillon conservé. Tu peux y revenir à tout moment." : "");
                }}
              >
                {value === "fr" ? "Français" : "English"}
              </button>
            ))}
          </div>
          <a
            className="secondary-action button-action"
            href={`/cv-builder?lang=${editLanguage}${hasUnsavedChanges ? "&source=draft" : ""}`}
            target="_blank"
            rel="noreferrer"
          >
            <FileText size={18} /> Générer le CV
          </a>
          <button className="secondary-action button-action" type="button" onClick={onLogout}>
            <LogOut size={18} /> Quitter
          </button>
        </div>
      </div>

      <AdminOverview
        content={content}
        hasUnsavedChanges={hasUnsavedChanges}
        draftSavedAt={draftSavedAt}
      />

      <div className="admin-grid">
        <EditorCard title="Hero">
          <ProfilePhotoManager
            photo={profilePhotoInfo}
            status={profilePhotoStatus}
            statusKind={profilePhotoStatusKind}
            isUploading={isUploadingProfilePhoto}
            onUpload={uploadProfilePhoto}
          />
          <TextField label="Accroche courte" value={content.heroEyebrow} onChange={(value) => updateField("heroEyebrow", value)} />
          <TextAreaField label="Titre principal" value={content.heroTitle} onChange={(value) => updateField("heroTitle", value)} />
          <TextAreaField label="Description" value={content.heroLead} onChange={(value) => updateField("heroLead", value)} />
          <TextField label="Légende photo" value={content.profileCaption} onChange={(value) => updateField("profileCaption", value)} />
          <MetricsEditor metrics={content.metrics} onAdd={addMetric} onRemove={removeMetric} onUpdate={updateMetric} />
          <StringListEditor
            title="Bandeau technologies"
            items={content.techMarquee}
            placeholder="Nouvelle technologie"
            onAdd={() => addStringListItem("techMarquee", "Nouvelle technologie")}
            onRemove={(index) => removeStringListItem("techMarquee", index)}
            onUpdate={(index, value) => updateStringList("techMarquee", index, value)}
          />
        </EditorCard>

        <EditorCard title="Profil & identité">
          <TextAreaField label="Titre profil" value={content.aboutTitle} onChange={(value) => updateField("aboutTitle", value)} />
          <StringListEditor
            title="Paragraphes profil"
            items={content.aboutParagraphs}
            multiline
            placeholder="Nouveau paragraphe"
            onAdd={() => addStringListItem("aboutParagraphs", "Nouveau paragraphe à compléter.")}
            onRemove={(index) => removeStringListItem("aboutParagraphs", index)}
            onUpdate={(index, value) => updateStringList("aboutParagraphs", index, value)}
          />
          <TextAreaField label="Titre identité" value={content.identityTitle} onChange={(value) => updateField("identityTitle", value)} />
          <TextAreaField label="Intro identité" value={content.identityIntro} onChange={(value) => updateField("identityIntro", value)} />
          <IdentityPillarsEditor
            pillars={content.identityPillars}
            onAdd={addIdentityPillar}
            onRemove={removeIdentityPillar}
            onUpdate={updateIdentityPillar}
          />
        </EditorCard>

        <EditorCard title="Parcours">
          <TextAreaField label="Titre parcours" value={content.journeyTitle} onChange={(value) => updateField("journeyTitle", value)} />
          <TextAreaField label="Intro parcours" value={content.journeyIntro} onChange={(value) => updateField("journeyIntro", value)} />
          <TimelineEditor
            title="Parcours professionnel"
            items={content.professionalTimeline}
            onAdd={() => addTimelineItem("professionalTimeline")}
            onRemove={(index) => removeTimelineItem("professionalTimeline", index)}
            onUpdate={(index, field, value) => updateTimelineItem("professionalTimeline", index, field, value)}
          />
          <TimelineEditor
            title="Parcours académique"
            items={content.academicTimeline}
            onAdd={() => addTimelineItem("academicTimeline")}
            onRemove={(index) => removeTimelineItem("academicTimeline", index)}
            onUpdate={(index, field, value) => updateTimelineItem("academicTimeline", index, field, value)}
          />
        </EditorCard>

        <EditorCard title="Stack & projets">
          <StackEditor
            stacks={content.stacks}
            onAddGroup={addStackGroup}
            onDuplicateGroup={duplicateStackGroup}
            onMoveGroup={moveStackGroup}
            onRemoveGroup={removeStackGroup}
            onUpdateGroup={updateStackGroup}
            onAddItem={addStackItem}
            onDuplicateItem={duplicateStackItem}
            onMoveItem={moveStackItem}
            onRemoveItem={removeStackItem}
            onUpdateItem={updateStackItem}
          />
          <ProjectEditor
            projects={content.projects}
            onAdd={addProject}
            onDuplicate={duplicateProject}
            onMove={moveProject}
            onRemove={removeProject}
            onUpdate={updateProject}
            onUploadApk={uploadProjectApk}
            onUploadLogo={uploadProjectLogo}
            onUploadScreenshot={uploadProjectScreenshot}
            onUpdateScreenshot={updateProjectScreenshot}
            onRemoveScreenshot={removeProjectScreenshot}
            uploadingApkIndex={uploadingProjectApkIndex}
            uploadingLogoIndex={uploadingProjectLogoIndex}
            uploadingScreenshotIndex={uploadingProjectScreenshotIndex}
          />
        </EditorCard>

        <EditorCard title="Labo & contact">
          <TextAreaField label="Titre labo" value={content.labTitle} onChange={(value) => updateField("labTitle", value)} />
          <TextAreaField label="Intro labo" value={content.labIntro} onChange={(value) => updateField("labIntro", value)} />
          <StringListEditor
            title="Idées atelier"
            items={content.labs}
            multiline
            placeholder="Nouvelle idée"
            onAdd={() => addStringListItem("labs", "Nouvelle idée à tester.")}
            onRemove={(index) => removeStringListItem("labs", index)}
            onUpdate={(index, value) => updateStringList("labs", index, value)}
          />
          <TextAreaField label="Titre contact" value={content.contactTitle} onChange={(value) => updateField("contactTitle", value)} />
          <TextAreaField label="Texte contact" value={content.contactText} onChange={(value) => updateField("contactText", value)} />
          <TextField label="Email" value={content.contactLinks.email} onChange={(value) => updateContactLink("email", value)} />
          <TextField label="GitHub" value={content.contactLinks.github} onChange={(value) => updateContactLink("github", value)} />
          <TextField label="LinkedIn" value={content.contactLinks.linkedin} onChange={(value) => updateContactLink("linkedin", value)} />
          <TextField label="WhatsApp" value={content.contactLinks.whatsapp} onChange={(value) => updateContactLink("whatsapp", value)} />
        </EditorCard>

        <EditorCard title="CV généré">
          <CvSettingsEditor
            settings={content.cv}
            projectNames={content.projects.map((project) => project.name)}
            builderUrl={`/cv-builder?lang=${editLanguage}${hasUnsavedChanges ? "&source=draft" : ""}`}
            onChange={(cv) => updateField("cv", cv)}
          />
        </EditorCard>

        <EditorCard title="CV public">
          <div className="cv-upload-box">
            <FileText size={26} />
            <div>
              <strong>Uploader un CV</strong>
              <p>Formats acceptés: PDF, JPG, PNG ou WEBP. Taille maximale: 8 Mo.</p>
            </div>
            <label className="cv-upload-button">
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={uploadCv}
                disabled={isUploadingCv}
              />
              {isUploadingCv ? "Upload..." : "Choisir un fichier"}
            </label>
          </div>
          {cvInfo ? (
            <div className="admin-summary">
              <span>Fichier</span>
              <strong>{cvInfo.originalName || cvInfo.url}</strong>
              <span>Type</span>
              <strong>{cvInfo.type === "pdf" ? "PDF" : "Image"}</strong>
              <span>Lien</span>
              <strong>
                <a href={cvInfo.url} target="_blank" rel="noreferrer">
                  {cvInfo.url}
                </a>
              </strong>
            </div>
          ) : (
            <p className="admin-note">Aucun CV uploadé pour le moment.</p>
          )}
          {cvStatus ? (
            <p className={`cv-upload-status ${cvStatusKind}`}>{cvStatus}</p>
          ) : null}
        </EditorCard>

        <EditorCard title="Certifications publiques">
          <div className="cv-upload-box">
            <FileText size={26} />
            <div>
              <strong>Uploader les certifications</strong>
              <p>Format accepté: PDF uniquement. Taille maximale: 12 Mo.</p>
            </div>
            <label className="cv-upload-button">
              <input
                type="file"
                accept="application/pdf"
                onChange={uploadCertifications}
                disabled={isUploadingCertifications}
              />
              {isUploadingCertifications ? "Upload..." : "Choisir un PDF"}
            </label>
          </div>
          {certificationsInfo ? (
            <div className="admin-summary">
              <span>Fichier</span>
              <strong>{certificationsInfo.originalName || certificationsInfo.url}</strong>
              <span>Type</span>
              <strong>PDF</strong>
              <span>Lien</span>
              <strong>
                <a href={certificationsInfo.url} target="_blank" rel="noreferrer">
                  {certificationsInfo.url}
                </a>
              </strong>
            </div>
          ) : (
            <p className="admin-note">Aucun PDF de certifications uploadé pour le moment.</p>
          )}
          {certificationsStatus ? (
            <p className={`cv-upload-status ${certificationsStatusKind}`}>{certificationsStatus}</p>
          ) : null}
        </EditorCard>
      </div>

      <div className="admin-savebar">
        <div>
          {status ? <p>{status}</p> : <p>{hasUnsavedChanges ? "Modifications non publiées. Un brouillon local est gardé automatiquement." : "Tout est aligné avec la dernière sauvegarde."}</p>}
          {draftSavedAt ? <span>Brouillon local: {formatDateTime(draftSavedAt)}</span> : null}
        </div>
        <div className="savebar-actions">
          {draftSavedAt ? (
            <>
              <button className="secondary-action button-action" type="button" onClick={restoreDraft}>
                Restaurer brouillon
              </button>
              <button className="secondary-action button-action" type="button" onClick={discardDraft}>
                Ignorer brouillon
              </button>
            </>
          ) : null}
          <button className="primary-action button-action" type="button" onClick={saveContent} disabled={isSaving || !hasUnsavedChanges}>
            {isSaving ? "Sauvegarde..." : "Sauvegarder le contenu"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CvSettingsEditor({
  settings,
  projectNames,
  builderUrl,
  onChange,
}: {
  settings: SiteContent["cv"];
  projectNames: string[];
  builderUrl: string;
  onChange: (settings: SiteContent["cv"]) => void;
}) {
  function update<K extends keyof SiteContent["cv"]>(key: K, value: SiteContent["cv"][K]) {
    onChange({ ...settings, [key]: value });
  }

  function updateList(key: "languages" | "interests", index: number, value: string) {
    update(key, settings[key].map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function toggleProject(name: string) {
    const isSelected = settings.projects.includes(name);
    if (!isSelected && settings.projects.length >= 5) return;
    update(
      "projects",
      isSelected ? settings.projects.filter((project) => project !== name) : projectNames.filter((project) => project === name || settings.projects.includes(project)),
    );
  }

  return (
    <>
      <p className="admin-note">
        Le CV est généré à partir de tout le portfolio (expérience, formation, projets, compétences, certifications). Ces champs
        règlent ce qui lui est propre.
      </p>
      <TextField label="Titre du CV" value={settings.headline} onChange={(value) => update("headline", value)} />
      <TextAreaField label="Résumé du profil" value={settings.summary} onChange={(value) => update("summary", value)} />
      <TextField label="Localisation" value={settings.location} onChange={(value) => update("location", value)} />
      <TextField label="Téléphone" value={settings.phone} onChange={(value) => update("phone", value)} />
      <TextField label="Site du portfolio" value={settings.website} onChange={(value) => update("website", value)} />
      <StringListEditor
        title="Langues parlées"
        items={settings.languages}
        placeholder="Ex. Anglais — professionnel"
        onAdd={() => update("languages", [...settings.languages, ""])}
        onRemove={(index) => update("languages", settings.languages.filter((_, itemIndex) => itemIndex !== index))}
        onUpdate={(index, value) => updateList("languages", index, value)}
      />
      <StringListEditor
        title="Centres d'intérêt"
        items={settings.interests}
        placeholder="Ex. Systèmes d'exploitation"
        onAdd={() => update("interests", [...settings.interests, ""])}
        onRemove={(index) => update("interests", settings.interests.filter((_, itemIndex) => itemIndex !== index))}
        onUpdate={(index, value) => updateList("interests", index, value)}
      />
      <fieldset className="structured-editor cv-project-picker">
        <legend className="structured-editor-header">
          <span>Projets mis en avant (5 au plus)</span>
        </legend>
        {projectNames.map((name) => (
          <label key={name} className="cv-toggle">
            <input
              type="checkbox"
              checked={settings.projects.includes(name)}
              disabled={!settings.projects.includes(name) && settings.projects.length >= 5}
              onChange={() => toggleProject(name)}
            />
            <span>{name}</span>
          </label>
        ))}
      </fieldset>
      <a className="primary-action button-action" href={builderUrl} target="_blank" rel="noreferrer">
        <FileText size={18} /> Ouvrir le générateur de CV
      </a>
    </>
  );
}

function EditorCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="editor-card">
      <h2>{title}</h2>
      <div className="editor-fields">{children}</div>
    </section>
  );
}

function AdminOverview({
  content,
  hasUnsavedChanges,
  draftSavedAt,
}: {
  content: SiteContent;
  hasUnsavedChanges: boolean;
  draftSavedAt: string;
}) {
  const screenshotCount = content.projects.reduce((total, project) => total + (project.screenshots?.length || 0), 0);
  const stackItemCount = content.stacks.reduce((total, group) => total + group.items.length, 0);

  return (
    <section className="admin-overview" aria-label="Résumé de gestion">
      <div>
        <span>État</span>
        <strong>{hasUnsavedChanges ? "Brouillon actif" : "À jour"}</strong>
        <em>{draftSavedAt ? `Gardé à ${formatDateTime(draftSavedAt)}` : "Aucun brouillon local"}</em>
      </div>
      <div>
        <span>Projets</span>
        <strong>{content.projects.length}/{maxProjects}</strong>
        <em>{screenshotCount} capture{screenshotCount > 1 ? "s" : ""}</em>
      </div>
      <div>
        <span>Stack</span>
        <strong>{content.stacks.length}/{maxStackGroups}</strong>
        <em>{stackItemCount} technologie{stackItemCount > 1 ? "s" : ""}</em>
      </div>
      <div>
        <span>Contact</span>
        <strong>{content.contactLinks.email}</strong>
        <em>Liens publics configurés</em>
      </div>
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <div className="editor-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <div className="editor-field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ProfilePhotoManager({
  photo,
  status,
  statusKind,
  isUploading,
  onUpload,
}: {
  photo: ProfilePhotoInfo | null;
  status: string;
  statusKind: "success" | "error";
  isUploading: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="profile-photo-manager">
      <div className="profile-photo-preview">
        <img src={photo?.url || "/profile-placeholder.svg"} alt="" />
      </div>
      <div>
        <strong>Photo de profil</strong>
        <p>Formats acceptés: JPG, PNG ou WEBP. Taille maximale: 4 Mo.</p>
        {photo ? <span>{photo.originalName || photo.url}</span> : <span>Aucune photo personnalisée.</span>}
        <label className="cv-upload-button">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onUpload}
            disabled={isUploading}
          />
          {isUploading ? "Upload..." : "Choisir une photo"}
        </label>
        {status ? <p className={`cv-upload-status ${statusKind}`}>{status}</p> : null}
      </div>
    </div>
  );
}

function StringListEditor({
  title,
  items,
  placeholder,
  multiline = false,
  onAdd,
  onRemove,
  onUpdate,
}: {
  title: string;
  items: string[];
  placeholder: string;
  multiline?: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
}) {
  return (
    <div className="structured-editor compact-editor">
      <div className="structured-editor-header">
        <span>{title}</span>
        <button className="secondary-action button-action" type="button" onClick={onAdd}>
          Ajouter
        </button>
      </div>
      {items.map((item, index) => (
        <div className="inline-editor-row" key={`${title}-${index}`}>
          {multiline ? (
            <textarea
              aria-label={`${title} ${index + 1}`}
              placeholder={placeholder}
              rows={3}
              value={item}
              onChange={(event) => onUpdate(index, event.target.value)}
            />
          ) : (
            <input
              aria-label={`${title} ${index + 1}`}
              placeholder={placeholder}
              value={item}
              onChange={(event) => onUpdate(index, event.target.value)}
            />
          )}
          <button className="text-action" type="button" onClick={() => onRemove(index)}>
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}

function MetricsEditor({
  metrics,
  onAdd,
  onRemove,
  onUpdate,
}: {
  metrics: string[][];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, position: 0 | 1, value: string) => void;
}) {
  return (
    <div className="structured-editor compact-editor">
      <div className="structured-editor-header">
        <span>Métriques du hero</span>
        <button className="secondary-action button-action" type="button" onClick={onAdd}>
          Ajouter
        </button>
      </div>
      {metrics.map(([label, value], index) => (
        <div className="structured-item compact-item" key={`${label}-${index}`}>
          <div className="structured-item-title">
            <strong>Métrique {index + 1}</strong>
            <button className="text-action" type="button" onClick={() => onRemove(index)}>
              Supprimer
            </button>
          </div>
          <TextField label="Libellé" value={label} onChange={(nextValue) => onUpdate(index, 0, nextValue)} />
          <TextField label="Valeur" value={value} onChange={(nextValue) => onUpdate(index, 1, nextValue)} />
        </div>
      ))}
    </div>
  );
}

function IdentityPillarsEditor({
  pillars,
  onAdd,
  onRemove,
  onUpdate,
}: {
  pillars: IdentityPillar[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, key: keyof IdentityPillar, value: string) => void;
}) {
  return (
    <div className="structured-editor">
      <div className="structured-editor-header">
        <span>Piliers identité</span>
        <button className="secondary-action button-action" type="button" onClick={onAdd}>
          Ajouter
        </button>
      </div>
      {pillars.map((pillar, index) => (
        <div className="structured-item" key={`${pillar.title}-${index}`}>
          <div className="structured-item-title">
            <strong>Pilier {index + 1}</strong>
            <button className="text-action" type="button" onClick={() => onRemove(index)}>
              Supprimer
            </button>
          </div>
          <TextField label="Titre" value={pillar.title} onChange={(value) => onUpdate(index, "title", value)} />
          <TextAreaField label="Texte" value={pillar.text} onChange={(value) => onUpdate(index, "text", value)} />
        </div>
      ))}
    </div>
  );
}

function TimelineEditor({
  title,
  items,
  onAdd,
  onRemove,
  onUpdate,
}: {
  title: string;
  items: TimelineItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof TimelineItem, value: string) => void;
}) {
  return (
    <div className="structured-editor">
      <div className="structured-editor-header">
        <span>{title}</span>
        <button className="secondary-action button-action" type="button" onClick={onAdd}>
          Ajouter
        </button>
      </div>
      {items.map((item, index) => (
        <div className="structured-item" key={`${title}-${item.period}-${index}`}>
          <div className="structured-item-title">
            <strong>Étape {index + 1}</strong>
            <button className="text-action" type="button" onClick={() => onRemove(index)}>
              Supprimer
            </button>
          </div>
          <TextField label="Période" value={item.period} onChange={(value) => onUpdate(index, "period", value)} />
          <TextField label="Titre" value={item.title} onChange={(value) => onUpdate(index, "title", value)} />
          <TextAreaField label="Détail" value={item.detail} onChange={(value) => onUpdate(index, "detail", value)} />
        </div>
      ))}
    </div>
  );
}

function StackEditor({
  stacks,
  onAddGroup,
  onDuplicateGroup,
  onMoveGroup,
  onRemoveGroup,
  onUpdateGroup,
  onAddItem,
  onDuplicateItem,
  onMoveItem,
  onRemoveItem,
  onUpdateItem,
}: {
  stacks: StackGroup[];
  onAddGroup: (template?: keyof typeof stackGroupTemplates) => void;
  onDuplicateGroup: (index: number) => void;
  onMoveGroup: (index: number, direction: -1 | 1) => void;
  onRemoveGroup: (index: number) => void;
  onUpdateGroup: (index: number, title: string) => void;
  onAddItem: (groupIndex: number) => void;
  onDuplicateItem: (groupIndex: number, itemIndex: number) => void;
  onMoveItem: (groupIndex: number, itemIndex: number, direction: -1 | 1) => void;
  onRemoveItem: (groupIndex: number, itemIndex: number) => void;
  onUpdateItem: (groupIndex: number, itemIndex: number, field: "name" | "logo", value: string) => void;
}) {
  return (
    <div className="structured-editor">
      <div className="structured-editor-header">
        <span>Stack technique ({stacks.length}/{maxStackGroups})</span>
        <div className="template-actions">
          <button className="secondary-action button-action" type="button" onClick={() => onAddGroup("frontend")}>
            + Frontend
          </button>
          <button className="secondary-action button-action" type="button" onClick={() => onAddGroup("mobile")}>
            + Mobile
          </button>
          <button className="secondary-action button-action" type="button" onClick={() => onAddGroup("backend")}>
            + Backend
          </button>
          <button className="secondary-action button-action" type="button" onClick={() => onAddGroup("devops")}>
            + DevOps
          </button>
        </div>
      </div>
      {stacks.map((group, groupIndex) => (
        <div className="structured-item" key={`${group.title}-${groupIndex}`}>
          <div className="structured-item-title">
            <strong>Groupe {groupIndex + 1}</strong>
            <div className="item-actions">
              <button className="text-action" type="button" onClick={() => onMoveGroup(groupIndex, -1)} disabled={groupIndex === 0}>
                Monter
              </button>
              <button className="text-action" type="button" onClick={() => onMoveGroup(groupIndex, 1)} disabled={groupIndex === stacks.length - 1}>
                Descendre
              </button>
              <button className="text-action" type="button" onClick={() => onDuplicateGroup(groupIndex)}>
                Dupliquer
              </button>
              <button className="text-action danger" type="button" onClick={() => onRemoveGroup(groupIndex)}>
                Supprimer
              </button>
            </div>
          </div>
          <TextField label="Nom du groupe" value={group.title} onChange={(value) => onUpdateGroup(groupIndex, value)} />
          <div className="stack-items-editor">
            {group.items.map((item, itemIndex) => (
              <div className="stack-item-editor" key={`${item.name}-${itemIndex}`}>
                <img src={item.logo} alt="" />
                <TextField label="Technologie" value={item.name} onChange={(value) => onUpdateItem(groupIndex, itemIndex, "name", value)} />
                <TextField label="Logo URL" value={item.logo} onChange={(value) => onUpdateItem(groupIndex, itemIndex, "logo", value)} />
                <div className="item-actions vertical-actions">
                  <button className="text-action" type="button" onClick={() => onMoveItem(groupIndex, itemIndex, -1)} disabled={itemIndex === 0}>
                    Monter
                  </button>
                  <button className="text-action" type="button" onClick={() => onMoveItem(groupIndex, itemIndex, 1)} disabled={itemIndex === group.items.length - 1}>
                    Descendre
                  </button>
                  <button className="text-action" type="button" onClick={() => onDuplicateItem(groupIndex, itemIndex)}>
                    Dupliquer
                  </button>
                  <button className="text-action danger" type="button" onClick={() => onRemoveItem(groupIndex, itemIndex)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="secondary-action button-action" type="button" onClick={() => onAddItem(groupIndex)}>
            Ajouter une technologie
          </button>
        </div>
      ))}
    </div>
  );
}

function ProjectEditor({
  projects,
  onAdd,
  onDuplicate,
  onMove,
  onRemove,
  onUpdate,
  onUploadApk,
  onUploadLogo,
  onUploadScreenshot,
  onUpdateScreenshot,
  onRemoveScreenshot,
  uploadingApkIndex,
  uploadingLogoIndex,
  uploadingScreenshotIndex,
}: {
  projects: ProjectItem[];
  onAdd: (template?: keyof typeof projectTemplates) => void;
  onDuplicate: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, key: keyof ProjectItem, value: string | string[]) => void;
  onUploadApk: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadLogo: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadScreenshot: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateScreenshot: (projectIndex: number, screenshotIndex: number, value: string) => void;
  onRemoveScreenshot: (projectIndex: number, screenshotIndex: number) => void;
  uploadingApkIndex: number | null;
  uploadingLogoIndex: number | null;
  uploadingScreenshotIndex: number | null;
}) {
  return (
    <div className="structured-editor">
      <div className="structured-editor-header">
        <span>Projets ({projects.length}/{maxProjects})</span>
        <div className="template-actions">
          <button className="secondary-action button-action" type="button" onClick={() => onAdd("web")}>
            + Web
          </button>
          <button className="secondary-action button-action" type="button" onClick={() => onAdd("mobile")}>
            + Mobile
          </button>
          <button className="secondary-action button-action" type="button" onClick={() => onAdd("gestion")}>
            + Gestion
          </button>
        </div>
      </div>
      {projects.map((project, index) => (
        <div className="structured-item" key={`${project.name}-${index}`}>
          <div className="structured-item-title">
            <strong>Projet {index + 1}</strong>
            <div className="item-actions">
              <button className="text-action" type="button" onClick={() => onMove(index, -1)} disabled={index === 0}>
                Monter
              </button>
              <button className="text-action" type="button" onClick={() => onMove(index, 1)} disabled={index === projects.length - 1}>
                Descendre
              </button>
              <button className="text-action" type="button" onClick={() => onDuplicate(index)}>
                Dupliquer
              </button>
              <button className="text-action danger" type="button" onClick={() => onRemove(index)}>
                Supprimer
              </button>
            </div>
          </div>
          <TextField label="Nom" value={project.name} onChange={(value) => onUpdate(index, "name", value)} />
          <div className="project-logo-field">
            <div className="project-logo-preview">
              {project.logoUrl ? <img src={project.logoUrl} alt="" /> : <span>{project.name.slice(0, 2).toUpperCase()}</span>}
            </div>
            <div>
              <TextField label="Logo URL" value={project.logoUrl || ""} onChange={(value) => onUpdate(index, "logoUrl", value)} />
              <label className="cv-upload-button">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => onUploadLogo(index, event)}
                  disabled={uploadingLogoIndex === index}
                />
                {uploadingLogoIndex === index ? "Upload..." : "Ajouter logo"}
              </label>
            </div>
          </div>
          <div className="project-link-grid">
            <TextField label="Lien démo ou site" value={project.projectUrl || ""} onChange={(value) => onUpdate(index, "projectUrl", value)} />
            <TextField label="Lien GitHub" value={project.githubUrl || ""} onChange={(value) => onUpdate(index, "githubUrl", value)} />
            <TextField label="Lien APK" value={project.apkUrl || ""} onChange={(value) => onUpdate(index, "apkUrl", value)} />
          </div>
          <TextField label="Type" value={project.type} onChange={(value) => onUpdate(index, "type", value)} />
          <TextField label="Focus" value={project.focus} onChange={(value) => onUpdate(index, "focus", value)} />
          <TextAreaField label="Description" value={project.description} onChange={(value) => onUpdate(index, "description", value)} />
          <TextAreaField label="Détail pour la fiche projet" value={project.detail || ""} onChange={(value) => onUpdate(index, "detail", value)} />
          <div className="project-apk-field">
            <div>
              <span>APK téléchargeable</span>
              <strong>{project.apkName || project.apkUrl || "Aucun APK ajouté"}</strong>
            </div>
            <label className="cv-upload-button">
              <input
                type="file"
                accept=".apk,application/vnd.android.package-archive,application/octet-stream"
                onChange={(event) => onUploadApk(index, event)}
                disabled={uploadingApkIndex === index}
              />
              {uploadingApkIndex === index ? "Upload..." : "Ajouter APK"}
            </label>
          </div>
          <ProjectScreenshotsEditor
            project={project}
            projectIndex={index}
            uploadingScreenshotIndex={uploadingScreenshotIndex}
            onUploadScreenshot={onUploadScreenshot}
            onUpdateScreenshot={onUpdateScreenshot}
            onRemoveScreenshot={onRemoveScreenshot}
          />
          <TextField
            label="Tags séparés par des virgules"
            value={project.tags.join(", ")}
            onChange={(value) =>
              onUpdate(
                index,
                "tags",
                value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              )
            }
          />
        </div>
      ))}
    </div>
  );
}

function ProjectScreenshotsEditor({
  project,
  projectIndex,
  uploadingScreenshotIndex,
  onUploadScreenshot,
  onUpdateScreenshot,
  onRemoveScreenshot,
}: {
  project: ProjectItem;
  projectIndex: number;
  uploadingScreenshotIndex: number | null;
  onUploadScreenshot: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateScreenshot: (projectIndex: number, screenshotIndex: number, value: string) => void;
  onRemoveScreenshot: (projectIndex: number, screenshotIndex: number) => void;
}) {
  return (
    <div className="screenshots-editor">
      <div className="structured-editor-header">
        <span>Captures du projet</span>
        <label className="cv-upload-button">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => onUploadScreenshot(projectIndex, event)}
            disabled={uploadingScreenshotIndex === projectIndex}
          />
          {uploadingScreenshotIndex === projectIndex ? "Upload..." : "Ajouter capture"}
        </label>
      </div>
      {(project.screenshots || []).length ? (
        <div className="screenshot-list">
          {(project.screenshots || []).map((screenshot, screenshotIndex) => (
            <div className="screenshot-admin-item" key={`${screenshot.url}-${screenshotIndex}`}>
              <img src={screenshot.url} alt="" />
              <input
                aria-label={`Description capture ${screenshotIndex + 1}`}
                value={screenshot.alt || ""}
                placeholder="Description courte de la capture"
                onChange={(event) => onUpdateScreenshot(projectIndex, screenshotIndex, event.target.value)}
              />
              <button className="text-action" type="button" onClick={() => onRemoveScreenshot(projectIndex, screenshotIndex)}>
                Supprimer
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="admin-note">Aucune capture pour ce projet.</p>
      )}
    </div>
  );
}

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Réponse API invalide. Vérifie que le serveur API est lancé avec npm run api et que MongoDB est actif.",
    );
  }
}

function Header({
  language,
  theme,
  ui,
  onToggleLanguage,
  onToggleTheme,
}: {
  language: Language;
  theme: Theme;
  ui: UiCopy;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
}) {
  const activeSection = useActiveSection(navSectionIds);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const desktopQuery = window.matchMedia("(min-width: 1061px)");

    function handlePointerDown(event: PointerEvent) {
      if (headerRef.current?.contains(event.target as Node)) return;
      setIsMenuOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    function handleViewportChange(event: MediaQueryListEvent) {
      if (event.matches) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleViewportChange);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      desktopQuery.removeEventListener("change", handleViewportChange);
    };
  }, [isMenuOpen]);

  const links = navItemIds.map((id) => (
    <a
      key={id}
      href={`#${id}`}
      className={activeSection === id ? "is-active" : undefined}
      aria-current={activeSection === id ? "true" : undefined}
      onClick={() => setIsMenuOpen(false)}
    >
      {ui.nav[id]}
    </a>
  ));

  return (
    <header className={`site-nav ${isMenuOpen ? "is-open" : ""} ${activeSection === "systeme" && !isMenuOpen ? "dark-island" : ""}`} ref={headerRef}>
      <div className="nav-bar">
        <a className="nav-brand" href="#top" aria-label={ui.brandAria} title={ui.brandTitle}>
          Victoire Sawadogo
        </a>
        <nav className="nav-links" aria-label={ui.navAria}>
          {links}
        </nav>
        <div className="nav-tools">
          <button
            className="nav-tool"
            type="button"
            onClick={onToggleLanguage}
            aria-label={`${ui.languageToggleLabel}: ${ui.switchTo}`}
            title={`${ui.languageToggleLabel}: ${ui.switchTo}`}
          >
            <span aria-hidden="true">{language === "fr" ? "EN" : "FR"}</span>
          </button>
          <button
            className="nav-tool"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "light" ? ui.themeDark : ui.themeLight}
            title={theme === "light" ? ui.themeDark : ui.themeLight}
          >
            {theme === "light" ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
          </button>
          <button
            className="nav-menu-button"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="nav-sheet"
            aria-label={isMenuOpen ? ui.menuClose : ui.menuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen ? (
          <motion.nav
            id="nav-sheet"
            className="nav-sheet"
            aria-label={ui.navMenuAria}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: appleEase }}
          >
            {links}
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function useActiveSection(sectionIds: readonly string[]) {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-30% 0px -60% 0px",
        threshold: [0, 0.2, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection;
}

function usePortraitSrc() {
  const [src, setSrc] = useState("/portrait.jpeg");

  useEffect(() => {
    fetch(`/profile-manifest.json?t=${Date.now()}`)
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => {
        if (data.url) {
          setSrc(data.url);
        }
      })
      .catch(() => undefined);
  }, []);

  return [src, () => setSrc("/portrait.jpeg")] as const;
}

function Hero({ content, ui, theme }: { content: SiteContent; ui: UiCopy; theme: Theme }) {
  const heroRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -80]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduceMotion ? 1 : 0]);
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 0.82]);
  const visualOpacity = useTransform(scrollYProgress, [0, 0.9], [1, reduceMotion ? 1 : 0.2]);

  return (
    <section className="hero" id="top" ref={heroRef}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-grid">
        <motion.div className="hero-copy" style={{ y: copyY, opacity: copyOpacity }}>
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.p className="hero-status" variants={staggerItem}>
              <span aria-hidden="true" />
              {ui.availability}
            </motion.p>
            <motion.p className="hero-kicker" variants={staggerItem}>
              {content.profileCaption}
            </motion.p>
            <motion.h1 variants={staggerItem}>{content.heroTitle}</motion.h1>
            <motion.p className="hero-lead" variants={staggerItem}>
              {content.heroLead}
            </motion.p>
            <motion.div className="hero-actions" variants={staggerItem}>
              <a className="button button-primary" href="#projets">
                {ui.heroProjects}
              </a>
              <a className="button-link" href="#contact">
                {ui.heroContact} <ChevronRight size={18} aria-hidden="true" />
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div
          className="hero-visual"
          style={{ scale: visualScale, opacity: visualOpacity }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: appleEase }}
        >
          <SystemsGlobe labels={content.techMarquee} theme={theme} animate={!isE2E} ariaLabel={ui.heroVisualAria} />
          <p className="hero-visual-caption">{ui.heroVisualCaption}</p>
        </motion.div>
      </div>
      <RecruiterBrief content={content} ui={ui} />
    </section>
  );
}

function RecruiterBrief({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  const links = [
    { label: ui.recruiterBriefLinks.projects, href: "#projets", icon: BriefcaseBusiness },
    { label: ui.recruiterBriefLinks.resume, href: "#cv", icon: FileText },
    { label: ui.recruiterBriefLinks.contact, href: "#contact", icon: Mail },
  ];
  const icons = [Network, Layers3, ShieldCheck];

  return (
    <div className="container">
      <section className="brief" aria-label={ui.recruiterBriefAria}>
        <motion.dl
          className="brief-items"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          {content.metrics.map(([label, value], index) => {
            const Icon = icons[index] || Sparkles;
            return (
              <motion.div key={label} className="brief-item" variants={staggerItem}>
                <span className="tile-icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </motion.div>
            );
          })}
        </motion.dl>
        <nav className="brief-links" aria-label={ui.recruiterBriefLinksAria}>
          <span>{ui.recruiterBriefTitle}</span>
          {links.map(({ label, href, icon: Icon }) => (
            <a key={href} href={href}>
              <Icon size={15} aria-hidden="true" />
              {label}
            </a>
          ))}
        </nav>
      </section>
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
  intro,
  action,
}: {
  kicker: string;
  title: string;
  intro?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className={`section-heading ${action ? "has-action" : ""}`}>
      <motion.div
        initial={{ opacity: 0, y: 32, rotateX: 18 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: appleEase }}
        style={{ transformPerspective: 900, transformOrigin: "50% 100%" }}
      >
        <p className="kicker">{kicker}</p>
        <h2>{title}</h2>
        {intro ? <p className="section-intro">{intro}</p> : null}
      </motion.div>
      {action ? <div className="section-action">{action}</div> : null}
    </header>
  );
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: appleEase } },
};

// Gives an element a pointer-driven 3D tilt with a soft glare. Only active with a fine pointer
// and when the visitor has not asked for reduced motion.
function useTilt<T extends HTMLElement>(maxDegrees = 6) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    function handleMove(event: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element!.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        element!.style.setProperty("--tilt-x", `${(0.5 - y) * maxDegrees}deg`);
        element!.style.setProperty("--tilt-y", `${(x - 0.5) * maxDegrees}deg`);
        element!.style.setProperty("--glare-x", `${x * 100}%`);
        element!.style.setProperty("--glare-y", `${y * 100}%`);
        element!.classList.add("is-tilting");
      });
    }

    function handleLeave() {
      cancelAnimationFrame(frame);
      element!.style.setProperty("--tilt-x", "0deg");
      element!.style.setProperty("--tilt-y", "0deg");
      element!.classList.remove("is-tilting");
    }

    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerleave", handleLeave);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", handleMove);
      element.removeEventListener("pointerleave", handleLeave);
    };
  }, [maxDegrees]);

  return ref;
}

type ShellEntry = {
  directory?: string;
  command?: string;
  output: string[];
};

function TerminalPanel({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  const [input, setInput] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [currentDirectory, setCurrentDirectory] = useState("/home/victoire");
  const [mode, setMode] = useState<ShellMode>("bash");
  const [aliases, setAliases] = useState<Record<string, string>>(defaultAliases);
  const [memory, setMemory] = useState<VictoireMemory>(() => loadVictoireMemory());
  const [entries, setEntries] = useState<ShellEntry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [entries]);

  useEffect(() => {
    saveVictoireMemory(memory);
  }, [memory]);

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || !event.ctrlKey) return;
      event.preventDefault();
      setPaletteOpen((current) => !current);
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  function submitCommand(rawCommand = input) {
    const typedCommand = rawCommand.trim();
    const command = expandAlias(typedCommand, aliases);
    if (!command) return;

    if (command.toLowerCase() === "clear") {
      setEntries([]);
      setInput("");
      setHistory((current) => [...current, typedCommand]);
      setMemory((current) => updateMemoryAfterCommand(current, command, content));
      setHistoryIndex(null);
      return;
    }

    if (command.toLowerCase() === "reboot") {
      setEntries([]);
      setCurrentDirectory("/home/victoire");
      setMode("bash");
      setAliases(defaultAliases);
      setInput("");
      setHistory((current) => [...current, typedCommand]);
      setMemory((current) => updateMemoryAfterCommand(current, command, content));
      setHistoryIndex(null);
      setPaletteOpen(false);
      return;
    }

    const context: ShellContext = { memory, entriesCount: entries.length };
    const result = resolveShellCommand(command, content, currentDirectory, mode, history, aliases, context, {
      openSection: (sectionId) => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" }),
      openProject: (projectName, intent) => {
        window.dispatchEvent(new CustomEvent("victoire-os:project", {
          detail: { projectName, intent },
        }));
      },
      downloadApk: (apkUrl) => {
        window.location.href = apkUrl;
      },
    });
    const commandMemory = updateMemoryAfterCommand(memory, command, content);
    const nextMemory = result.nextMemory
      ? command.toLowerCase() === "memory clear" || command.toLowerCase() === "commands clear"
        ? result.nextMemory
        : { ...commandMemory, ...result.nextMemory, commands: commandMemory.commands }
      : commandMemory;
    const coachOutput = nextMemory.coach ? getCoachAdvice(command, result.output, nextMemory, content) : [];
    setEntries((current) => [
      ...current.slice(-2),
      { directory: currentDirectory, command: typedCommand, output: [...result.output, ...coachOutput].slice(0, 8) },
    ]);
    if (result.nextDirectory) {
      setCurrentDirectory(result.nextDirectory);
    }
    if (result.nextMode) {
      setMode(result.nextMode);
    }
    if (result.nextAliases) {
      setAliases(result.nextAliases);
    }
    setMemory(nextMemory);
    setHistory((current) => [...current, typedCommand]);
    setHistoryIndex(null);
    setInput("");
    setPaletteOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitCommand();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInput("");
        return;
      }
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const completed = completeCommand(input, currentDirectory, content, aliases);
      setInput(completed);
    }

    if (event.key.toLowerCase() === "l" && event.ctrlKey) {
      event.preventDefault();
      submitCommand("clear");
    }
  }

  return (
    <motion.aside
      className="terminal-panel"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: appleEase }}
      aria-label={ui.terminal.loadingAria}
    >
      <div className="terminal-top">
        <span className="terminal-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <strong>{ui.terminal.title}</strong>
        <em>{ui.terminal.simple}</em>
      </div>
      <div className="terminal-intro">
        <p>{ui.terminal.loadingLineOne}</p>
        <span>{ui.terminal.loadingLineTwo}</span>
      </div>
      <div className="terminal-quick-actions" aria-label={ui.terminal.quickActionsAria}>
        {[
          { label: ui.terminal.viewProjects, command: "projects" },
          { label: ui.terminal.recruiterPath, command: "whoami" },
          { label: ui.terminal.developerMode, command: "hire --contact" },
        ].map((action) => (
          <button key={action.command} type="button" onClick={() => submitCommand(action.command)}>
            {action.label}
          </button>
        ))}
      </div>
      {paletteOpen ? (
        <div className="terminal-palette" role="dialog" aria-label={ui.terminal.paletteAria}>
          <input
            value={paletteQuery}
            onChange={(event) => setPaletteQuery(event.target.value)}
            placeholder={ui.terminal.palettePlaceholder}
            autoFocus
          />
          <div>
            {getPaletteItems(paletteQuery, currentDirectory, content, aliases).slice(0, 8).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => {
                  setInput(item);
                  setPaletteOpen(false);
                  inputRef.current?.focus();
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div
        className="terminal-body"
        ref={bodyRef}
        onClick={() => inputRef.current?.focus()}
        role="log"
        aria-live="polite"
      >
        {entries.slice(-3).map((entry, index) => (
          <div className="terminal-entry" key={`${entry.command || "intro"}-${index}`}>
            {entry.command ? (
              <code className="terminal-command">
                {entry.command}
              </code>
            ) : null}
            {entry.output.map((line, lineIndex) => (
              <p key={`${line}-${lineIndex}`}>{line}</p>
            ))}
          </div>
        ))}
        <form className="terminal-form" onSubmit={handleSubmit}>
          <label>
            <span>{ui.terminal.help}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="projects, contact, whoami..."
              autoComplete="off"
              spellCheck={false}
              aria-label={ui.terminal.commandInputAria}
            />
          </label>
        </form>
      </div>
    </motion.aside>
  );
}

function SystemLayers({ ui, language }: { ui: UiCopy; language: Language }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const isStatic = Boolean(reduceMotion) || isE2E;
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const gap = useTransform(scrollYProgress, [0, 0.14], ["14px", "74px"]);
  const tiltX = useTransform(scrollYProgress, [0, 1], [60, 50]);
  const spin = useTransform(scrollYProgress, [0, 1], [-44, -26]);
  const stageTransform = useMotionTemplate`rotateX(${tiltX}deg) rotateZ(${spin}deg)`;
  const activeLayer = systemLayers[activeIndex];

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const step = Math.floor(((value - 0.06) / 0.94) * systemLayers.length);
    setActiveIndex(Math.min(systemLayers.length - 1, Math.max(0, step)));
  });

  const stageStyle = (isStatic ? { "--gap": "64px" } : { transform: stageTransform, "--gap": gap }) as unknown as MotionStyle;

  return (
    <section
      className={`layers dark-island ${isStatic ? "is-static" : ""}`}
      id="systeme"
      ref={sectionRef}
      aria-labelledby="layers-title"
      style={{ "--steps": systemLayers.length } as React.CSSProperties}
    >
      <div className="layers-sticky">
        <div className="container layers-grid">
          <div className="layers-copy">
            <p className="kicker">{ui.layersKicker}</p>
            <h2 id="layers-title">{ui.layersTitle}</h2>
            {isStatic ? (
              <ol className="layers-list">
                {systemLayers.map((layer, index) => (
                  <li key={layer.id}>
                    <LayerText layer={layer} index={index} ui={ui} language={language} />
                  </li>
                ))}
              </ol>
            ) : (
              <>
                <div className="layers-step" aria-live="polite">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeLayer.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.32, ease: appleEase }}
                    >
                      <LayerText layer={activeLayer} index={activeIndex} ui={ui} language={language} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="layers-progress" aria-hidden="true">
                  {systemLayers.map((layer, index) => (
                    <span
                      key={layer.id}
                      className={index === activeIndex ? "is-active" : index < activeIndex ? "is-done" : undefined}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="layers-visual" aria-hidden="true">
            <motion.div className="layers-stage" style={stageStyle}>
              {systemLayers.map((layer, index) => (
                <div
                  key={layer.id}
                  className={`layer-plane ${!isStatic && index === activeIndex ? "is-active" : ""}`}
                  style={{ "--z": systemLayers.length - 1 - index } as React.CSSProperties}
                >
                  <span className="layer-plane-title">{layer.title[language]}</span>
                  <span className="layer-plane-tech">{layer.tech.slice(0, 3).join(" · ")}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LayerText({
  layer,
  index,
  ui,
  language,
}: {
  layer: (typeof systemLayers)[number];
  index: number;
  ui: UiCopy;
  language: Language;
}) {
  function openProject(projectName: string) {
    window.dispatchEvent(new CustomEvent("victoire-os:project", { detail: { projectName, intent: "peek" } }));
  }

  return (
    <div className="layer-text">
      <span className="layer-index">
        {String(index + 1).padStart(2, "0")} / {String(systemLayers.length).padStart(2, "0")}
      </span>
      <h3>{layer.title[language]}</h3>
      <p>{layer.text[language]}</p>
      <ul className="tag-list">
        {layer.tech.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>
      <div className="layer-proofs">
        <span>{ui.certificationsProofs}</span>
        {layer.proofs.map((projectName) => (
          <button key={projectName} type="button" onClick={() => openProject(projectName)}>
            {projectName} <ArrowUpRight size={14} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

// Lights a sentence up word by word as it scrolls through the viewport.
function ScrollRevealText({ text, className }: { text: string; className: string }) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.55"] });
  const words = text.split(" ");

  if (reduceMotion || isE2E) {
    return (
      <p className={className} ref={ref}>
        {text}
      </p>
    );
  }

  return (
    <p className={className} ref={ref}>
      {words.map((word, index) => (
        <RevealWord key={`${word}-${index}`} word={word} progress={scrollYProgress} range={[index / words.length, (index + 1) / words.length]} />
      ))}
    </p>
  );
}

function RevealWord({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{word}</motion.span>{" "}
    </>
  );
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const skipAnimation = Boolean(reduceMotion) || isE2E;
  const [display, setDisplay] = useState(skipAnimation ? value : 0);

  useEffect(() => {
    if (skipAnimation) {
      setDisplay(value);
      return;
    }
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: appleEase,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, skipAnimation, value]);

  return <span ref={ref}>{display}</span>;
}

function About({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  const [portraitSrc, resetPortrait] = usePortraitSrc();
  const portraitRef = useTilt<HTMLElement>(8);
  const [statement, ...facts] = content.aboutParagraphs;
  const factIcons = [BriefcaseBusiness, GraduationCap, Globe2];

  return (
    <RevealSection className="section section-alt" id="profil">
      <div className="container">
        <SectionHeading kicker={ui.sectionKickers.profile} title={content.aboutTitle} />
        <div className="about-layout">
          <figure className="portrait-card tilt" ref={portraitRef}>
            <img
              src={portraitSrc}
              alt="Portrait de Victoire Sawadogo"
              width={896}
              height={1003}
              loading="lazy"
              onError={resetPortrait}
            />
            <figcaption>
              <strong>Victoire Sawadogo</strong>
              <span>{content.heroEyebrow}</span>
            </figcaption>
          </figure>
          <div className="about-body">
            {statement ? <ScrollRevealText className="about-statement" text={statement} /> : null}
            <motion.div
              className="fact-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              {facts.map((fact, index) => {
                const Icon = factIcons[index] || Sparkles;
                return (
                  <motion.article className="tile fact" key={fact} variants={staggerItem}>
                    <span className="tile-icon" aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <p>{fact}</p>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </div>
        <div className="pillars" id="identite">
          <div className="pillars-head">
            <h3>{content.identityTitle}</h3>
            <p>{content.identityIntro}</p>
          </div>
          <motion.div
            className="pillar-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            {content.identityPillars.map((pillar, index) => (
              <motion.article key={pillar.title} className="tile pillar" variants={staggerItem}>
                <span className="pillar-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h4>{pillar.title}</h4>
                <p>{pillar.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </RevealSection>
  );
}

function Journey({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  return (
    <RevealSection className="section section-alt" id="parcours">
      <div className="container">
        <SectionHeading kicker={ui.sectionKickers.journey} title={content.journeyTitle} intro={content.journeyIntro} />
        <div className="journey-grid">
          <TimelineColumn
            icon={<BriefcaseBusiness size={20} aria-hidden="true" />}
            title={ui.journeyProfessional}
            items={content.professionalTimeline}
          />
          <TimelineColumn
            icon={<GraduationCap size={20} aria-hidden="true" />}
            title={ui.journeyAcademic}
            items={content.academicTimeline}
          />
        </div>
      </div>
    </RevealSection>
  );
}

function TimelineColumn({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: { period: string; title: string; detail: string }[];
}) {
  return (
    <div className="tile timeline">
      <h3 className="timeline-title">
        {icon}
        <span>{title}</span>
      </h3>
      <ol>
        {items.map((item) => (
          <li key={`${item.period}-${item.title}`}>
            <span className="timeline-period">{item.period}</span>
            <h4>{item.title}</h4>
            <p>{item.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Stack({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  const [activeTitle, setActiveTitle] = useState(content.stacks[0]?.title || "");
  const activeGroup = content.stacks.find((group) => group.title === activeTitle) || content.stacks[0];

  useEffect(() => {
    if (!content.stacks.some((group) => group.title === activeTitle)) {
      setActiveTitle(content.stacks[0]?.title || "");
    }
  }, [activeTitle, content.stacks]);

  return (
    <RevealSection className="section section-alt" id="stack">
      <div className="container">
        <SectionHeading kicker={ui.sectionKickers.stack} title={ui.stackTitle} intro={ui.stackIntro} />
        <div className="stack-tabs segmented" role="tablist" aria-label={ui.stackTabsAria}>
          {content.stacks.map((group) => {
            const Icon = stackIcons[group.title as keyof typeof stackIcons] || Layers3;
            const isActive = group.title === activeGroup?.title;
            return (
              <button
                key={group.title}
                type="button"
                role="tab"
                id={`stack-tab-${slugify(group.title)}`}
                aria-selected={isActive}
                aria-controls="stack-panel"
                className={isActive ? "is-active" : undefined}
                onClick={() => setActiveTitle(group.title)}
              >
                <Icon size={15} aria-hidden="true" />
                {group.title}
                <span className="stack-tab-count">{group.items.length}</span>
              </button>
            );
          })}
        </div>
        {activeGroup ? (
          <div
            className="stack-panel"
            id="stack-panel"
            role="tabpanel"
            aria-labelledby={`stack-tab-${slugify(activeGroup.title)}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={activeGroup.title}
                className="tech-grid"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -12, transition: { duration: 0.18 } }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.035 } } }}
              >
                {activeGroup.items.map((item) => (
                  <motion.li
                    key={item.name}
                    className="tech-tile"
                    variants={{
                      hidden: { opacity: 0, y: 18, rotateX: -30 },
                      visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.55, ease: appleEase } },
                    }}
                    style={{ transformPerspective: 600 }}
                  >
                    <span className="tech-logo">
                      <img src={item.logo} alt="" loading="lazy" width={40} height={40} />
                    </span>
                    <span>{item.name}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </RevealSection>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function FlowDiagram({
  projectName,
  language,
  variant,
  label,
}: {
  projectName: string;
  language: Language;
  variant: "compact" | "full";
  label: string;
}) {
  const nodes = getArchitecture(projectName);
  if (!nodes.length) return null;

  return (
    <div className={`flow flow-${variant}`}>
      {variant === "full" ? <p className="flow-label">{label}</p> : null}
      <ol className="flow-track" aria-label={label}>
        {nodes.map((node, index) => (
          <li key={`${getNodeName(node, language)}-${index}`} className="flow-step" style={{ "--i": index } as React.CSSProperties}>
            {index > 0 ? <span className="flow-link" aria-hidden="true" /> : null}
            <span className="flow-node">
              <strong>{getNodeName(node, language)}</strong>
              {variant === "full" ? <small>{node.role[language]}</small> : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Projects({ content, ui, language }: { content: SiteContent; ui: UiCopy; language: Language }) {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [projectQuery, setProjectQuery] = useState("");
  const [activeProjectTag, setActiveProjectTag] = useState(ui.allProjects);
  const projectTags = getProjectTags(content.projects, ui.allProjects);
  const filteredProjects = filterProjects(content.projects, projectQuery, activeProjectTag, ui.allProjects);

  useEffect(() => {
    setActiveProjectTag(ui.allProjects);
  }, [ui.allProjects]);

  useEffect(() => {
    function handleProjectIntent(event: Event) {
      const detail = (event as CustomEvent<{ projectName?: string; intent?: string }>).detail;
      if (!detail?.projectName) return;
      const project = content.projects.find((item) => item.name === detail.projectName);
      if (!project) return;
      setProjectQuery("");
      setActiveProjectTag(ui.allProjects);
      if (detail.intent !== "peek") {
        document.getElementById("projets")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setSelectedProject(project);
    }

    window.addEventListener("victoire-os:project", handleProjectIntent);
    return () => window.removeEventListener("victoire-os:project", handleProjectIntent);
  }, [content.projects, ui.allProjects]);

  useEffect(() => {
    if (!selectedProject) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedProject(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject]);

  return (
    <RevealSection className="section" id="projets">
      <div className="container">
        <SectionHeading
          kicker={ui.sectionKickers.projects}
          title={ui.projectsTitle}
          action={
            <a className="button-link" href="#contact">
              {ui.projectsCta} <ChevronRight size={18} aria-hidden="true" />
            </a>
          }
        />
        <div className="project-controls" aria-label={ui.projectFiltersAria} role="group">
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <span className="visually-hidden">{ui.projectSearchLabel}</span>
            <input
              type="search"
              value={projectQuery}
              onChange={(event) => setProjectQuery(event.target.value)}
              placeholder={ui.projectSearchPlaceholder}
            />
          </label>
          <div className="segmented" role="group" aria-label={ui.projectFilterAria}>
            {projectTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={activeProjectTag === tag ? "is-active" : undefined}
                aria-pressed={activeProjectTag === tag}
                onClick={() => setActiveProjectTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <motion.div
          className="project-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          variants={staggerContainer}
        >
          {filteredProjects.map((project, index) => (
            <motion.div className="project-cell" key={project.name} variants={staggerItem}>
              <ProjectCard
                project={project}
                featured={index === 0}
                ui={ui}
                language={language}
                onOpen={() => setSelectedProject(project)}
              />
            </motion.div>
          ))}
        </motion.div>
        {!filteredProjects.length ? (
          <div className="tile project-empty-state">
            <strong>{ui.noProjectTitle}</strong>
            <p>{ui.noProjectText}</p>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setProjectQuery("");
                setActiveProjectTag(ui.allProjects);
              }}
            >
              {ui.reset}
            </button>
          </div>
        ) : null}
      </div>
      <AnimatePresence>
        {selectedProject ? (
          <ProjectDetailModal
            key={selectedProject.name}
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            ui={ui}
            language={language}
          />
        ) : null}
      </AnimatePresence>
    </RevealSection>
  );
}

function ProjectCard({
  project,
  featured,
  ui,
  language,
  onOpen,
}: {
  project: ProjectItem;
  featured: boolean;
  ui: UiCopy;
  language: Language;
  onOpen: () => void;
}) {
  const tiltRef = useTilt<HTMLElement>(featured ? 3 : 6);
  const hasFlow = getArchitecture(project.name).length > 0;
  const cover = project.screenshots?.[0];
  const showMedia = featured && Boolean(cover);
  const showFullFlow = featured && !cover && hasFlow;

  return (
    <article
      ref={tiltRef}
      className={`project-card tilt ${featured ? "is-featured" : ""} ${showMedia || showFullFlow ? "has-visual" : ""}`}
      tabIndex={0}
      role="button"
      aria-label={`${ui.projectOpenAria} ${project.name}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="project-card-main">
        <div className="project-card-head">
          {project.logoUrl ? (
            <span className="project-logo" aria-hidden="true">
              <img src={project.logoUrl} alt="" loading="lazy" />
            </span>
          ) : null}
          <span className="project-type">{project.type}</span>
          {project.privateRepo ? <LockKeyhole size={16} aria-hidden="true" /> : null}
          {project.githubUrl || project.source === "github" ? <Github size={17} aria-hidden="true" /> : null}
        </div>
        <h3>{project.name}</h3>
        <p className="project-focus">{project.focus}</p>
        {featured ? <p className="project-description">{project.description}</p> : null}
        {!showFullFlow ? (
          <FlowDiagram projectName={project.name} language={language} variant="compact" label={ui.architectureLabel} />
        ) : null}
        <ul className="tag-list" aria-label="Technologies">
          {project.tags.slice(0, featured ? 6 : 3).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <span className="project-more" aria-hidden="true">
          {ui.view} <ChevronRight size={17} />
        </span>
      </div>
      {showMedia && cover ? (
        <div className="project-card-visual is-media">
          <img src={cover.url} alt={cover.alt || `${ui.projectPreviewAlt} ${project.name}`} loading="lazy" />
        </div>
      ) : null}
      {showFullFlow ? (
        <div className="project-card-visual">
          <FlowDiagram projectName={project.name} language={language} variant="full" label={ui.architectureLabel} />
        </div>
      ) : null}
    </article>
  );
}

function ProjectDetailModal({
  project,
  onClose,
  ui,
  language,
}: {
  project: ProjectItem;
  onClose: () => void;
  ui: UiCopy;
  language: Language;
}) {
  const screenshots = project.screenshots || [];
  const cover = screenshots[0]?.url || "";
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Keeps keyboard focus inside the dialog and hands it back to the card on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <motion.div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.34, ease: appleEase }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label={ui.close} autoFocus>
          <X size={18} aria-hidden="true" />
        </button>
        {cover ? (
          <div className="modal-media">
            <img src={cover} alt={screenshots[0]?.alt || `${ui.projectPreviewAlt} ${project.name}`} />
          </div>
        ) : null}
        <div className="modal-body">
          <div className="modal-heading">
            {project.logoUrl ? (
              <span className="project-logo" aria-hidden="true">
                <img src={project.logoUrl} alt="" />
              </span>
            ) : null}
            <p className="project-type">{project.type}</p>
          </div>
          <h3 id="project-modal-title">{project.name}</h3>
          <p className="project-focus">{project.focus}</p>
          <FlowDiagram projectName={project.name} language={language} variant="full" label={ui.architectureLabel} />
          <p className="modal-detail">{project.detail || project.description}</p>
          {project.source === "github" ? (
            <div className="modal-meta" aria-label={`Métadonnées GitHub pour ${project.name}`}>
              {project.githubRepo ? <span>{project.githubRepo}</span> : null}
              {project.githubUpdatedAt ? <span>{ui.updatedLong} {formatRelativeProjectDate(project.githubUpdatedAt, language)}</span> : null}
              <span>{project.githubStars || 0} {(project.githubStars || 0) > 1 ? ui.stars : ui.star}</span>
              <span>{project.githubForks || 0} {(project.githubForks || 0) > 1 ? ui.forks : ui.fork}</span>
            </div>
          ) : null}
          <ul className="tag-list">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          {screenshots.length > 1 ? (
            <div className="project-gallery" aria-label={ui.projectGalleryAria}>
              {screenshots.slice(1).map((screenshot, index) => (
                <img key={`${screenshot.url}-${index}`} src={screenshot.url} alt={screenshot.alt || `${ui.projectScreenshotAlt} ${index + 2} - ${project.name}`} />
              ))}
            </div>
          ) : null}
          <div className="modal-actions">
            {project.privateRepo && !project.githubUrl ? (
              <>
                <a className="button button-primary" href="#contact" onClick={onClose}>
                  {ui.requestDemo} <ChevronRight size={17} aria-hidden="true" />
                </a>
                <span className="private-note">
                  <LockKeyhole size={15} aria-hidden="true" /> {ui.privateRepoNote}
                </span>
              </>
            ) : null}
            {project.projectUrl ? (
              <a className="button button-primary" href={project.projectUrl} target="_blank" rel="noreferrer">
                {ui.viewProject} <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            ) : null}
            {project.apkUrl ? (
              <a className="button button-secondary" href={project.apkUrl} download>
                {ui.downloadApk} <Download size={17} aria-hidden="true" />
              </a>
            ) : null}
            {project.githubUrl && project.githubUrl !== project.projectUrl ? (
              <a className={`button ${project.projectUrl ? "button-secondary" : "button-primary"}`} href={project.githubUrl} target="_blank" rel="noreferrer">
                {ui.viewCode} <Github size={17} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function formatRelativeProjectDate(value: string, language: Language) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function CvSection({ ui }: { ui: UiCopy }) {
  const [cvInfo, setCvInfo] = useState<CvInfo | null>(null);

  useEffect(() => {
    fetch(`/cv-manifest.json?t=${Date.now()}`)
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => setCvInfo(data))
      .catch(() => {
        fetch("/cv.pdf", { method: "HEAD" })
          .then((response) => {
            setCvInfo(response.ok ? { url: "/cv.pdf", type: "pdf" } : null);
          })
          .catch(() => setCvInfo(null));
      });
  }, []);

  const cvUrl = cvInfo?.url || "/cv.pdf";

  return (
    <RevealSection className="section section-alt" id="cv">
      <div className="container">
        <div className="tile cv-card">
          <div className="cv-icon" aria-hidden="true">
            <FileText size={28} />
          </div>
          <div className="cv-copy">
            <p className="kicker">{ui.nav.cv}</p>
            <h2>{ui.cvTitle}</h2>
            <p>{cvInfo ? ui.cvAvailableText : ui.cvMissingText}</p>
          </div>
          <div className="cv-actions">
            <a className="button button-secondary" href={cvUrl} target="_blank" rel="noreferrer">
              <Eye size={17} aria-hidden="true" /> {ui.cvView}
            </a>
            <a className="button button-primary" href={cvUrl} download>
              <Download size={17} aria-hidden="true" /> {ui.cvDownload}
            </a>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

function CertificationsSection({ ui, language }: { ui: UiCopy; language: Language }) {
  const [certificationsInfo, setCertificationsInfo] = useState<CvInfo | null>(null);
  const stats = getCertificationStats();

  useEffect(() => {
    fetch(`/certifications-manifest.json?t=${Date.now()}`)
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => setCertificationsInfo(data))
      .catch(() => {
        fetch("/certifications.pdf", { method: "HEAD" })
          .then((response) => {
            setCertificationsInfo(response.ok ? { url: "/certifications.pdf", type: "pdf" } : null);
          })
          .catch(() => setCertificationsInfo(null));
      });
  }, []);

  return (
    <RevealSection className="section" id="certifications">
      <div className="container">
        <SectionHeading
          kicker={ui.certificationsKicker}
          title={ui.certificationsTitle}
          intro={ui.certificationsIntro}
          action={
            certificationsInfo ? (
              <a className="button-link" href={certificationsInfo.url} target="_blank" rel="noreferrer">
                {ui.certificationsView} <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            ) : null
          }
        />
        <dl className="cert-stats" aria-label={ui.certificationsStatsAria}>
          {(["total", "verifiable", "issuers", "domains"] as const).map((key) => (
            <div key={key}>
              <dt>{ui.certificationsStats[key]}</dt>
              <dd>
                <CountUp value={stats[key]} />
              </dd>
            </div>
          ))}
        </dl>
        <div className="cert-grid">
          {certificationDomains.map((domain) => {
            const featured = domain.certifications.filter((certification) => certification.featured);
            const others = domain.certifications.filter((certification) => !certification.featured);
            return (
              <article className="tile cert-card" key={domain.id}>
                <header>
                  <h3>{domain.label[language]}</h3>
                  <span className="cert-count">{domain.certifications.length}</span>
                </header>
                <span className="cert-bar" aria-hidden="true">
                  <i style={{ width: `${(domain.certifications.length / stats.total) * 100}%` }} />
                </span>
                <ul className="cert-list">
                  {featured.map((certification) => (
                    <CertificationRow key={certification.title} certification={certification} ui={ui} language={language} />
                  ))}
                </ul>
                {others.length ? (
                  <details className="cert-more">
                    <summary>
                      {ui.certificationsMore.replace("{count}", String(others.length))}
                      <ChevronDown size={16} aria-hidden="true" />
                    </summary>
                    <ul className="cert-list">
                      {others.map((certification) => (
                        <CertificationRow key={certification.title} certification={certification} ui={ui} language={language} />
                      ))}
                    </ul>
                  </details>
                ) : null}
                {domain.proofs.length ? (
                  <footer className="cert-proofs">
                    <span>{ui.certificationsProofs}</span>
                    <div>
                      {domain.proofs.map((proof) => (
                        <a key={proof.repo} href={getProofUrl(proof)} target="_blank" rel="noreferrer">
                          <Github size={13} aria-hidden="true" /> {proof.label}
                        </a>
                      ))}
                    </div>
                  </footer>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </RevealSection>
  );
}

function CertificationRow({ certification, ui, language }: { certification: Certification; ui: UiCopy; language: Language }) {
  const credentialUrl = getCredentialUrl(certification);
  // Dates are shown for full programmes only: a wall of single-course dates reads as box-ticking.
  const issued = certification.kind ? formatIssuedDate(certification.issued, language) : "";

  return (
    <li>
      <div>
        <strong>{certification.title}</strong>
        <span>
          {certification.issuer}
          {issued ? ` · ${issued}` : ""}
        </span>
      </div>
      {credentialUrl ? (
        <a
          href={credentialUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`${ui.certificationsVerify} ${certification.title}`}
        >
          {ui.certificationsVerify} <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      ) : null}
    </li>
  );
}

function Lab({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  return (
    <RevealSection className="section" id="labo">
      <div className="container">
        <SectionHeading kicker={ui.sectionKickers.lab} title={content.labTitle} intro={content.labIntro} />
        <div className="lab-grid">
          <TerminalPanel content={content} ui={ui} />
          <aside className="tile lab-ideas" aria-label={ui.labIdeasTitle}>
            <h3>{ui.labIdeasTitle}</h3>
            <ul>
              {content.labs.map((item) => (
                <li key={item}>
                  <Sparkles size={17} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </RevealSection>
  );
}

function Contact({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  return (
    <RevealSection className="section contact" id="contact">
      <div className="container contact-inner">
        <p className="kicker">{ui.sectionKickers.contact}</p>
        <h2>{content.contactTitle}</h2>
        <p className="section-intro">{content.contactText}</p>
        <div className="contact-actions">
          <a className="button button-primary" href={`mailto:${content.contactLinks.email}`}>
            <Mail size={17} aria-hidden="true" /> Email
          </a>
          <a className="button button-secondary" href={content.contactLinks.linkedin} target="_blank" rel="noreferrer">
            <Linkedin size={17} aria-hidden="true" /> LinkedIn
          </a>
          <a className="button button-secondary" href={content.contactLinks.github} target="_blank" rel="noreferrer">
            <Github size={17} aria-hidden="true" /> GitHub
          </a>
          <a className="button button-secondary" href={content.contactLinks.whatsapp} target="_blank" rel="noreferrer">
            <MessageCircle size={17} aria-hidden="true" /> WhatsApp
          </a>
        </div>
      </div>
    </RevealSection>
  );
}

function Footer({ ui }: { ui: UiCopy }) {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>© {new Date().getFullYear()} Victoire Sawadogo. {ui.footerNote}</p>
        <nav aria-label={ui.footerAria}>
          <a href="#top">{ui.backToTop}</a>
          <a href="/login">{ui.adminLink}</a>
        </nav>
      </div>
    </footer>
  );
}

function RevealSection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className: string;
  id?: string;
}) {
  return (
    <motion.section
      className={className}
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.7, ease: appleEase }}
    >
      {children}
    </motion.section>
  );
}

export default App;
