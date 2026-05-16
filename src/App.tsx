import { useEffect, useRef, useState } from "react";
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
  Layers3,
  Linkedin,
  LockKeyhole,
  LogOut,
  Mail,
  MessageCircle,
  Rocket,
  ServerCog,
  ShieldCheck,
  Smartphone,
  Terminal,
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

const navItems = [
  { label: "Accueil", id: "top" },
  { label: "Profil", id: "profil" },
  { label: "Parcours", id: "parcours" },
  { label: "Stack", id: "stack" },
  { label: "Projets", id: "projets" },
  { label: "Atelier", id: "labo" },
  { label: "CV", id: "cv" },
  { label: "Contact", id: "contact" },
];

const navSectionIds = navItems.map((item) => item.id);

const stacks = [
  {
    title: "Frontend",
    icon: Layers3,
    items: [
      {
        name: "React",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
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
        name: "MongoDB",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg",
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
    tags: ["Flutter", "Mode", "Mobile", "Produit"],
  },
  {
    name: "BAOBAB / MonBaobab",
    type: "Culture, e-commerce, communauté",
    focus: "Patrimoine digital",
    description:
      "Espace web pensé pour réunir contenus, boutiques, créateurs et communautés autour de la culture et des savoir-faire locaux.",
    tags: ["React", "Node.js", "MongoDB", "Culture"],
  },
  {
    name: "BurkinaLoc",
    type: "Produit digital local",
    focus: "Service de proximité",
    description:
      "Service local pour rendre la recherche, la publication et la gestion d'offres plus simples au quotidien.",
    tags: ["Produit", "UX", "Web"],
  },
  {
    name: "Suivi de cotisations",
    type: "Gestion, automatisation, clarté",
    focus: "Gestion communautaire",
    description:
      "Outil de suivi pour savoir qui a cotisé, ce qui reste à faire et quelles informations doivent être partagées.",
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
  "Laravel",
  "Java",
  "Firebase",
  "Automatisation",
];

type ProjectItem = {
  name: string;
  type: string;
  focus: string;
  description: string;
  detail?: string;
  tags: string[];
  logoUrl?: string;
  projectUrl?: string;
  apkUrl?: string;
  apkName?: string;
  screenshots?: {
    url: string;
    alt?: string;
  }[];
};

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

type StackGroup = typeof stacks[number];
type TimelineItem = typeof professionalTimeline[number];
type IdentityPillar = typeof identityPillars[number];

type SiteContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  profileCaption: string;
  metrics: string[][];
  techMarquee: string[];
  aboutTitle: string;
  aboutParagraphs: string[];
  identityTitle: string;
  identityIntro: string;
  identityPillars: IdentityPillar[];
  journeyTitle: string;
  journeyIntro: string;
  professionalTimeline: TimelineItem[];
  academicTimeline: TimelineItem[];
  stacks: StackGroup[];
  projects: ProjectItem[];
  labTitle: string;
  labIntro: string;
  labs: string[];
  contactTitle: string;
  contactText: string;
  contactLinks: {
    email: string;
    github: string;
    linkedin: string;
    whatsapp: string;
  };
};

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

const defaultContent: SiteContent = {
  heroEyebrow: "Développeur Fullstack & Mobile",
  heroTitle: "Je construis des applications utiles, claires et prêtes à évoluer.",
  heroLead:
    "Je conçois des interfaces, des API et des applications mobiles pour transformer un besoin concret en produit utilisable: comprendre, prototyper, livrer, puis améliorer avec les retours.",
  profileCaption: "Web, mobile, API et produits de terrain",
  metrics,
  techMarquee,
  aboutTitle:
    "Un développeur qui relie interface, backend et usage réel.",
  aboutParagraphs: [
    "Je travaille sur des plateformes culturelles, des outils de gestion, des solutions e-commerce et des applications mobiles pensées pour être comprises rapidement.",
    "Mon réflexe: clarifier le problème, découper le travail, automatiser ce qui prend du temps, puis livrer une version que quelqu'un peut vraiment utiliser.",
  ],
  identityTitle: "Une présence simple: ce que je fais, comment je travaille, ce que j'ai déjà construit.",
  identityIntro:
    "Cette plateforme rassemble mon profil, mes projets, mon CV, mes liens et un atelier interactif pour explorer mon travail sans se perdre.",
  identityPillars,
  journeyTitle: "Parcours professionnel, apprentissage et projets.",
  journeyIntro:
    "Un parcours construit par la pratique: support, développement, produit, déploiement et amélioration continue.",
  professionalTimeline,
  academicTimeline,
  stacks,
  projects,
  labTitle: "Des idées testées vite, puis améliorées avec le terrain.",
  labIntro:
    "Je garde ici les pistes de produits, les prototypes et les sujets qui peuvent devenir des solutions utiles.",
  labs,
  contactTitle: "Discutons d'un besoin concret.",
  contactText:
    "Disponible pour des projets web, mobile, API, digitalisation, maintenance et accompagnement technique.",
  contactLinks: {
    email: "contact@example.com",
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    whatsapp: "https://wa.me/",
  },
};

const stackIcons = {
  Frontend: Layers3,
  Mobile: Smartphone,
  "Backend": ServerCog,
  "DevOps & IT": Cpu,
};

function App() {
  const isLoginRoute = window.location.pathname === "/login";
  const [content, setContent] = useState<SiteContent>(defaultContent);

  useEffect(() => {
    if (isLoginRoute) return;

    fetch("/api/content")
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => {
        if (data.content) {
          setContent(mergeContent(data.content));
        }
      })
      .catch(() => setContent(defaultContent));

    fetch("/api/projects")
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data.projects) && data.projects.length) {
          setContent((current) => ({
            ...current,
            projects: data.projects.map(normalizeApiProject),
          }));
        }
      })
      .catch(() => undefined);
  }, [isLoginRoute]);

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
    <main className="site-shell">
      <a className="skip-link" href="#profil">
        Aller au contenu
      </a>
      <AmbientBackground />
      <Header />
      <Hero content={content} />
      <About content={content} />
      <Identity content={content} />
      <Journey content={content} />
      <Stack content={content} />
      <Projects content={content} />
      <Lab content={content} />
      <CvSection />
      <Contact content={content} />
    </main>
  );
}

