import { lazy, Suspense, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Lenis from "lenis";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Activity,
  BriefcaseBusiness,
  Code2,
  Cpu,
  Download,
  Eye,
  FileText,
  GitBranch,
  GraduationCap,
  Github,
  Home,
  Layers3,
  Linkedin,
  LockKeyhole,
  LogOut,
  Mail,
  MessageCircle,
  Rocket,
  ServerCog,
  ShieldCheck,
  Moon,
  Smartphone,
  Sun,
  Terminal,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  clearAdminDraft,
  formatDateTime,
  getContentSnapshot,
  readAdminDraft,
  stripRuntimeFields,
  writeAdminDraft,
} from "./utils/adminDraft";
import { cloneItem, moveItem } from "./utils/collections";
import { filterProjects, getProjectTags } from "./utils/projectFilters";
import { resolveShellCommand, type ShellContext } from "./victoire-os/shell/commands";
import { expandAlias, getBootOutput, toTildePath } from "./victoire-os/shell/core";
import { getAutopilotPulse, getCoachAdvice } from "./victoire-os/shell/insights";
import { loadVictoireMemory, saveVictoireMemory } from "./victoire-os/shell/memory";
import { getNextBestCommand, updateMemoryAfterCommand } from "./victoire-os/shell/missions";
import {
  completeCommand,
  defaultAliases,
  getPaletteItems,
} from "./victoire-os/shell/suggestions";
import type { ShellMode, VictoireMemory } from "./victoire-os/types";
import { enLocale } from "./i18n/en";
import { frLocale } from "./i18n/fr";
import type { IdentityPillar, Language, ProjectItem, SiteContent, StackGroup, TimelineItem, UiCopy } from "./i18n/types";

const locales = {
  fr: frLocale,
  en: enLocale,
} satisfies Record<Language, typeof frLocale>;

const WorldScene = lazy(() => import("./WorldScene"));

const navItemIds = ["top", "profil", "parcours", "stack", "projets", "labo", "cv", "certifications", "contact"] as const;
const navSectionIds = [...navItemIds];
const navIcons: Record<(typeof navItemIds)[number], LucideIcon> = {
  top: Home,
  profil: UserRound,
  parcours: GraduationCap,
  stack: Cpu,
  projets: Layers3,
  labo: Terminal,
  cv: FileText,
  certifications: ShieldCheck,
  contact: Mail,
};

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

type ThemeMode = "dark" | "light";

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
};

