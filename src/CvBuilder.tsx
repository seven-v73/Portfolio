import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, Download, ExternalLink, Github, Globe2, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { certificationDomains, formatIssuedDate, getCertificationStats, getCredentialUrl } from "./data/certifications";
import type { Language, ProjectItem, SiteContent } from "./i18n/types";
import "./cv.css";

type Template = "modern" | "ats";
type Accent = "blue" | "violet" | "green" | "graphite";

const accents: Record<Accent, { label: string; color: string; tint: string }> = {
  blue: { label: "Bleu", color: "#0058b8", tint: "#eef4fc" },
  violet: { label: "Violet", color: "#5b3fc4", tint: "#f2effc" },
  green: { label: "Vert", color: "#16714a", tint: "#edf6f1" },
  graphite: { label: "Graphite", color: "#2c2c2e", tint: "#f2f2f4" },
};

const labels = {
  fr: {
    builder: "Générateur de CV",
    builderIntro: "Le CV se construit à partir du contenu du portfolio et de l'espace de gestion.",
    language: "Langue",
    template: "Modèle",
    modern: "Moderne",
    ats: "Sobre (ATS)",
    color: "Couleur",
    sections: "Sections",
    photo: "Photo",
    projects: "Projets",
    certifications: "Certifications",
    education: "Formation",
    interests: "Centres d'intérêt",
    download: "Télécharger en PDF",
    back: "Retour à la gestion",
    printHint: "Dans la fenêtre d'impression : destination « Enregistrer en PDF », format A4, marges « Aucune », graphiques d'arrière-plan activés. Tu peux ensuite publier ce PDF depuis la gestion › CV public.",
    draftNotice: "Aperçu du brouillon non publié de l'espace de gestion.",
    loading: "Préparation du CV…",
    profile: "Profil",
    experience: "Expérience professionnelle",
    selectedProjects: "Projets",
    skills: "Compétences",
    contact: "Contact",
    languages: "Langues",
    privateCode: "Code privé, démonstration sur demande",
    certificationsSummary: (total: number, verifiable: number) => `${total} certifications, dont ${verifiable} vérifiables en ligne.`,
    portfolio: "Portfolio",
  },
  en: {
    builder: "Resume builder",
    builderIntro: "The resume is built from the portfolio content and the admin space.",
    language: "Language",
    template: "Template",
    modern: "Modern",
    ats: "Plain (ATS)",
    color: "Colour",
    sections: "Sections",
    photo: "Photo",
    projects: "Projects",
    certifications: "Certifications",
    education: "Education",
    interests: "Interests",
    download: "Download as PDF",
    back: "Back to admin",
    printHint: "In the print dialog: destination \"Save as PDF\", A4 paper, margins \"None\", background graphics on. You can then publish the PDF from the admin › Public resume.",
    draftNotice: "Preview of the unpublished admin draft.",
    loading: "Preparing the resume…",
    profile: "Profile",
    experience: "Experience",
    selectedProjects: "Projects",
    skills: "Skills",
    contact: "Contact",
    languages: "Languages",
    privateCode: "Private code, demo on request",
    certificationsSummary: (total: number, verifiable: number) => `${total} certifications, ${verifiable} verifiable online.`,
    portfolio: "Portfolio",
  },
} as const;

const SHEET_WIDTH_PX = 794; // 210 mm at 96 dpi

export type CvContentLoader = (language: Language, useDraft: boolean) => Promise<{ content: SiteContent; fromDraft: boolean }>;

