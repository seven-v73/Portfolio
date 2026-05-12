import { useEffect, useState } from "react";
import Lenis from "lenis";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Activity,
  BrainCircuit,
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
  Sparkles,
  Terminal,
} from "lucide-react";

const navItems = [
  { label: "Accueil", id: "top" },
  { label: "Profil", id: "profil" },
  { label: "Parcours", id: "parcours" },
  { label: "Stack", id: "stack" },
  { label: "Projets", id: "projets" },
  { label: "Labo", id: "labo" },
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

const projects = [
  {
    name: "ElegantStyle",
    type: "IA, mode africaine, AR/3D",
    focus: "Stylisme virtuel",
    description:
      "Application de recommandations vestimentaires, essayage virtuel et exploration de styles africains assistés par intelligence artificielle.",
    tags: ["IA", "Flutter", "Mode", "AR"],
  },
  {
    name: "BAOBAB / MonBaobab",
    type: "Culture, e-commerce, communauté",
    focus: "Patrimoine digital",
    description:
      "Plateforme culturelle pensée pour connecter contenus, boutiques, créateurs et communautés autour des patrimoines africains.",
    tags: ["React", "Node.js", "MongoDB", "Culture"],
  },
  {
    name: "BurkinaLoc",
    type: "Produit digital local",
    focus: "Service de proximité",
    description:
      "Solution orientée service local, pensée pour simplifier l'accès à la location et aux opportunités numériques de proximité.",
    tags: ["Produit", "UX", "Web"],
  },
  {
    name: "Suivi de cotisations",
    type: "Gestion, automatisation, clarté",
    focus: "Gestion communautaire",
    description:
      "Application de gestion permettant de suivre les contributions, les statuts et les informations essentielles d'une communauté.",
    tags: ["Gestion", "Backend", "Dashboard"],
  },
];

const labs = [
  "Essayage virtuel de tenues africaines avec IA générative",
  "Recommandation de styles selon morphologie, contexte et culture",
  "Marchés digitaux pour artisans, créateurs et marques locales",
  "Outils de santé, fintech et digitalisation accessibles en Afrique",
];

const metrics = [
  ["Mode build", "Web, API, mobile"],
  ["Approche", "UX terrain, code propre"],
  ["Mission", "Afrique, culture, impact"],
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
  "IA",
];

const identityPillars = [
  {
    title: "Je pense produit avant écran",
    text: "Chaque interface part d'un usage concret: ce que la personne veut faire, comprendre ou gagner en temps.",
  },
  {
    title: "Je code avec une console ouverte",
    text: "J'aime les outils lisibles, les scripts qui accélèrent, les logs utiles et les systèmes qu'on peut maintenir.",
  },
  {
    title: "Je relie technique et terrain",
    text: "Support IT, déploiement, backend, mobile et accompagnement: je construis en gardant la réalité des utilisateurs en tête.",
  },
];

const terminalLines = [
  { prompt: "whoami", output: "fullstack_dev --mobile --api --product" },
  { prompt: "git status --short", output: "M ideas/elegantstyle.ts  M baobab/community.api" },
  { prompt: "npm run build", output: "compiled with empathy, shipped with intent" },
  { prompt: "deploy --region africa", output: "interfaces utiles, culture vivante, impact local" },
];

const workflowCommands = [
  ["01", "probe", "comprendre le besoin réel avant de coder"],
  ["02", "design", "poser une interface claire et rapide à scanner"],
  ["03", "build", "livrer frontend, API, mobile ou automatisation"],
  ["04", "ship", "tester, documenter, améliorer avec les retours"],
];

const professionalTimeline = [
  {
    period: "Parcours actuel",
    title: "Développeur Fullstack & Mobile",
    detail:
      "Conception d'applications modernes avec Flutter, React, Node.js, MongoDB, Docker, Laravel et Java.",
  },
  {
    period: "Simplon CI",
    title: "Support IT, maintenance et accompagnement technique",
    detail:
      "Intervention sur le support, la maintenance, le développement et l'accompagnement autour d'outils numériques concrets.",
  },
  {
    period: "Produits en construction",
    title: "Entrepreneur tech orienté impact africain",
    detail:
      "Construction de projets comme ElegantStyle, BAOBAB / MonBaobab, BurkinaLoc et des outils de gestion communautaire.",
  },
];

const academicTimeline = [
  {
    period: "Formation continue",
    title: "Développement fullstack, mobile et produit numérique",
    detail:
      "Apprentissage et pratique autour des technologies web, mobile, backend, DevOps et IA appliquée.",
  },
  {
    period: "A compléter",
    title: "Diplômes, établissements et années exactes",
    detail:
      "Cette ligne est volontairement transparente: elle attend tes informations académiques exactes pour rester fidèle à ton parcours.",
  },
];

type StackGroup = typeof stacks[number];
type ProjectItem = typeof projects[number];
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

const defaultContent: SiteContent = {
  heroEyebrow: "Terminal-minded fullstack developer",
  heroTitle: "Je transforme les idées en produits qui respirent le code.",
  heroLead:
    "Développeur Fullstack & Mobile, je construis des expériences utiles avec une culture de ligne de commande: comprendre, prototyper, automatiser, livrer et rendre la technologie plus humaine.",
  profileCaption: "Fullstack, mobile, terminal et innovation africaine",
  metrics,
  techMarquee,
  aboutTitle:
    "Un développeur produit qui aime autant l'interface que le terminal derrière.",
  aboutParagraphs: [
    "Je conçois des applications modernes, utiles et centrées sur l'utilisateur: plateformes culturelles, outils de gestion, solutions e-commerce et expériences mobiles augmentées par l'IA.",
    "Mon réflexe: ouvrir le terminal, clarifier le problème, découper proprement, automatiser ce qui fatigue, puis livrer une expérience que quelqu'un peut vraiment utiliser.",
  ],
  identityTitle: "Une présence qui montre la manière de construire, pas seulement les outils.",
  identityIntro:
    "Le portfolio devient une fenêtre sur ton atelier: commandes, décisions produit, projets en chantier et attention portée aux utilisateurs.",
  identityPillars,
  journeyTitle: "Professionnel, académique et produit, sans récit inventé.",
  journeyIntro:
    "Les éléments ci-dessous reprennent uniquement les informations sûres. Les dates et diplômes exacts peuvent être ajoutés dès que tu me les donnes.",
  professionalTimeline,
  academicTimeline,
  stacks,
  projects,
  labTitle: "Des idées qui passent par le terminal avant de devenir produit.",
  labIntro:
    "Mon terrain de jeu: IA appliquée, stylisme virtuel, culture africaine, santé, fintech et outils qui simplifient le quotidien.",
  labs,
  contactTitle: "Construisons une solution qui a du sens.",
  contactText:
    "Disponible pour des projets web, mobile, IA, digitalisation et accompagnement technique.",
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
              Cette page est réservée à l'administration. Elle permet de valider
              l'accès avant d'ouvrir les futures fonctionnalités de gestion.
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
  const [jsonDrafts, setJsonDrafts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then((response) => (response.ok ? readJsonResponse(response) : Promise.reject()))
      .then((data) => setManagedContent(mergeContent(data.content || defaultContent)))
      .catch(() => setManagedContent(defaultContent));
  }, []);

  function setManagedContent(nextContent: SiteContent) {
    setContent(nextContent);
    setJsonDrafts({
      aboutParagraphs: pretty(nextContent.aboutParagraphs),
      metrics: pretty(nextContent.metrics),
      techMarquee: pretty(nextContent.techMarquee),
      identityPillars: pretty(nextContent.identityPillars),
      professionalTimeline: pretty(nextContent.professionalTimeline),
      academicTimeline: pretty(nextContent.academicTimeline),
      stacks: pretty(stripRuntimeFields(nextContent.stacks)),
      projects: pretty(nextContent.projects),
      labs: pretty(nextContent.labs),
    });
  }

  function updateField<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  function updateContactLink(key: keyof SiteContent["contactLinks"], value: string) {
    setContent((current) => ({
      ...current,
      contactLinks: { ...current.contactLinks, [key]: value },
    }));
  }

  function updateJsonField<K extends keyof SiteContent>(key: K, value: string) {
    setJsonDrafts((current) => ({ ...current, [String(key)]: value }));

    try {
      const parsed = JSON.parse(value);
      setContent((current) => ({ ...current, [key]: parsed }));
      setStatus("");
    } catch {
      setStatus(`JSON invalide dans ${String(key)}. Corrige avant de sauvegarder.`);
    }
  }

  async function saveContent() {
    setIsSaving(true);
    setStatus("");

    try {
      Object.entries(jsonDrafts).forEach(([key, value]) => {
        JSON.parse(value);
        if (!key) return;
      });

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
      setStatus("Contenu sauvegardé. Le portfolio public est à jour.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sauvegarde impossible.");
    } finally {
      setIsSaving(false);
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
          <h1 id="login-title">Gestion complète du contenu</h1>
          <p>
            Connecté avec <strong>{user.email}</strong>. Modifie le contenu, sauvegarde,
            puis rafraîchis le portfolio public pour voir les changements.
          </p>
        </div>
        <button className="secondary-action button-action" type="button" onClick={onLogout}>
          <LogOut size={18} /> Quitter
        </button>
      </div>

      <div className="admin-grid">
        <EditorCard title="Hero">
          <TextField label="Eyebrow" value={content.heroEyebrow} onChange={(value) => updateField("heroEyebrow", value)} />
          <TextAreaField label="Titre principal" value={content.heroTitle} onChange={(value) => updateField("heroTitle", value)} />
          <TextAreaField label="Description" value={content.heroLead} onChange={(value) => updateField("heroLead", value)} />
          <TextField label="Légende photo" value={content.profileCaption} onChange={(value) => updateField("profileCaption", value)} />
          <JsonField label="Métriques" value={jsonDrafts.metrics} onChange={(value) => updateJsonField("metrics", value)} />
          <JsonField label="Bandeau technologies" value={jsonDrafts.techMarquee} onChange={(value) => updateJsonField("techMarquee", value)} />
        </EditorCard>

        <EditorCard title="Profil & identité">
          <TextAreaField label="Titre profil" value={content.aboutTitle} onChange={(value) => updateField("aboutTitle", value)} />
          <JsonField label="Paragraphes profil" value={jsonDrafts.aboutParagraphs} onChange={(value) => updateJsonField("aboutParagraphs", value)} />
          <TextAreaField label="Titre identité" value={content.identityTitle} onChange={(value) => updateField("identityTitle", value)} />
          <TextAreaField label="Intro identité" value={content.identityIntro} onChange={(value) => updateField("identityIntro", value)} />
          <JsonField label="Piliers identité" value={jsonDrafts.identityPillars} onChange={(value) => updateJsonField("identityPillars", value)} />
        </EditorCard>

        <EditorCard title="Parcours">
          <TextAreaField label="Titre parcours" value={content.journeyTitle} onChange={(value) => updateField("journeyTitle", value)} />
          <TextAreaField label="Intro parcours" value={content.journeyIntro} onChange={(value) => updateField("journeyIntro", value)} />
          <JsonField label="Parcours professionnel" value={jsonDrafts.professionalTimeline} onChange={(value) => updateJsonField("professionalTimeline", value)} />
          <JsonField label="Parcours académique" value={jsonDrafts.academicTimeline} onChange={(value) => updateJsonField("academicTimeline", value)} />
        </EditorCard>

        <EditorCard title="Stack & projets">
          <JsonField label="Stack technique" value={jsonDrafts.stacks} onChange={(value) => updateJsonField("stacks", value)} />
          <JsonField label="Projets" value={jsonDrafts.projects} onChange={(value) => updateJsonField("projects", value)} />
        </EditorCard>

        <EditorCard title="Labo & contact">
          <TextAreaField label="Titre labo" value={content.labTitle} onChange={(value) => updateField("labTitle", value)} />
          <TextAreaField label="Intro labo" value={content.labIntro} onChange={(value) => updateField("labIntro", value)} />
          <JsonField label="Idées labo" value={jsonDrafts.labs} onChange={(value) => updateJsonField("labs", value)} />
          <TextAreaField label="Titre contact" value={content.contactTitle} onChange={(value) => updateField("contactTitle", value)} />
          <TextAreaField label="Texte contact" value={content.contactText} onChange={(value) => updateField("contactText", value)} />
          <TextField label="Email" value={content.contactLinks.email} onChange={(value) => updateContactLink("email", value)} />
          <TextField label="GitHub" value={content.contactLinks.github} onChange={(value) => updateContactLink("github", value)} />
          <TextField label="LinkedIn" value={content.contactLinks.linkedin} onChange={(value) => updateContactLink("linkedin", value)} />
          <TextField label="WhatsApp" value={content.contactLinks.whatsapp} onChange={(value) => updateContactLink("whatsapp", value)} />
        </EditorCard>
      </div>

      <div className="admin-savebar">
        {status ? <p>{status}</p> : <p>Les champs JSON permettent de gérer les listes complètes.</p>}
        <button className="primary-action button-action" type="button" onClick={saveContent} disabled={isSaving}>
          {isSaving ? "Sauvegarde..." : "Sauvegarder le contenu"}
        </button>
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

function JsonField({ label, value = "", onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      <textarea className="json-editor" rows={8} value={value} onChange={(event) => onChange(event.target.value)} spellCheck={false} />
    </label>
  );
}

function pretty(value: unknown) {
  return JSON.stringify(stripRuntimeFields(value), null, 2);
}

function stripRuntimeFields<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
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
        <span>AF</span>
        <strong>Portfolio</strong>
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
        <p className="eyebrow">
          <Terminal size={16} /> {content.heroEyebrow}
        </p>
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
      </motion.div>

      <motion.div
        className="hero-visual"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.1 }}
        aria-label="Portrait professionnel et terminal de développeur"
      >
        <TerminalPanel />
        <div className="portrait-card">
          <ProfileImage />
          <div className="profile-caption">
            <div>
              <span>Identité</span>
              <strong>{content.profileCaption}</strong>
            </div>
            <BrainCircuit size={24} />
          </div>
        </div>
      </motion.div>
      <TechMarquee items={content.techMarquee} />
    </section>
  );
}

