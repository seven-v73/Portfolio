export type Language = "fr" | "en";

export type ProjectItem = {
  name: string;
  type: string;
  focus: string;
  description: string;
  detail?: string;
  tags: string[];
  logoUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  githubRepo?: string;
  githubUpdatedAt?: string;
  githubStars?: number;
  githubForks?: number;
  source?: "manual" | "github";
  apkUrl?: string;
  apkName?: string;
  screenshots?: {
    url: string;
    alt?: string;
  }[];
};

export type StackGroup = {
  title: string;
  items: {
    name: string;
    logo: string;
  }[];
};

export type TimelineItem = {
  period: string;
  title: string;
  detail: string;
};

export type IdentityPillar = {
  title: string;
  text: string;
};

export type SiteContent = {
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

export type UiCopy = {
  languageName: string;
  languageToggleLabel: string;
  switchTo: string;
  skipLink: string;
  brandAria: string;
  brandTitle: string;
  heroBoot: string;
  heroProjects: string;
  heroContact: string;
  recruiterBriefAria: string;
  recruiterBriefTitle: string;
  recruiterBriefIntro: string;
  recruiterBriefItems: string[][];
  recruiterBriefLinks: {
    projects: string;
    resume: string;
    contact: string;
  };
  nav: Record<string, string>;
  sectionKickers: {
    profile: string;
    identity: string;
    journey: string;
    stack: string;
    projects: string;
    lab: string;
    certifications: string;
    contact: string;
  };
  workflowAria: string;
  workflowCommands: string[][];
  journeyProfessional: string;
  journeyAcademic: string;
  stackTitle: string;
  stackIntro: string;
  projectsTitle: string;
  projectsCta: string;
  projectFiltersAria: string;
  projectSearchLabel: string;
  projectSearchPlaceholder: string;
  projectFilterAria: string;
  allProjects: string;
  projectOpenAria: string;
  githubLive: string;
  projectInProgress: string;
  updatedShort: string;
  updatedLong: string;
  star: string;
  stars: string;
  fork: string;
  forks: string;
  view: string;
  code: string;
  noProjectTitle: string;
  noProjectText: string;
  reset: string;
  close: string;
  projectPreviewAlt: string;
  projectScreenshotAlt: string;
  projectGalleryAria: string;
  viewProject: string;
  downloadApk: string;
  viewCode: string;
  cvTitle: string;
  cvView: string;
  cvDownload: string;
  cvPdfAria: string;
  cvOpenPdf: string;
  cvImageAlt: string;
  cvMissingTitle: string;
  cvMissingText: string;
  cvAvailableTitle: string;
  cvAvailableText: string;
  certificationsKicker: string;
  certificationsTitle: string;
  certificationsView: string;
  certificationsMissingTitle: string;
  certificationsMissingText: string;
  certificationsAvailableTitle: string;
  certificationsAvailableText: string;
  labSession: string;
  labOs: string;
  labCycleAria: string;
  techMarqueeAria: string;
  terminal: {
    title: string;
    loadingAria: string;
    loadingMode: string;
    loadingLineOne: string;
    loadingLineTwo: string;
    profile: string;
    visitor: string;
    path: string;
    help: string;
    active: string;
    simple: string;
    dashboardAria: string;
    objective: string;
    next: string;
    activity: string;
    commands: string;
    quickActionsAria: string;
    recruiterPath: string;
    viewProjects: string;
    developerMode: string;
    paletteAria: string;
    palettePlaceholder: string;
    commandInputAria: string;
  };
};

export type LocaleBundle = {
  content: SiteContent;
  ui: UiCopy;
};