export default function CvBuilder({ initialLanguage, loadContent }: { initialLanguage: Language; loadContent: CvContentLoader }) {
  const params = new URLSearchParams(window.location.search);
  const useDraft = params.get("source") === "draft";
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [fromDraft, setFromDraft] = useState(false);
  const [template, setTemplate] = useState<Template>("modern");
  const [accent, setAccent] = useState<Accent>("blue");
  const [showPhoto, setShowPhoto] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showCertifications, setShowCertifications] = useState(true);
  const [showEducation, setShowEducation] = useState(true);
  const [showInterests, setShowInterests] = useState(true);
  const [portraitSrc, setPortraitSrc] = useState("/portrait.jpeg");
  const t = labels[language];

  useEffect(() => {
    let isMounted = true;
    setContent(null);
    loadContent(language, useDraft).then((result) => {
      if (!isMounted) return;
      setContent(result.content);
      setFromDraft(result.fromDraft);
    });
    return () => {
      isMounted = false;
    };
  }, [language, loadContent, useDraft]);

  useEffect(() => {
    fetch(`/profile-manifest.json?t=${Date.now()}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (data.url) setPortraitSrc(data.url);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `CV — Victoire SAWADOGO (${language.toUpperCase()})`;
  }, [language]);

  return (
    <div className="cv-builder" data-theme-scope="light">
      <aside className="cv-toolbar" aria-label={t.builder}>
        <a className="cv-back" href="/login">
          <ArrowLeft size={16} aria-hidden="true" /> {t.back}
        </a>
        <h1>{t.builder}</h1>
        <p className="cv-toolbar-intro">{t.builderIntro}</p>

        <fieldset>
          <legend>{t.language}</legend>
          <div className="cv-segmented">
            {(["fr", "en"] as const).map((value) => (
              <button key={value} type="button" aria-pressed={language === value} onClick={() => setLanguage(value)}>
                {value === "fr" ? "Français" : "English"}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>{t.template}</legend>
          <div className="cv-segmented">
            {(["modern", "ats"] as const).map((value) => (
              <button key={value} type="button" aria-pressed={template === value} onClick={() => setTemplate(value)}>
                {t[value]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>{t.color}</legend>
          <div className="cv-swatches">
            {(Object.keys(accents) as Accent[]).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={accent === value}
                aria-label={accents[value].label}
                title={accents[value].label}
                style={{ background: accents[value].color }}
                onClick={() => setAccent(value)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>{t.sections}</legend>
          <CvToggle label={t.photo} checked={showPhoto} onChange={setShowPhoto} disabled={template === "ats"} />
          <CvToggle label={t.projects} checked={showProjects} onChange={setShowProjects} />
          <CvToggle label={t.certifications} checked={showCertifications} onChange={setShowCertifications} />
          <CvToggle label={t.education} checked={showEducation} onChange={setShowEducation} />
          <CvToggle label={t.interests} checked={showInterests} onChange={setShowInterests} />
        </fieldset>

        <button className="button button-primary cv-download" type="button" onClick={() => window.print()} disabled={!content}>
          <Download size={17} aria-hidden="true" /> {t.download}
        </button>
        <p className="cv-hint">{t.printHint}</p>
        {fromDraft ? <p className="cv-draft-notice">{t.draftNotice}</p> : null}
      </aside>

      <main className="cv-stage">
        {content ? (
          <ScaledSheet>
            <CvSheet
              content={content}
              language={language}
              template={template}
              accent={accent}
              portraitSrc={showPhoto && template === "modern" ? portraitSrc : ""}
              showProjects={showProjects}
              showCertifications={showCertifications}
              showEducation={showEducation}
              showInterests={showInterests}
            />
          </ScaledSheet>
        ) : (
          <p className="cv-loading">{t.loading}</p>
        )}
      </main>
    </div>
  );
}

function CvToggle({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`cv-toggle ${disabled ? "is-disabled" : ""}`}>
      <input type="checkbox" checked={checked && !disabled} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

// Shrinks the A4 sheet to the available width on screen; printing always uses the real size.
function ScaledSheet({ children }: { children: React.ReactNode }) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const sheet = sheetRef.current;
    if (!frame || !sheet) return;

    function measure() {
      const nextScale = Math.min(1, frame!.clientWidth / SHEET_WIDTH_PX);
      setScale(nextScale);
      setHeight(sheet!.offsetHeight * nextScale);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="cv-frame" ref={frameRef} style={{ height }}>
      <div className="cv-scale" ref={sheetRef} style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

function shortUrl(url: string) {
  return url.split("?")[0].replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function CvSheet({
  content,
  language,
  template,
  accent,
  portraitSrc,
  showProjects,
  showCertifications,
  showEducation,
  showInterests,
}: {
  content: SiteContent;
  language: Language;
  template: Template;
  accent: Accent;
  portraitSrc: string;
  showProjects: boolean;
  showCertifications: boolean;
  showEducation: boolean;
  showInterests: boolean;
}) {
  const t = labels[language];
  const cv = content.cv;
  const stats = getCertificationStats();
  const selectedProjects = cv.projects
    .map((name) => content.projects.find((project) => project.name === name))
    .filter((project): project is ProjectItem => Boolean(project));
  const projects = selectedProjects.length ? selectedProjects : content.projects.slice(0, 4);
  const programmes = certificationDomains
    .flatMap((domain) => domain.certifications)
    .filter((certification) => certification.kind && certification.featured)
    .slice(0, 6);
  const style = { "--cv-accent": accents[accent].color, "--cv-tint": accents[accent].tint } as React.CSSProperties;

  const contactItems = [
    { icon: Mail, label: content.contactLinks.email, href: `mailto:${content.contactLinks.email}` },
    cv.phone ? { icon: Phone, label: cv.phone, href: `tel:${cv.phone.replace(/\s/g, "")}` } : null,
    cv.location ? { icon: MapPin, label: cv.location, href: "" } : null,
    cv.website ? { icon: Globe2, label: shortUrl(cv.website), href: cv.website.startsWith("http") ? cv.website : `https://${cv.website}` } : null,
    { icon: Linkedin, label: shortUrl(content.contactLinks.linkedin), href: content.contactLinks.linkedin },
    { icon: Github, label: shortUrl(content.contactLinks.github), href: content.contactLinks.github },
  ].filter((item): item is { icon: typeof Mail; label: string; href: string } => Boolean(item));

  const header = (
    <header className="cvs-header">
      {portraitSrc ? <img className="cvs-photo" src={portraitSrc} alt="" /> : null}
      <div>
        <h2 className="cvs-name">Victoire SAWADOGO</h2>
        <p className="cvs-headline">{cv.headline || content.profileCaption}</p>
      </div>
    </header>
  );

  const contact = (
    <section className="cvs-block">
      <h3 className="cvs-title">{t.contact}</h3>
      <ul className="cvs-contact">
        {contactItems.map(({ icon: Icon, label, href }) => (
          <li key={label}>
            <Icon size={12} aria-hidden="true" />
            {href ? <a href={href}>{label}</a> : <span>{label}</span>}
          </li>
        ))}
      </ul>
    </section>
  );

  const summary = (
    <section className="cvs-block">
      <h3 className="cvs-title">{t.profile}</h3>
      <p className="cvs-summary">{cv.summary || content.heroLead}</p>
    </section>
  );

  const experience = (
    <section className="cvs-block">
      <h3 className="cvs-title">{t.experience}</h3>
      {content.professionalTimeline.map((item) => (
        <article className="cvs-entry" key={`${item.period}-${item.title}`}>
          <div className="cvs-entry-head">
            <strong>{item.title}</strong>
            <span>{item.period}</span>
          </div>
          <p>{item.detail}</p>
        </article>
      ))}
    </section>
  );

  const projectBlock = showProjects ? (
    <section className="cvs-block">
      <h3 className="cvs-title">{t.selectedProjects}</h3>
      {projects.map((project) => (
        <article className="cvs-entry" key={project.name}>
          <div className="cvs-entry-head">
            <strong>
              {project.name} <em>· {project.focus}</em>
            </strong>
            {project.githubUrl ? (
              <a href={project.githubUrl}>
                {shortUrl(project.githubUrl).replace("github.com/", "")} <ExternalLink size={9} aria-hidden="true" />
              </a>
            ) : project.privateRepo ? (
              <span>{t.privateCode}</span>
            ) : null}
          </div>
          <p>{project.description}</p>
          <p className="cvs-tags">{project.tags.slice(0, 6).join(" · ")}</p>
        </article>
      ))}
    </section>
  ) : null;

  const education = showEducation ? (
    <section className="cvs-block">
      <h3 className="cvs-title">{t.education}</h3>
      {content.academicTimeline.slice(0, 3).map((item) => (
        <article className="cvs-entry" key={`${item.period}-${item.title}`}>
          <div className="cvs-entry-head">
            <strong>{item.title}</strong>
            <span>{item.period}</span>
          </div>
          <p>{item.detail}</p>
        </article>
      ))}
    </section>
  ) : null;

  const skills = (
    <section className="cvs-block">
      <h3 className="cvs-title">{t.skills}</h3>
      <dl className="cvs-skills">
        {content.stacks.map((group) => (
          <div key={group.title}>
            <dt>{group.title}</dt>
            <dd>{group.items.map((item) => item.name).join(" · ")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );

  const certifications = showCertifications ? (
    <section className="cvs-block">
      <h3 className="cvs-title">{t.certifications}</h3>
      <ul className="cvs-certs">
        {programmes.map((certification) => {
          const url = getCredentialUrl(certification);
          return (
            <li key={certification.title}>
              {url ? <a href={url}>{certification.title}</a> : <strong>{certification.title}</strong>}
              <span>
                {certification.issuer} · {formatIssuedDate(certification.issued, language)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="cvs-note">{t.certificationsSummary(stats.total, stats.verifiable)}</p>
    </section>
  ) : null;

  const languages = cv.languages.length ? (
    <section className="cvs-block">
      <h3 className="cvs-title">{t.languages}</h3>
      <p className="cvs-list">{cv.languages.join(" · ")}</p>
    </section>
  ) : null;

  const interests = showInterests && cv.interests.length ? (
    <section className="cvs-block">
      <h3 className="cvs-title">{t.interests}</h3>
      <p className="cvs-list">{cv.interests.join(" · ")}</p>
    </section>
  ) : null;

  if (template === "ats") {
    return (
      <article className="cv-sheet cv-ats" style={style} lang={language}>
        {header}
        <ul className="cvs-contact cvs-contact-inline">
          {contactItems.map(({ label, href }) => (
            <li key={label}>{href ? <a href={href}>{label}</a> : label}</li>
          ))}
        </ul>
        {summary}
        {experience}
        {projectBlock}
        {education}
        {skills}
        {certifications}
        {languages}
        {interests}
      </article>
    );
  }

  return (
    <article className="cv-sheet cv-modern" style={style} lang={language}>
      <div className="cvs-side">
        {portraitSrc ? <img className="cvs-photo" src={portraitSrc} alt="" /> : null}
        {contact}
        {skills}
        {certifications}
        {languages}
        {interests}
      </div>
      <div className="cvs-main">
        <header className="cvs-header">
          <h2 className="cvs-name">Victoire SAWADOGO</h2>
          <p className="cvs-headline">{cv.headline || content.profileCaption}</p>
        </header>
        {summary}
        {experience}
        {projectBlock}
        {education}
      </div>
    </article>
  );
}