function TerminalPanel() {
  return (
    <motion.aside
      className="terminal-panel"
      initial={{ opacity: 0, y: 18, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: -1.5 }}
      transition={{ duration: 0.7, delay: 0.35 }}
      aria-label="Aperçu terminal développeur"
    >
      <div className="terminal-top">
        <span />
        <span />
        <span />
        <strong>~/portfolio/live</strong>
      </div>
      <div className="terminal-body">
        {terminalLines.map((line) => (
          <div className="terminal-line" key={line.prompt}>
            <code>
              <span>$</span> {line.prompt}
            </code>
            <p>{line.output}</p>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}

function ProfileImage() {
  const [src, setSrc] = useState("/me.jpeg");

  return (
    <div className="profile-frame">
      <img
        src={src}
        alt="Portrait professionnel"
        onError={() => setSrc("/profile-placeholder.svg")}
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
          <h2>Des briques solides pour passer de l'idée au produit.</h2>
        </div>
        <p>
          Une base fullstack et mobile pour prototyper, livrer et faire évoluer
          des expériences fiables.
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
  return (
    <RevealSection className="section" id="projets">
      <div className="section-heading">
        <div>
          <div className="section-kicker">Projets</div>
          <h2>Des produits qui croisent technologie, usages et identité.</h2>
        </div>
        <a className="ghost-link" href="#contact">
          Discuter d'un projet <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="project-grid">
        {content.projects.map((project, index) => (
          <motion.article
            className="project-card"
            key={project.name}
            whileHover={{ y: -8, rotateX: 5, rotateY: index % 2 === 0 ? -5 : 5 }}
            transition={{ type: "spring", stiffness: 250, damping: 18 }}
          >
            <div className="project-depth" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="project-index">0{index + 1}</span>
            <div className="project-status">
              <GitBranch size={15} />
              <span>active branch</span>
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
          </motion.article>
        ))}
      </div>
    </RevealSection>
  );
}

function CvSection() {
  const [cvAvailable, setCvAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/cv.pdf", { method: "HEAD" })
      .then((response) => setCvAvailable(response.ok))
      .catch(() => setCvAvailable(false));
  }, []);

  return (
    <RevealSection className="cv-section section" id="cv">
      <div className="section-heading">
        <div>
          <div className="section-kicker">CV</div>
          <h2>Un CV consultable sans quitter le portfolio.</h2>
        </div>
        <div className="cv-actions">
          <a className="secondary-action" href="/cv.pdf" target="_blank" rel="noreferrer">
            <Eye size={18} /> Visionner
          </a>
          <a className="primary-action" href="/cv.pdf" download>
            <Download size={18} /> Télécharger
          </a>
        </div>
      </div>
      <div className="cv-viewer">
        {cvAvailable ? (
          <object data="/cv.pdf" type="application/pdf" aria-label="CV au format PDF">
            <a href="/cv.pdf">Ouvrir le CV au format PDF</a>
          </object>
        ) : (
          <div className="cv-empty">
            <FileText size={44} />
            <h3>CV prêt à être branché</h3>
            <p>
              Ajoute ton fichier PDF exact dans <strong>public/cv.pdf</strong>.
              Il sera automatiquement visible ici et téléchargeable par les visiteurs.
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
          <div className="section-kicker">Laboratoire R&D</div>
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