function App() {
  const isLoginRoute = window.location.pathname === "/login";
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [worldMode, setWorldMode] = useState<"explore" | "understand">("explore");
  const locale = locales[language];
  const [content, setContent] = useState<SiteContent>(locale.content);

  useEffect(() => {
    localStorage.setItem("portfolio_language", language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem("portfolio_theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (isLoginRoute) return;

    let isMounted = true;

    async function loadPublicContent() {
      let nextContent = locale.content;

      if (language === "fr") {
        try {
          const contentResponse = await fetch("/api/content");
          if (contentResponse.ok) {
            const data = await readJsonResponse(contentResponse);
            if (data.content) {
              nextContent = mergeContent(data.content, locale.content);
            }
          }
        } catch {
          nextContent = locale.content;
        }
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
  }, [isLoginRoute, language, locale.content]);

  useEffect(() => {
    if (isLoginRoute) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return isLoginRoute ? (
    <LoginPage />
  ) : (
    <main className="site-shell seven-world" data-world-mode={worldMode}>
      <ScrollProgress />
      <a className="skip-link" href="#profil">
        {locale.ui.skipLink}
      </a>
      <AmbientBackground />
      <WorldGuide mode={worldMode} onChangeMode={setWorldMode} />
      <Header
        language={language}
        theme={theme}
        ui={locale.ui}
        onToggleLanguage={() => setLanguage(language === "fr" ? "en" : "fr")}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <Hero content={content} ui={locale.ui} worldMode={worldMode} />
      <RecruiterBrief ui={locale.ui} />
      <About content={content} ui={locale.ui} />
      <Identity content={content} ui={locale.ui} />
      <Journey content={content} ui={locale.ui} />
      <Stack content={content} ui={locale.ui} />
      <Projects content={content} ui={locale.ui} language={language} />
      <Lab content={content} ui={locale.ui} />
      <CvSection ui={locale.ui} />
      <CertificationsSection ui={locale.ui} />
      <Contact content={content} ui={locale.ui} />
    </main>
  );
}

function WorldGuide({
  mode,
  onChangeMode,
}: {
  mode: "explore" | "understand";
  onChangeMode: (mode: "explore" | "understand") => void;
}) {
  const zones = [
    ["profil", "Le Noyau"],
    ["stack", "La Bibliothèque"],
    ["projets", "Le Laboratoire"],
    ["parcours", "Les Archives"],
    ["labo", "SevenOS"],
    ["contact", "Le Portail"],
  ];

  return (
    <aside className="world-guide" aria-label="Carte de Seven World">
      <div className="world-mode" role="group" aria-label="Mode de visite">
        <button
          className={mode === "explore" ? "is-active" : undefined}
          type="button"
          onClick={() => onChangeMode("explore")}
        >
          Explorer
        </button>
        <button
          className={mode === "understand" ? "is-active" : undefined}
          type="button"
          onClick={() => onChangeMode("understand")}
        >
          Comprendre
        </button>
      </div>
      <nav className="world-zones" aria-label="Zones du monde">
        {zones.map(([id, label], index) => (
          <a href={`#${id}`} key={id} aria-label={label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
          </a>
        ))}
      </nav>
    </aside>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0);
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

function getInitialLanguage(): Language {
  const storedLanguage = localStorage.getItem("portfolio_language");
  if (storedLanguage === "fr" || storedLanguage === "en") {
    return storedLanguage;
  }

  return "fr";
}

function getInitialTheme(): ThemeMode {
  const storedTheme = localStorage.getItem("portfolio_theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return "dark";
}

function mergeContent(content: Partial<SiteContent>, baseContent = defaultContent): SiteContent {
  const refreshedContent = refreshLegacyCopy(content, baseContent);
  const professionalTimeline = sanitizeProfessionalTimeline(isLegacyTimeline(content.professionalTimeline, [
    "Développeur Fullstack & Mobile",
    "Support IT, maintenance et accompagnement technique",
    "Produits numériques utiles au terrain",
  ])
    ? baseContent.professionalTimeline
    : content.professionalTimeline);
  const academicTimeline = isLegacyTimeline(content.academicTimeline, [
    "Développement fullstack, mobile et produit numérique",
    "Veille, projets personnels et apprentissage par la pratique",
  ])
    ? baseContent.academicTimeline
    : content.academicTimeline;

  return {
    ...baseContent,
    ...refreshedContent,
    professionalTimeline: professionalTimeline || baseContent.professionalTimeline,
    academicTimeline: academicTimeline || baseContent.academicTimeline,
    stacks: withRequiredStackItems(refreshedContent.stacks || baseContent.stacks, baseContent.stacks),
    contactLinks: normalizeContactLinks(refreshedContent.contactLinks, baseContent.contactLinks),
  };
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
    ],
    heroLead: [
      "Je conçois des interfaces, des API et des applications mobiles pour transformer un besoin concret en produit utilisable: comprendre, prototyper, livrer, puis améliorer avec les retours.",
      "Développeur Fullstack & Mobile, je construis des expériences utiles avec une culture de ligne de commande: comprendre, prototyper, automatiser, livrer et rendre la technologie plus humaine.",
      "J'aime partir d'un besoin simple, le clarifier, puis livrer quelque chose de propre: une page, une API, une app mobile ou un outil interne.",
    ],
    profileCaption: ["Web, mobile, API et produits de terrain", "Fullstack, mobile, terminal et innovation africaine", "Web, mobile, support IT, projets livrés"],
    aboutTitle: ["Un développeur qui relie interface, backend et usage réel."],
    identityTitle: ["Une présence simple: ce que je fais, comment je travaille, ce que j'ai déjà construit."],
    identityIntro: [
      "Cette plateforme rassemble mon profil, mes projets, mon CV, mes liens et un atelier interactif pour explorer mon travail sans se perdre.",
      "Le portfolio devient une fenêtre sur ton atelier: commandes, décisions produit, projets en chantier et attention portée aux utilisateurs.",
    ],
    journeyTitle: [
      "Formation, terrain et expériences techniques.",
      "Professionnel, académique et produit, sans récit inventé.",
    ],
    journeyIntro: [
      "Un parcours construit entre études informatiques, stages techniques et pratique sur des projets web, mobile et support IT.",
      "Les éléments ci-dessous reprennent uniquement les informations sûres. Les dates et diplômes exacts peuvent être ajoutés dès que tu me les donnes.",
    ],
    labTitle: ["Des idées testées vite, puis améliorées avec le terrain."],
    labIntro: ["Je garde ici les pistes de produits, les prototypes et les sujets qui peuvent devenir des solutions utiles."],
    contactTitle: ["Discutons d'un besoin concret."],
    contactText: ["Disponible pour des projets web, mobile, API, digitalisation, maintenance et accompagnement technique."],
  };

  for (const [key, legacyValues] of Object.entries(legacyCopy) as [keyof SiteContent, string[]][]) {
    const currentValue = nextContent[key];
    if (typeof currentValue === "string" && legacyValues.includes(currentValue)) {
      nextContent[key] = baseContent[key] as never;
    }
  }

  if (Array.isArray(nextContent.metrics)) {
    const oldMetricLabels = new Set(["Ce que je livre", "Ma méthode", "Mon angle", "Mode build", "Approche", "Mission", "Je fais", "Je connais", "Je préfère"]);
    if (nextContent.metrics.some(([label]) => oldMetricLabels.has(label))) {
      nextContent.metrics = baseContent.metrics;
    }
  }

  if (Array.isArray(nextContent.aboutParagraphs) && nextContent.aboutParagraphs.some((paragraph) => paragraph.startsWith("Je travaille sur des plateformes culturelles"))) {
    nextContent.aboutParagraphs = baseContent.aboutParagraphs;
  }

  if (Array.isArray(nextContent.identityPillars) && nextContent.identityPillars.some((pillar) => pillar.title === "Je pars du besoin réel")) {
    nextContent.identityPillars = baseContent.identityPillars;
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

function mergeTranslatedAndGithubProjects(translatedProjects: ProjectItem[], apiProjects: ProjectItem[]) {
  const githubProjects = apiProjects.filter((project) => project.source === "github");
  const translatedNames = new Set(translatedProjects.map((project) => project.name.toLowerCase()));
  return [
    ...translatedProjects,
    ...githubProjects.filter((project) => !translatedNames.has(project.name.toLowerCase())),
  ];
}

function mergePublicProjects(fallbackProjects: ProjectItem[], apiProjects: ProjectItem[], language: Language) {
  if (language === "en") {
    return mergeTranslatedAndGithubProjects(fallbackProjects, apiProjects);
  }

  const apiByName = new Map(apiProjects.map((project) => [project.name.toLowerCase(), project]));
  const fallbackNames = new Set(fallbackProjects.map((project) => project.name.toLowerCase()));

  return [
    ...fallbackProjects.map((project) => apiByName.get(project.name.toLowerCase()) || project),
    ...apiProjects.filter((project) => !fallbackNames.has(project.name.toLowerCase())),
  ];
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
  const [email, setEmail] = useState("admin@portfolio.local");
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
    fetch("/api/content")
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => setManagedContent(mergeContent(data.content || defaultContent)))
      .catch(() => setManagedContent(defaultContent));

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

    const draft = readAdminDraft<SiteContent>();
    if (draft) {
      setDraftSavedAt(draft.savedAt);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedContent) return;

    const snapshot = getContentSnapshot(content);
    if (snapshot === lastSavedContentSnapshot) return;

    const savedAt = writeAdminDraft(content);
    setDraftSavedAt(savedAt);
  }, [content, hasLoadedContent, lastSavedContentSnapshot]);

  function setManagedContent(nextContent: SiteContent) {
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
      const response = await fetch("/api/content", {
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

      setManagedContent(mergeContent(data.content));
      clearAdminDraft();
      setDraftSavedAt("");
      setStatus("Contenu sauvegardé. Le portfolio public est à jour.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sauvegarde impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  function restoreDraft() {
    const draft = readAdminDraft<SiteContent>();
    if (!draft) {
      setDraftSavedAt("");
      setStatus("Aucun brouillon local à restaurer.");
      return;
    }

    setContent(mergeContent(draft.content));
    setDraftSavedAt(draft.savedAt);
    setStatus("Brouillon restauré. Vérifie le contenu puis sauvegarde pour publier.");
  }

  function discardDraft() {
    clearAdminDraft();
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
        <button className="secondary-action button-action" type="button" onClick={onLogout}>
          <LogOut size={18} /> Quitter
        </button>
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
  return (
    <label className="editor-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
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
  theme: ThemeMode;
  ui: UiCopy;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
}) {
  const activeSection = useActiveSection(navSectionIds);
  const isDarkTheme = theme === "dark";
  const themeLabel = isDarkTheme ? "Sombre" : "Clair";
  const nextThemeLabel = isDarkTheme ? "Clair" : "Sombre";
  const ThemeIcon = isDarkTheme ? Moon : Sun;
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const isNavigationOpenRef = useRef(isNavigationOpen);
  const dragStateRef = useRef({
    isDragging: false,
    hasMoved: false,
    originX: 18,
    originY: 18,
    startX: 0,
    startY: 0,
  });
  const [widgetPosition, setWidgetPosition] = useState({ x: 18, y: 18 });

  useEffect(() => {
    isNavigationOpenRef.current = isNavigationOpen;
  }, [isNavigationOpen]);

  function clampWidgetPosition(position: { x: number; y: number }) {
    const menuWidth = Math.min(560, window.innerWidth - 18);
    const openHeight = window.innerWidth <= 430 ? 488 : window.innerWidth <= 760 ? 382 : 332;
    const width = isNavigationOpenRef.current ? menuWidth : 116;
    const height = isNavigationOpenRef.current ? openHeight : 86;

    return {
      x: Math.min(Math.max(8, position.x), Math.max(8, window.innerWidth - width - 8)),
      y: Math.min(Math.max(8, position.y), Math.max(8, window.innerHeight - height - 8)),
    };
  }

  function startDragging(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    dragStateRef.current = {
      isDragging: true,
      hasMoved: false,
      originX: widgetPosition.x,
      originY: widgetPosition.y,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!dragStateRef.current.isDragging) return;
      const deltaX = event.clientX - dragStateRef.current.startX;
      const deltaY = event.clientY - dragStateRef.current.startY;
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        dragStateRef.current.hasMoved = true;
      }
      const nextPosition = clampWidgetPosition({
        x: dragStateRef.current.originX + deltaX,
        y: dragStateRef.current.originY + deltaY,
      });
      setWidgetPosition(nextPosition);
    }

    function handlePointerUp() {
      dragStateRef.current.isDragging = false;
    }

    function handleResize() {
      setWidgetPosition((current) => clampWidgetPosition(current));
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setWidgetPosition((current) => clampWidgetPosition(current));
  }, [isNavigationOpen]);

  useEffect(() => {
    if (!isNavigationOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (headerRef.current?.contains(target)) return;
      setIsNavigationOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsNavigationOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNavigationOpen]);

  return (
    <header
      className={`topbar floating-laptop-bar world-header ${isNavigationOpen ? "is-nav-open" : ""}`}
      ref={headerRef}
      style={{ left: widgetPosition.x, top: widgetPosition.y }}
    >
      <div className="floating-laptop-nav">
        <button
          className="laptop-trigger world-compass-trigger"
          type="button"
          aria-expanded={isNavigationOpen}
          aria-controls="floating-laptop-screen"
          aria-label={isNavigationOpen ? "Fermer la navigation" : "Ouvrir la navigation"}
          onPointerDown={startDragging}
          onClick={(event) => {
            if (dragStateRef.current.hasMoved) {
              event.preventDefault();
              dragStateRef.current.hasMoved = false;
              return;
            }
            setIsNavigationOpen((current) => !current);
          }}
        >
          <span className="world-compass" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="world-trigger-copy">
            <strong>SEVEN</strong>
            <small>WORLD</small>
          </span>
        </button>
      </div>

      <motion.nav
        id="floating-laptop-screen"
        className="laptop-menu-panel"
        aria-label="Navigation principale"
        aria-hidden={!isNavigationOpen}
        initial={false}
        animate={isNavigationOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
          closed: { opacity: 0, y: -10, scale: 0.96, filter: "blur(8px)" },
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="laptop-menu-top">
          <span>carte du monde</span>
          <strong>{ui.nav[activeSection]}</strong>
        </div>
        <div className="laptop-menu-controls">
          <button
            className="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label={`Basculer en mode ${nextThemeLabel}`}
            title={`Basculer en mode ${nextThemeLabel}`}
            tabIndex={isNavigationOpen ? 0 : -1}
          >
            <ThemeIcon size={16} />
            <span>{themeLabel}</span>
          </button>
          <button
            className="language-toggle"
            type="button"
            onClick={onToggleLanguage}
            aria-label={`${ui.languageToggleLabel}: ${ui.switchTo}`}
            title={`${ui.languageToggleLabel}: ${ui.switchTo}`}
            tabIndex={isNavigationOpen ? 0 : -1}
          >
            <span>{language.toUpperCase()}</span>
            <strong>{ui.switchTo}</strong>
          </button>
        </div>
        <div className="laptop-menu-links">
          {navItemIds.map((id) => {
            const NavIcon = navIcons[id];
            return (
              <a
                key={id}
                href={`#${id}`}
                className={activeSection === id ? "is-active" : undefined}
                aria-current={activeSection === id ? "page" : undefined}
                tabIndex={isNavigationOpen ? 0 : -1}
                onClick={() => setIsNavigationOpen(false)}
              >
                <NavIcon size={16} aria-hidden="true" />
                <span>{ui.nav[id]}</span>
              </a>
            );
          })}
        </div>
      </motion.nav>
    </header>
  );
}

function useActiveSection(sectionIds: string[]) {
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
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0.08, 0.2, 0.38],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection;
}

function Hero({ content, ui, worldMode }: { content: SiteContent; ui: UiCopy; worldMode: "explore" | "understand" }) {
  return (
    <section className="hero section immersive-hero" id="top">
      <div className="hero-stage" aria-hidden="true">
        <span />
        <span />
        <span />
        <div className="world-tree">
          <i className="tree-crown crown-one" />
          <i className="tree-crown crown-two" />
          <i className="tree-crown crown-three" />
          <i className="tree-trunk" />
          <i className="tree-root root-one" />
          <i className="tree-root root-two" />
          <i className="tree-root root-three" />
        </div>
      </div>
      <motion.div
        className="hero-portrait"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        aria-label="Portrait de Victoire Sawadogo"
      >
        <img src="/portrait.jpeg" alt="Portrait de Victoire Sawadogo" />
        <Suspense fallback={<div className="world-scene world-scene-fallback" aria-hidden="true" />}>
          <WorldScene />
        </Suspense>
        <div className="hero-image-panel">
          <span className="hero-boot">{ui.heroBoot}</span>
          <span className="hero-world-label">Seven World / {worldMode === "explore" ? "exploration libre" : "lecture guidée"}</span>
          <p className="eyebrow">
            <Terminal size={16} /> {content.heroEyebrow}
          </p>
          <h1>{content.heroTitle}</h1>
          <p className="hero-lead">{content.heroLead}</p>
          <div className="hero-actions">
            <a className="primary-action" href="#projets">
              {ui.heroProjects} <ArrowUpRight size={18} />
            </a>
            <a className="secondary-action" href="#contact">
              {ui.heroContact}
            </a>
          </div>
        </div>
        <div className="hero-portrait-caption">
          <span>Victoire Sawadogo</span>
          <strong>{content.profileCaption}</strong>
        </div>
      </motion.div>

      <div className="hero-metrics hero-metrics-inline" aria-label="Résumé des compétences">
        {content.metrics.map(([label, value]) => (
          <div key={label}>
            <strong>{label}</strong>
            <span>{value}</span>
          </div>
        ))}
      </div>

      <TechMarquee items={content.techMarquee} ui={ui} />
    </section>
  );
}

function RecruiterBrief({ ui }: { ui: UiCopy }) {
  const links = [
    { label: ui.recruiterBriefLinks.projects, href: "#projets", icon: BriefcaseBusiness },
    { label: ui.recruiterBriefLinks.resume, href: "#cv", icon: FileText },
    { label: ui.recruiterBriefLinks.contact, href: "#contact", icon: Mail },
  ];

  return (
    <section className="recruiter-brief" aria-label={ui.recruiterBriefAria}>
      <div className="recruiter-brief-copy">
        <span>{ui.recruiterBriefTitle}</span>
        <p>{ui.recruiterBriefIntro}</p>
      </div>
      <div className="recruiter-brief-items">
        {ui.recruiterBriefItems.map(([label, value]) => (
          <article key={label}>
            <strong>{label}</strong>
            <span>{value}</span>
          </article>
        ))}
      </div>
      <nav className="recruiter-brief-links" aria-label={ui.recruiterBriefAria}>
        {links.map(({ label, href, icon: Icon }) => (
          <a key={href} href={href}>
            <Icon size={16} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </section>
  );
}

function SystemConstellation({ content }: { content: SiteContent }) {
  const projectNodes = content.projects.slice(0, 4);

  return (
    <div className="system-constellation" aria-hidden="true">
      <div className="constellation-core">
        <ProfileImage />
        <span>VS</span>
      </div>
      <div className="constellation-ring one" />
      <div className="constellation-ring two" />
      {projectNodes.map((project, index) => (
        <div className={`constellation-node node-${index + 1}`} key={project.name}>
          <strong>{project.name.slice(0, 2).toUpperCase()}</strong>
          <span>{project.tags[0] || "build"}</span>
        </div>
      ))}
      <div className="constellation-thread thread-one" />
      <div className="constellation-thread thread-two" />
      <div className="constellation-thread thread-three" />
    </div>
  );
}

function QuickAccess() {
  const links = [
    { label: "Projets", href: "#projets", icon: BriefcaseBusiness },
    { label: "CV", href: "#cv", icon: FileText },
    { label: "Certifications", href: "#certifications", icon: ShieldCheck },
    { label: "Contact", href: "#contact", icon: Mail },
    { label: "Gestion", href: "/login", icon: LockKeyhole },
  ];

  return (
    <nav className="quick-access" aria-label="Accès rapides">
      {links.map(({ label, href, icon: Icon }) => (
        <a key={label} href={href} aria-label={`Accès rapide ${label}`}>
          <Icon size={18} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

function TerminalPanelFallback({ ui }: { ui: UiCopy }) {
  return (
    <aside className="terminal-panel terminal-panel-loading" aria-label={ui.terminal.loadingAria}>
      <div className="terminal-top">
        <span />
        <span />
        <span />
        <strong>{ui.terminal.title}</strong>
        <em>{ui.terminal.loadingMode}</em>
      </div>
      <div className="terminal-body">
        <div className="terminal-entry">
          <p>{ui.terminal.loadingLineOne}</p>
          <p>{ui.terminal.loadingLineTwo}</p>
        </div>
      </div>
    </aside>
  );
}

type ShellEntry = {
  directory?: string;
  command?: string;
  output: string[];
};

const shellModeLabels: Record<ShellMode, string> = {
  bash: "bash",
  python: "python",
  powershell: "powershell",
  node: "node",
  sql: "sql",
};

function TerminalPanel({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  const [input, setInput] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [currentDirectory, setCurrentDirectory] = useState("/home/victoire");
  const [mode, setMode] = useState<ShellMode>("bash");
  const [aliases, setAliases] = useState<Record<string, string>>(defaultAliases);
  const [memory, setMemory] = useState<VictoireMemory>(() => loadVictoireMemory());
  const [entries, setEntries] = useState<ShellEntry[]>([
    {
      output: getBootOutput(),
    },
  ]);
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

  useEffect(() => {
    if (!memory.autopilot) return;
    const timer = window.setInterval(() => {
      setEntries((current) => [
        ...current,
        {
          output: getAutopilotPulse(content, memory, currentDirectory, current.length),
        },
      ]);
    }, 28000);
    return () => window.clearInterval(timer);
  }, [content, currentDirectory, memory]);

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
      setEntries([
        {
          output: [
            "[reboot] stopping shell services",
            "[reboot] preserving local memory",
            ...getBootOutput(),
          ],
        },
      ]);
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
      ...current,
      { directory: currentDirectory, command: typedCommand, output: [...result.output, ...coachOutput] },
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
      initial={{ opacity: 0, y: 18, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: -1.5 }}
      transition={{ duration: 0.7, delay: 0.35 }}
      aria-label={ui.terminal.loadingAria}
    >
      <div className="terminal-top">
        <span />
        <span />
        <span />
        <strong>{ui.terminal.title}</strong>
        <em>{shellModeLabels[mode]}</em>
      </div>
      <div className="terminal-status">
        <span>{ui.terminal.profile}: {memory.persona}</span>
        <span>{ui.terminal.visitor}: {memory.visitor}</span>
        <span>{ui.terminal.path}: {memory.mission || "libre"}</span>
        <span>{ui.terminal.help}: {memory.coach ? ui.terminal.active : ui.terminal.simple}</span>
      </div>
      <div className="terminal-dashboard" aria-label={ui.terminal.dashboardAria}>
        <div>
          <span>{ui.terminal.objective}</span>
          <strong>{memory.goal}</strong>
        </div>
        <div>
          <span>{ui.terminal.next}</span>
          <strong>{getNextBestCommand(memory, content)}</strong>
        </div>
        <div>
          <span>{ui.terminal.activity}</span>
          <strong>{memory.commands.length} {ui.terminal.commands}</strong>
        </div>
      </div>
      <div className="terminal-quick-actions" aria-label={ui.terminal.quickActionsAria}>
        {[
          { label: ui.terminal.recruiterPath, command: "visitor recruiter" },
          { label: ui.terminal.viewProjects, command: "projects" },
          { label: ui.terminal.developerMode, command: "shellctl inspect" },
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
        {entries.map((entry, index) => (
          <div className="terminal-entry" key={`${entry.command || "intro"}-${index}`}>
            {entry.command ? (
              <code className="terminal-command">
                {renderPrompt(mode, entry.directory || currentDirectory)} {entry.command}
              </code>
            ) : null}
            {entry.output.map((line, lineIndex) => (
              <p key={`${line}-${lineIndex}`}>{line}</p>
            ))}
          </div>
        ))}
        <form className="terminal-form" onSubmit={handleSubmit}>
          <label>
            {renderPrompt(mode, currentDirectory)}
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="help"
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

function renderPrompt(mode: ShellMode, directory: string) {
  if (mode === "python") {
    return <span className="prompt-python">&gt;&gt;&gt;</span>;
  }

  if (mode === "powershell") {
    return (
      <>
        <span>PS</span> <strong>{directory}</strong>&gt;
      </>
    );
  }

  if (mode === "node") {
    return <span className="prompt-node">node&gt;</span>;
  }

  if (mode === "sql") {
    return <span className="prompt-sql">portfolio=#</span>;
  }

  return (
    <>
      <span>victoire@sawadogo</span>:<strong>{toTildePath(directory)} main*</strong>$
    </>
  );
}

function ProfileImage() {
  const [src, setSrc] = useState("/profile-placeholder.svg");

  useEffect(() => {
    fetch(`/profile-manifest.json?t=${Date.now()}`)
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => {
        if (data.url) {
          setSrc(data.url);
        }
      })
      .catch(() => setSrc("/profile-placeholder.svg"));
  }, []);

  return (
    <div className="profile-frame">
      <img
        src={src}
        alt="Portrait professionnel"
        onError={() => {
          if (src !== "/profile-placeholder.svg") {
            setSrc("/profile-placeholder.svg");
          }
        }}
      />
    </div>
  );
}

function TechMarquee({ items, ui }: { items: string[]; ui: UiCopy }) {
  return (
    <div className="tech-marquee" aria-label={ui.techMarqueeAria}>
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {[...items, ...items].map((tech, index) => (
          <span key={`${tech}-${index}`}>{tech}</span>
        ))}
      </motion.div>
    </div>
  );
}

function About({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  return (
    <RevealSection className="about section" id="profil">
      <div className="section-kicker">{ui.sectionKickers.profile}</div>
      <div className="split">
        <h2>{content.aboutTitle}</h2>
        <div className="body-copy">
          {content.aboutParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="command-strip" aria-label={ui.workflowAria}>
            {ui.workflowCommands.map(([step, command, detail]) => (
              <article key={command}>
                <span>{step}</span>
                <code>{command}</code>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

function Identity({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  return (
    <RevealSection className="identity section" id="identite">
      <div className="section-heading">
        <div>
          <div className="section-kicker">{ui.sectionKickers.identity}</div>
          <h2>{content.identityTitle}</h2>
        </div>
        <p>{content.identityIntro}</p>
      </div>
      <div className="identity-grid">
        {content.identityPillars.map((pillar) => (
          <article key={pillar.title} className="identity-card">
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
          </article>
        ))}
      </div>
    </RevealSection>
  );
}

function Journey({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  return (
    <RevealSection className="journey section" id="parcours">
      <div className="section-heading">
        <div>
          <div className="section-kicker">{ui.sectionKickers.journey}</div>
          <h2>{content.journeyTitle}</h2>
        </div>
        <p>{content.journeyIntro}</p>
      </div>
      <div className="journey-grid">
        <TimelineColumn
          icon={<BriefcaseBusiness size={20} />}
          title={ui.journeyProfessional}
          items={content.professionalTimeline}
        />
        <TimelineColumn
          icon={<GraduationCap size={20} />}
          title={ui.journeyAcademic}
          items={content.academicTimeline}
        />
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
    <div className="journey-column">
      <div className="journey-title">
        {icon}
        <h3>{title}</h3>
      </div>
      <div className="journey-line">
        {items.map((item) => (
          <article key={`${item.period}-${item.title}`}>
            <span>{item.period}</span>
            <h4>{item.title}</h4>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Stack({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  return (
    <RevealSection className="section" id="stack">
      <div className="section-heading">
        <div>
          <div className="section-kicker">{ui.sectionKickers.stack}</div>
          <h2>{ui.stackTitle}</h2>
        </div>
        <p>{ui.stackIntro}</p>
      </div>
      <div className="stack-grid">
        {content.stacks.map(({ title, items }) => {
          const Icon = stackIcons[title as keyof typeof stackIcons] || Layers3;
          return (
          <article className="stack-card" key={title}>
            <div className="stack-icon">
              <Icon size={24} />
            </div>
            <h3>{title}</h3>
            <ul className="tech-list">
              {items.map((item) => (
                <li key={item.name}>
                  <img src={item.logo} alt="" loading="lazy" />
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </article>
          );
        })}
      </div>
    </RevealSection>
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
      document.getElementById("projets")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <div className="section-heading">
        <div>
          <div className="section-kicker">{ui.sectionKickers.projects}</div>
          <h2>{ui.projectsTitle}</h2>
        </div>
        <a className="ghost-link" href="#contact">
          {ui.projectsCta} <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="project-controls" aria-label={ui.projectFiltersAria}>
        <label className="project-search">
          <span>{ui.projectSearchLabel}</span>
          <input
            type="search"
            value={projectQuery}
            onChange={(event) => setProjectQuery(event.target.value)}
            placeholder={ui.projectSearchPlaceholder}
          />
        </label>
        <div className="project-filter-row" role="list" aria-label={ui.projectFilterAria}>
          {projectTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={activeProjectTag === tag ? "is-active" : undefined}
              onClick={() => setActiveProjectTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="project-grid">
        {filteredProjects.map((project, index) => (
          <motion.article
            className="project-card project-card-compact"
            key={project.name}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            tabIndex={0}
            role="button"
            aria-label={`${ui.projectOpenAria} ${project.name}`}
            onClick={() => setSelectedProject(project)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedProject(project);
              }
            }}
          >
            <span className="project-index">0{index + 1}</span>
            <div className="project-card-top">
              <div className="project-logo" aria-hidden="true">
                {project.logoUrl ? (
                  <img src={project.logoUrl} alt="" loading="lazy" />
                ) : (
                  <span>{project.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="project-status">
                {project.source === "github" ? <Github size={15} /> : <GitBranch size={15} />}
                <span>{project.source === "github" ? ui.githubLive : ui.projectInProgress}</span>
              </div>
            </div>
            <p className="project-type">{project.type}</p>
            <strong className="project-focus">{project.focus}</strong>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="tag-row">
              {project.tags.slice(0, 3).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
              {project.tags.length > 3 ? <span>+{project.tags.length - 3}</span> : null}
            </div>
            <div className="project-card-footer" aria-hidden="true">
              <span>{ui.view}</span>
              <ArrowUpRight size={15} />
            </div>
          </motion.article>
        ))}
      </div>
      {!filteredProjects.length ? (
        <div className="project-empty-state">
          <strong>{ui.noProjectTitle}</strong>
          <p>{ui.noProjectText}</p>
          <button
            className="secondary-action button-action"
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
      {selectedProject ? (
        <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} ui={ui} language={language} />
      ) : null}
    </RevealSection>
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
  const cover = screenshots[0]?.url || project.logoUrl || "";

  return (
    <div className="project-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <motion.div
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label={ui.close}>
          ×
        </button>
        <div className="project-modal-media">
          {cover ? (
            <img src={cover} alt={screenshots[0]?.alt || `${ui.projectPreviewAlt} ${project.name}`} />
          ) : (
            <div className="project-modal-placeholder">{project.name.slice(0, 2).toUpperCase()}</div>
          )}
        </div>
        <div className="project-modal-content">
          <p className="project-type">{project.type}</p>
          <h3 id="project-modal-title">{project.name}</h3>
          <strong>{project.focus}</strong>
          <p>{project.detail || project.description}</p>
          {project.source === "github" ? (
            <div className="github-project-meta modal-meta" aria-label={`Métadonnées GitHub pour ${project.name}`}>
              {project.githubRepo ? <span>{project.githubRepo}</span> : null}
              {project.githubUpdatedAt ? <span>{ui.updatedLong} {formatRelativeProjectDate(project.githubUpdatedAt, language)}</span> : null}
              <span>{project.githubStars || 0} {(project.githubStars || 0) > 1 ? ui.stars : ui.star}</span>
              <span>{project.githubForks || 0} {(project.githubForks || 0) > 1 ? ui.forks : ui.fork}</span>
            </div>
          ) : null}
          <div className="tag-row">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          {screenshots.length > 1 ? (
            <div className="project-gallery" aria-label={ui.projectGalleryAria}>
              {screenshots.slice(1).map((screenshot, index) => (
                <img key={`${screenshot.url}-${index}`} src={screenshot.url} alt={screenshot.alt || `${ui.projectScreenshotAlt} ${index + 2} - ${project.name}`} />
              ))}
            </div>
          ) : null}
          <div className="project-modal-actions">
            {project.projectUrl ? (
              <a className="primary-action" href={project.projectUrl} target="_blank" rel="noreferrer">
                {ui.viewProject} <ArrowUpRight size={18} />
              </a>
            ) : null}
            {project.apkUrl ? (
              <a className="secondary-action" href={project.apkUrl} download>
                {ui.downloadApk} <Download size={18} />
              </a>
            ) : null}
            {project.githubUrl && project.githubUrl !== project.projectUrl ? (
              <a className="secondary-action" href={project.githubUrl} target="_blank" rel="noreferrer">
                {ui.viewCode} <Github size={18} />
              </a>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
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
    <RevealSection className="cv-section section" id="cv">
      <div className="section-heading">
        <div>
          <div className="section-kicker">CV</div>
          <h2>{ui.cvTitle}</h2>
        </div>
        <div className="cv-actions">
          <a className="secondary-action" href={cvUrl} target="_blank" rel="noreferrer">
            <Eye size={18} /> {ui.cvView}
          </a>
          <a className="primary-action" href={cvUrl} download>
            <Download size={18} /> {ui.cvDownload}
          </a>
        </div>
      </div>
      <div className="cv-viewer">
        {cvInfo ? (
          <div className="cv-empty cv-link-panel">
            <FileText size={44} />
            <h3>{ui.cvAvailableTitle}</h3>
            <p>{ui.cvAvailableText}</p>
          </div>
        ) : (
          <div className="cv-empty">
            <FileText size={44} />
            <h3>{ui.cvMissingTitle}</h3>
            <p>{ui.cvMissingText}</p>
          </div>
        )}
      </div>
    </RevealSection>
  );
}

function CertificationsSection({ ui }: { ui: UiCopy }) {
  const [certificationsInfo, setCertificationsInfo] = useState<CvInfo | null>(null);

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

  const certificationsUrl = certificationsInfo?.url || "/certifications.pdf";

  return (
    <RevealSection className="certifications-section cv-section section" id="certifications">
      <div className="section-heading">
        <div>
          <div className="section-kicker">{ui.certificationsKicker}</div>
          <h2>{ui.certificationsTitle}</h2>
        </div>
        {certificationsInfo ? (
          <div className="cv-actions">
            <a className="secondary-action" href={certificationsUrl} target="_blank" rel="noreferrer">
              <Eye size={18} /> {ui.certificationsView}
            </a>
          </div>
        ) : null}
      </div>
      <div className="cv-viewer">
        {certificationsInfo ? (
          <div className="cv-empty cv-link-panel">
            <FileText size={44} />
            <h3>{ui.certificationsAvailableTitle}</h3>
            <p>{ui.certificationsAvailableText}</p>
          </div>
        ) : (
          <div className="cv-empty">
            <FileText size={44} />
            <h3>{ui.certificationsMissingTitle}</h3>
            <p>{ui.certificationsMissingText}</p>
          </div>
        )}
      </div>
    </RevealSection>
  );
}

function Lab({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  return (
    <RevealSection className="lab section atelier-section" id="labo">
      <div className="atelier-heading">
        <div>
          <div className="section-kicker">{ui.sectionKickers.lab}</div>
          <h2>{content.labTitle}</h2>
          <p>{content.labIntro}</p>
        </div>
      </div>

      <div className="atelier-grid">
        <div className="atelier-terminal-card">
          <div className="atelier-card-header">
            <span>{ui.labSession}</span>
            <strong>{ui.labOs}</strong>
          </div>
          <TerminalPanel content={content} ui={ui} />
        </div>

        <div className="atelier-side">
          <div className="lab-console atelier-console" aria-label={ui.labCycleAria}>
            <div>
              <Activity size={16} />
              <code>watch ideas --iterate</code>
            </div>
            <div>
              <Code2 size={16} />
              <code>prototype --fast --human</code>
            </div>
          </div>

          <div className="lab-list atelier-list">
            {content.labs.map((item) => (
              <div key={item}>
                <Rocket size={18} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

function Contact({ content, ui }: { content: SiteContent; ui: UiCopy }) {
  return (
    <RevealSection className="contact section" id="contact">
      <div>
        <div className="section-kicker">{ui.sectionKickers.contact}</div>
        <h2>{content.contactTitle}</h2>
        <p>{content.contactText}</p>
      </div>
      <div className="contact-actions">
        <a href={`mailto:${content.contactLinks.email}`}>
          <Mail size={18} /> Email
        </a>
        <a href={content.contactLinks.github} target="_blank" rel="noreferrer">
          <Github size={18} /> GitHub
        </a>
        <a href={content.contactLinks.linkedin} target="_blank" rel="noreferrer">
          <Linkedin size={18} /> LinkedIn
        </a>
        <a href={content.contactLinks.whatsapp} target="_blank" rel="noreferrer">
          <MessageCircle size={18} /> WhatsApp
        </a>
      </div>
    </RevealSection>
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
  const viewLabel = id ? sectionViewLabels[id] || id : "view";
  const worldZone = id ? worldZoneLabels[id] : null;

  return (
    <motion.section
      className={className}
      id={id}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {id ? (
        <div className="section-rail" aria-hidden="true">
          <span>{viewLabel}</span>
          <strong>{id}</strong>
        </div>
      ) : null}
      {worldZone ? <span className="world-zone-name">{worldZone}</span> : null}
      {children}
    </motion.section>
  );
}

const sectionViewLabels: Record<string, string> = {
  profil: "profil.log",
  identite: "identity.core",
  parcours: "timeline.trace",
  stack: "stack.map",
  projets: "projects.dir",
  cv: "cv.preview",
  labo: "lab.queue",
  contact: "contact.route",
};

const worldZoneLabels: Record<string, string> = {
  profil: "Le Noyau",
  identite: "Le Sanctuaire",
  parcours: "Les Archives",
  stack: "La Bibliothèque",
  projets: "Le Laboratoire",
  cv: "Les Archives",
  certifications: "Les Archives",
  labo: "SevenOS",
  contact: "Le Portail",
};

function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="woven-pattern" />
      <div className="light-field one" />
      <div className="light-field two" />
    </div>
  );
}

export default App;