function mergeContent(content: Partial<SiteContent>): SiteContent {
  return {
    ...defaultContent,
    ...content,
    contactLinks: {
      ...defaultContent.contactLinks,
      ...(content.contactLinks || {}),
    },
  };
}

function normalizeApiProject(project: ProjectItem): ProjectItem {
  return {
    name: project.name,
    type: project.type,
    focus: project.focus,
    description: project.description,
    detail: project.detail || "",
    logoUrl: project.logoUrl || "",
    projectUrl: project.projectUrl || "",
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
    const token = localStorage.getItem("portfolio_admin_token");
    if (!token) return;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("portfolio_admin_token"));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Connexion impossible.");
      }

      localStorage.setItem("portfolio_admin_token", data.token);
      setUser(data.user);
      setPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Connexion impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("portfolio_admin_token");
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
  const [profilePhotoInfo, setProfilePhotoInfo] = useState<ProfilePhotoInfo | null>(null);
  const [profilePhotoStatus, setProfilePhotoStatus] = useState("");
  const [profilePhotoStatusKind, setProfilePhotoStatusKind] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
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
      const token = localStorage.getItem("portfolio_admin_token");
      const formData = new FormData();
      formData.append("apk", file);

      const response = await fetch("/api/projects/apk", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem("portfolio_admin_token");
      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch("/api/projects/logo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem("portfolio_admin_token");
      const formData = new FormData();
      formData.append("screenshot", file);

      const response = await fetch("/api/projects/screenshot", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem("portfolio_admin_token");
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      const token = localStorage.getItem("portfolio_admin_token");
      const formData = new FormData();
      formData.append("cv", file);

      const response = await fetch("/api/content/cv", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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

  async function uploadProfilePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingProfilePhoto(true);
    setProfilePhotoStatus("");
    setProfilePhotoStatusKind("success");

    try {
      const token = localStorage.getItem("portfolio_admin_token");
      const formData = new FormData();
      formData.append("profile", file);

      const response = await fetch("/api/content/profile-photo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={(event) => onUploadLogo(index, event)}
                  disabled={uploadingLogoIndex === index}
                />
                {uploadingLogoIndex === index ? "Upload..." : "Ajouter logo"}
              </label>
            </div>
          </div>
          <TextField label="Lien du projet" value={project.projectUrl || ""} onChange={(value) => onUpdate(index, "projectUrl", value)} />
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
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
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

function Header() {
  const activeSection = useActiveSection(navSectionIds);

  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Retour en haut">
        <span>VS</span>
        <strong>Victoire SAWADOGO</strong>
      </a>
      <nav aria-label="Navigation principale">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={activeSection === item.id ? "is-active" : undefined}
            aria-current={activeSection === item.id ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
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

function Hero({ content }: { content: SiteContent }) {
  const [terminalReady, setTerminalReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setTerminalReady(true), 350);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="hero section immersive-hero" id="top">
      <div className="hero-stage" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <motion.div
        className="hero-copy"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-intro">
          <ProfileImage />
          <div>
            <p className="eyebrow">
              <Terminal size={16} /> {content.heroEyebrow}
            </p>
            <span>{content.profileCaption}</span>
          </div>
        </div>
        <h1>{content.heroTitle}</h1>
        <p className="hero-lead">{content.heroLead}</p>
        <div className="hero-metrics">
          {content.metrics.map(([label, value]) => (
            <div key={label}>
              <strong>{label}</strong>
              <span>{value}</span>
            </div>
          ))}
        </div>
        <div className="hero-actions">
          <a className="primary-action" href="#projets">
            Voir les projets <ArrowUpRight size={18} />
          </a>
          <a className="secondary-action" href="#contact">
            Me contacter
          </a>
        </div>
        <QuickAccess />
      </motion.div>

      <motion.div
        className="hero-visual"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.1 }}
        aria-label="Portrait professionnel et terminal de développeur"
      >
        {terminalReady ? <TerminalPanel content={content} /> : <TerminalPanelFallback />}
      </motion.div>
      <TechMarquee items={content.techMarquee} />
    </section>
  );
}

function QuickAccess() {
  const links = [
    { label: "Projets", detail: "Voir les réalisations", href: "#projets", icon: BriefcaseBusiness },
    { label: "CV", detail: "Consulter ou télécharger", href: "#cv", icon: FileText },
    { label: "Contact", detail: "Email, GitHub, LinkedIn", href: "#contact", icon: Mail },
    { label: "Gestion", detail: "Espace privé", href: "/login", icon: LockKeyhole },
  ];

  return (
    <nav className="quick-access" aria-label="Accès rapides">
      {links.map(({ label, detail, href, icon: Icon }) => (
        <a key={label} href={href}>
          <Icon size={18} />
          <span>
            <strong>{label}</strong>
            <em>{detail}</em>
          </span>
        </a>
      ))}
    </nav>
  );
}

function TerminalPanelFallback() {
  return (
    <aside className="terminal-panel terminal-panel-loading" aria-label="Chargement de l'atelier interactif">
      <div className="terminal-top">
        <span />
        <span />
        <span />
        <strong>Atelier interactif</strong>
        <em>chargement</em>
      </div>
      <div className="terminal-body">
        <div className="terminal-entry">
          <p>Préparation de l'espace interactif...</p>
          <p>Chargement des raccourcis du portfolio...</p>
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

const terminalQuickActions = [
  { label: "Parcours recruteur", command: "visitor recruiter" },
  { label: "Voir mes projets", command: "projects" },
  { label: "Mode développeur", command: "shellctl inspect" },
];

function TerminalPanel({ content }: { content: SiteContent }) {
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
      aria-label="Atelier interactif du portfolio"
    >
      <div className="terminal-top">
        <span />
        <span />
        <span />
        <strong>Atelier interactif</strong>
        <em>{shellModeLabels[mode]}</em>
      </div>
      <div className="terminal-status">
        <span>profil: {memory.persona}</span>
        <span>visiteur: {memory.visitor}</span>
        <span>parcours: {memory.mission || "libre"}</span>
        <span>aide: {memory.coach ? "active" : "simple"}</span>
      </div>
      <div className="terminal-dashboard" aria-label="Résumé interactif du portfolio">
        <div>
          <span>objectif</span>
          <strong>{memory.goal}</strong>
        </div>
        <div>
          <span>suite</span>
          <strong>{getNextBestCommand(memory, content)}</strong>
        </div>
        <div>
          <span>activité</span>
          <strong>{memory.commands.length} cmd</strong>
        </div>
      </div>
      <div className="terminal-quick-actions" aria-label="Parcours rapides">
        {terminalQuickActions.map((action) => (
          <button key={action.command} type="button" onClick={() => submitCommand(action.command)}>
            {action.label}
          </button>
        ))}
      </div>
      {paletteOpen ? (
        <div className="terminal-palette" role="dialog" aria-label="Palette de commandes Atelier">
          <input
            value={paletteQuery}
            onChange={(event) => setPaletteQuery(event.target.value)}
            placeholder="Chercher une commande, un script, un fichier..."
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
              aria-label="Commande du shell interactif"
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

function TechMarquee({ items }: { items: string[] }) {
  return (
    <div className="tech-marquee" aria-label="Technologies principales">
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

function About({ content }: { content: SiteContent }) {
  return (
    <RevealSection className="about section" id="profil">
      <div className="section-kicker">Profil</div>
      <div className="split">
        <h2>{content.aboutTitle}</h2>
        <div className="body-copy">
          {content.aboutParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="command-strip" aria-label="Méthode de travail">
            {workflowCommands.map(([step, command, detail]) => (
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

function Identity({ content }: { content: SiteContent }) {
  return (
    <RevealSection className="identity section" id="identite">
      <div className="section-heading">
        <div>
          <div className="section-kicker">Identité en ligne</div>
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

function Journey({ content }: { content: SiteContent }) {
  return (
    <RevealSection className="journey section" id="parcours">
      <div className="section-heading">
        <div>
          <div className="section-kicker">Parcours</div>
          <h2>{content.journeyTitle}</h2>
        </div>
        <p>{content.journeyIntro}</p>
      </div>
      <div className="journey-grid">
        <TimelineColumn
          icon={<BriefcaseBusiness size={20} />}
          title="Parcours professionnel"
          items={content.professionalTimeline}
        />
        <TimelineColumn
          icon={<GraduationCap size={20} />}
          title="Parcours académique"
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

function Stack({ content }: { content: SiteContent }) {
  return (
    <RevealSection className="section" id="stack">
      <div className="section-heading">
        <div>
          <div className="section-kicker">Stack technique</div>
          <h2>Les outils que j'utilise pour livrer proprement.</h2>
        </div>
        <p>
          Une base web, mobile et backend pour construire, tester et faire évoluer
          les projets sans perdre en lisibilité.
        </p>
      </div>
      <div className="stack-grid">
        {content.stacks.map(({ title, icon, items }) => {
          const Icon = stackIcons[title as keyof typeof stackIcons] || icon || Layers3;
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

function Projects({ content }: { content: SiteContent }) {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [projectQuery, setProjectQuery] = useState("");
  const [activeProjectTag, setActiveProjectTag] = useState("Tous");
  const projectTags = getProjectTags(content.projects);
  const filteredProjects = filterProjects(content.projects, projectQuery, activeProjectTag);

  useEffect(() => {
    function handleProjectIntent(event: Event) {
      const detail = (event as CustomEvent<{ projectName?: string; intent?: string }>).detail;
      if (!detail?.projectName) return;
      const project = content.projects.find((item) => item.name === detail.projectName);
      if (!project) return;
      setProjectQuery("");
      setActiveProjectTag("Tous");
      document.getElementById("projets")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setSelectedProject(project);
    }

    window.addEventListener("victoire-os:project", handleProjectIntent);
    return () => window.removeEventListener("victoire-os:project", handleProjectIntent);
  }, [content.projects]);

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
          <div className="section-kicker">Projets</div>
          <h2>Des projets concrets, avec liens et fichiers quand ils sont disponibles.</h2>
        </div>
        <a className="ghost-link" href="#contact">
          Discuter d'un projet <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="project-controls" aria-label="Filtres des projets">
        <label className="project-search">
          <span>Rechercher</span>
          <input
            type="search"
            value={projectQuery}
            onChange={(event) => setProjectQuery(event.target.value)}
            placeholder="Nom, techno, besoin..."
          />
        </label>
        <div className="project-filter-row" role="list" aria-label="Filtrer par tag">
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
            className="project-card"
            key={project.name}
            whileHover={{ y: -8, rotateX: 5, rotateY: index % 2 === 0 ? -5 : 5 }}
            transition={{ type: "spring", stiffness: 250, damping: 18 }}
            tabIndex={0}
            role="button"
            aria-label={`Ouvrir le détail du projet ${project.name}`}
            onClick={() => setSelectedProject(project)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedProject(project);
              }
            }}
          >
            <div className="project-depth" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="project-index">0{index + 1}</span>
            <div className="project-status">
              <GitBranch size={15} />
              <span>Projet en cours</span>
            </div>
            <div className="project-logo" aria-hidden="true">
              {project.logoUrl ? (
                <img src={project.logoUrl} alt="" loading="lazy" />
              ) : (
                <span>{project.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <p className="project-type">{project.type}</p>
            <strong className="project-focus">{project.focus}</strong>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="tag-row">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            {project.projectUrl || project.apkUrl ? (
              <div className="project-actions">
                {project.projectUrl ? (
                  <a href={project.projectUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                    Voir <ArrowUpRight size={15} />
                  </a>
                ) : null}
                {project.apkUrl ? (
                  <a href={project.apkUrl} download onClick={(event) => event.stopPropagation()}>
                    APK <Download size={15} />
                  </a>
                ) : null}
              </div>
            ) : null}
          </motion.article>
        ))}
      </div>
      {!filteredProjects.length ? (
        <div className="project-empty-state">
          <strong>Aucun projet trouvé</strong>
          <p>Essaie un autre mot-clé ou reviens sur le filtre Tous.</p>
          <button
            className="secondary-action button-action"
            type="button"
            onClick={() => {
              setProjectQuery("");
              setActiveProjectTag("Tous");
            }}
          >
            Réinitialiser
          </button>
        </div>
      ) : null}
      {selectedProject ? (
        <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      ) : null}
    </RevealSection>
  );
}

function ProjectDetailModal({ project, onClose }: { project: ProjectItem; onClose: () => void }) {
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
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <div className="project-modal-media">
          {cover ? (
            <img src={cover} alt={screenshots[0]?.alt || `Aperçu du projet ${project.name}`} />
          ) : (
            <div className="project-modal-placeholder">{project.name.slice(0, 2).toUpperCase()}</div>
          )}
        </div>
        <div className="project-modal-content">
          <p className="project-type">{project.type}</p>
          <h3 id="project-modal-title">{project.name}</h3>
          <strong>{project.focus}</strong>
          <p>{project.detail || project.description}</p>
          <div className="tag-row">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          {screenshots.length > 1 ? (
            <div className="project-gallery" aria-label="Captures du projet">
              {screenshots.slice(1).map((screenshot, index) => (
                <img key={`${screenshot.url}-${index}`} src={screenshot.url} alt={screenshot.alt || `Capture ${index + 2} du projet ${project.name}`} />
              ))}
            </div>
          ) : null}
          <div className="project-modal-actions">
            {project.projectUrl ? (
              <a className="primary-action" href={project.projectUrl} target="_blank" rel="noreferrer">
                Voir le projet <ArrowUpRight size={18} />
              </a>
            ) : null}
            {project.apkUrl ? (
              <a className="secondary-action" href={project.apkUrl} download>
                Télécharger l'APK <Download size={18} />
              </a>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CvSection() {
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
          <h2>Un CV consultable et téléchargeable.</h2>
        </div>
        <div className="cv-actions">
          <a className="secondary-action" href={cvUrl} target="_blank" rel="noreferrer">
            <Eye size={18} /> Visionner
          </a>
          <a className="primary-action" href={cvUrl} download>
            <Download size={18} /> Télécharger
          </a>
        </div>
      </div>
      <div className="cv-viewer">
        {cvInfo?.type === "pdf" ? (
          <object data={cvInfo.url} type="application/pdf" aria-label="CV au format PDF">
            <a href={cvInfo.url}>Ouvrir le CV au format PDF</a>
          </object>
        ) : cvInfo?.type === "image" ? (
          <img className="cv-image-preview" src={cvInfo.url} alt="CV uploadé" />
        ) : (
          <div className="cv-empty">
            <FileText size={44} />
            <h3>CV pas encore ajouté</h3>
            <p>
              Ajoute ton CV depuis l'espace de gestion. Les formats PDF, JPG,
              PNG et WEBP seront visibles ici.
            </p>
          </div>
        )}
      </div>
    </RevealSection>
  );
}

function Lab({ content }: { content: SiteContent }) {
  return (
    <RevealSection className="lab section" id="labo">
      <div className="lab-panel">
        <div>
          <div className="section-kicker">Atelier produit</div>
          <h2>{content.labTitle}</h2>
          <p>{content.labIntro}</p>
          <div className="lab-console" aria-label="Cycle de recherche et développement">
            <div>
              <Activity size={16} />
              <code>watch ideas --iterate</code>
            </div>
            <div>
              <Code2 size={16} />
              <code>prototype --fast --human</code>
            </div>
          </div>
        </div>
        <div className="lab-list">
          {content.labs.map((item) => (
            <div key={item}>
              <Rocket size={18} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

function Contact({ content }: { content: SiteContent }) {
  return (
    <RevealSection className="contact section" id="contact">
      <div>
        <div className="section-kicker">Contact</div>
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
  return (
    <motion.section
      className={className}
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
    >
      {children}
    </motion.section>
  );
}

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
