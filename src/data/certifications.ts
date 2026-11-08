import type { Language } from "../i18n/types";

export type CredentialKind = "professional-cert" | "specialization";

export type Certification = {
  title: string;
  issuer: string;
  issued: string;
  credentialId?: string;
  kind?: CredentialKind;
  featured?: boolean;
};

export type CertificationProof = {
  label: string;
  repo: string;
};

export type CertificationDomain = {
  id: string;
  label: Record<Language, string>;
  summary: Record<Language, string>;
  proofs: CertificationProof[];
  certifications: Certification[];
};

const githubBase = "https://github.com/seven-v73";

export const certificationDomains: CertificationDomain[] = [
  {
    id: "cloud-devops",
    label: { fr: "Cloud, DevOps & MLOps", en: "Cloud, DevOps & MLOps" },
    summary: {
      fr: "Architecture cloud, CI/CD, conteneurs, microservices et mise en production de modèles.",
      en: "Cloud architecture, CI/CD, containers, microservices and model deployment.",
    },
    proofs: [
      { label: "CocoMarket", repo: "CocoMarket" },
      { label: "DevOps Capstone", repo: "devops-capstone-project" },
      { label: "Customer Accounts", repo: "Customer-Accounts-microservice" },
    ],
    certifications: [
      { title: "AWS Cloud Solutions Architect", issuer: "Amazon Web Services", issued: "2026-10", credentialId: "8VNFNLFZICPG", kind: "professional-cert", featured: true },
      { title: "IBM DevOps and Software Engineering", issuer: "IBM", issued: "2026-10", credentialId: "9YZ5DFNGCMR8", kind: "professional-cert", featured: true },
      { title: "MLOps | Machine Learning Operations", issuer: "Duke University", issued: "2026-10", credentialId: "FU3RWFSUQI5Z", kind: "specialization", featured: true },
      { title: "Microservices Architecture: Design Patterns & Principles", issuer: "Packt", issued: "2026-10", credentialId: "SCIFEDTE0ACG", kind: "specialization" },
      { title: "Cloud Computing for Data Science", issuer: "University of Pittsburgh", issued: "2026-10", credentialId: "MBY541FO1PL2", kind: "specialization" },
      { title: "Microsoft Azure Cloud for Beginners: Skills & Infrastructure", issuer: "Whizlabs", issued: "2026-10", credentialId: "KJCEFHWFHMB4", kind: "specialization" },
      { title: "Machine Learning Operations (MLOps)", issuer: "Board Infinity", issued: "2026-10", credentialId: "0AT5S0IV5FBO", kind: "specialization" },
      { title: "Mastering GitHub for Developers and DevOps", issuer: "Packt", issued: "2026-10", credentialId: "W0HPC00M5AFA", kind: "specialization" },
    ],
  },
  {
    id: "security",
    label: { fr: "Cybersécurité & sécurité de l'IA", en: "Cybersecurity & AI security" },
    summary: {
      fr: "Analyse de menaces, hacking éthique, cryptographie appliquée et sécurisation des systèmes d'IA.",
      en: "Threat analysis, ethical hacking, applied cryptography and securing AI systems.",
    },
    proofs: [
      { label: "Crypted Message", repo: "Crypted_Message" },
      { label: "MonBaobab (2FA)", repo: "BAOBAB" },
    ],
    certifications: [
      { title: "Google Cybersecurity", issuer: "Google", issued: "2026-10", credentialId: "QSTXUSUJOPTD", kind: "professional-cert", featured: true },
      { title: "IBM Cybersecurity Analyst", issuer: "IBM", issued: "2026-10", credentialId: "R783ZDL3FEYV", kind: "professional-cert", featured: true },
      { title: "IBM Ethical Hacking with Open Source Tools", issuer: "IBM", issued: "2026-10", credentialId: "C5QQDTWUF0ZE", kind: "professional-cert", featured: true },
      { title: "AI-Powered Cybersecurity", issuer: "Macquarie University", issued: "2026-10", credentialId: "QZQXIRVF1G8M", kind: "specialization" },
      { title: "AI Security: Security in the Age of Artificial Intelligence", issuer: "Coursera", issued: "2026-10", credentialId: "FHH2LYJ0AMGD", kind: "specialization" },
      { title: "AI Systems Reliability & Security", issuer: "Coursera", issued: "2026-10", credentialId: "P9NHNBSHGUQE", kind: "specialization" },
      { title: "Microsoft Foundations of Cybersecurity, Networking, and Cloud Systems", issuer: "Microsoft", issued: "2026-10", credentialId: "F0HX7OVRT95E", kind: "specialization" },
      { title: "Introduction to Cybersecurity", issuer: "Cisco", issued: "2024-09" },
    ],
  },
  {
    id: "data-ai",
    label: { fr: "Data & Intelligence artificielle", en: "Data & Artificial Intelligence" },
    summary: {
      fr: "Machine learning, data engineering, analyse et visualisation de données.",
      en: "Machine learning, data engineering, data analysis and visualisation.",
    },
    proofs: [
      { label: "Emotion Detection", repo: "final_project_emotion_detection" },
      { label: "Data Visualisation", repo: "data_visualisation" },
    ],
    certifications: [
      { title: "Machine Learning", issuer: "DeepLearning.AI · Stanford", issued: "2026-10", credentialId: "IH11OCEEPRXX", kind: "specialization", featured: true },
      { title: "IBM Data Science", issuer: "IBM", issued: "2026-11", credentialId: "PZASNNV38QV3", kind: "professional-cert", featured: true },
      { title: "IBM Data Engineering", issuer: "IBM", issued: "2026-11", credentialId: "7Q9MAWH4426M", kind: "professional-cert", featured: true },
      { title: "Google Advanced Data Analytics", issuer: "Google", issued: "2026-10", credentialId: "CSS5ABD4EK1R", kind: "professional-cert" },
      { title: "IBM Data Analytics with Excel and R", issuer: "IBM", issued: "2026-11", credentialId: "2U67ZWEPZDTC", kind: "professional-cert" },
      { title: "Data Science Foundations", issuer: "University of London", issued: "2026-10", credentialId: "QMKL5LWWE6JX", kind: "specialization" },
      { title: "Data Science Essentials: Analysis, Statistics, and ML", issuer: "Packt", issued: "2026-10", credentialId: "E6XZW588Z1NP", kind: "specialization" },
      { title: "Machine Learning Onramp", issuer: "MathWorks", issued: "2024-08" },
    ],
  },
  {
    id: "software",
    label: { fr: "Génie logiciel & algorithmique", en: "Software engineering & algorithms" },
    summary: {
      fr: "Algorithmes, conception logicielle, back-end, full-stack et mobile.",
      en: "Algorithms, software design, back-end, full-stack and mobile.",
    },
    proofs: [
      { label: "MonBaobab", repo: "BAOBAB" },
      { label: "Simplon Procurement", repo: "simplon-procurement-backend" },
      { label: "ElegantStyle", repo: "elegantfaso" },
    ],
    certifications: [
      { title: "Algorithms", issuer: "Stanford University", issued: "2026-09", credentialId: "A8YJA9BK1RKZ", kind: "specialization", featured: true },
      { title: "Software Engineering", issuer: "The Hong Kong University of Science and Technology", issued: "2026-08", credentialId: "CHH9ICAFICL1", kind: "specialization", featured: true },
      { title: "IBM Back-End Development", issuer: "IBM", issued: "2026-10", credentialId: "KYZK6P8NC178", kind: "professional-cert", featured: true },
      { title: "Microsoft Full-Stack Developer", issuer: "Microsoft", issued: "2026-10", credentialId: "LJTUSUL8B67D", kind: "professional-cert" },
      { title: "IBM Java Developer", issuer: "IBM", issued: "2026-10", credentialId: "1UOU84AGUJX0", kind: "professional-cert" },
      { title: "IBM iOS and Android Mobile App Developer", issuer: "IBM", issued: "2026-11", credentialId: "RFKBUC7F1D0U", kind: "professional-cert" },
      { title: "IBM Mainframe Developer", issuer: "IBM", issued: "2026-10", credentialId: "BRX9SIY2NJF1", kind: "professional-cert" },
      { title: "Master AI Coding Agents for Advanced Software Development", issuer: "SkillsBooster", issued: "2026-10", credentialId: "AJOJE24NBLCN", kind: "specialization" },
    ],
  },
  {
    id: "systems",
    label: { fr: "Systèmes d'exploitation & réseaux", en: "Operating systems & networks" },
    summary: {
      fr: "Noyau, mémoire, virtualisation, communication réseau et support des infrastructures.",
      en: "Kernels, memory, virtualisation, network communication and infrastructure support.",
    },
    proofs: [
      { label: "Simplon Device Manager", repo: "SDM" },
      { label: "Seven Control", repo: "MDM_System" },
      { label: "Client-serveur", repo: "devinette_client-serveur" },
    ],
    certifications: [
      { title: "Mastering Operating Systems", issuer: "Illinois Institute of Technology", issued: "2026-09", credentialId: "EBH97WVR47S2", kind: "specialization", featured: true },
      { title: "Introduction to Operating Systems", issuer: "Codio", issued: "2026-09", credentialId: "R5PAAU72OCW2", kind: "specialization", featured: true },
      { title: "Computer Communications", issuer: "University of Colorado System", issued: "2026-09", credentialId: "HMOEKJ6NYAZ7", kind: "specialization", featured: true },
      { title: "Google IT Support", issuer: "Google", issued: "2026-10", credentialId: "KF2X1HBYHI8Z", kind: "professional-cert" },
      { title: "Essential Mathematics for Computer Science", issuer: "University of London", issued: "", credentialId: "CDL1ERF38MWF", kind: "specialization" },
      { title: "Computer Hardware Basics", issuer: "Cisco", issued: "2024-09" },
    ],
  },
  {
    id: "iot",
    label: { fr: "IoT & systèmes embarqués", en: "IoT & embedded systems" },
    summary: {
      fr: "Programmation Arduino en C, capteurs, communication entre objets connectés.",
      en: "Arduino programming in C, sensors, communication between connected devices.",
    },
    proofs: [{ label: "Learning C", repo: "Learning_C" }],
    certifications: [
      { title: "An Introduction to Programming the Internet of Things (IoT)", issuer: "UC Irvine", issued: "2026-10", credentialId: "XJOFX3XLPR9R", kind: "specialization", featured: true },
      { title: "Hands-on Internet of Things", issuer: "University of Illinois Urbana-Champaign", issued: "2026-10", credentialId: "F2KK6NFMPYMZ", kind: "specialization", featured: true },
      { title: "Arduino Programming and Project Development", issuer: "Packt", issued: "2026-10", credentialId: "BQSN40RG9VZS", kind: "specialization" },
    ],
  },
  {
    id: "design",
    label: { fr: "Design & produit", en: "Design & product" },
    summary: {
      fr: "UI/UX, design graphique et développement de produit numérique.",
      en: "UI/UX, graphic design and digital product development.",
    },
    proofs: [
      { label: "ElegantStyle", repo: "elegantfaso" },
      { label: "Portfolio", repo: "Portfolio" },
    ],
    certifications: [
      { title: "UI / UX Design", issuer: "California Institute of the Arts", issued: "2026-11", credentialId: "8SK6FUKFZPQ7", kind: "specialization", featured: true },
      { title: "Graphic Design", issuer: "California Institute of the Arts", issued: "2026-11", credentialId: "I49FQRFD2KEM", kind: "specialization", featured: true },
      { title: "From Zero to Hero - Digital Product Development From Scratch", issuer: "Technical University of Munich", issued: "2024-11", credentialId: "FW3IU0P6539N" },
    ],
  },
  {
    id: "business",
    label: { fr: "Business & systèmes d'entreprise", en: "Business & enterprise systems" },
    summary: {
      fr: "Analyse métier, ERP SAP, transformation digitale et marketing numérique.",
      en: "Business analysis, SAP ERP, digital transformation and digital marketing.",
    },
    proofs: [{ label: "Simplon Procurement", repo: "simplon-procurement-backend" }],
    certifications: [
      { title: "SAP Business Analyst", issuer: "SAP", issued: "2026-10", credentialId: "8VUD0FRVGI7C", kind: "professional-cert", featured: true },
      { title: "SAP Technology Consultant", issuer: "SAP", issued: "2026-10", credentialId: "X4KF4SL6TK9V", kind: "professional-cert", featured: true },
      { title: "Leading the Modern Day Business", issuer: "University of Virginia", issued: "2026-10", credentialId: "9GMOK7G943CS", kind: "specialization" },
      { title: "Google Digital Marketing & E-commerce", issuer: "Google", issued: "2026-10", credentialId: "BYEPM5S4DX98", kind: "professional-cert" },
      { title: "Meta Community Management", issuer: "Meta", issued: "2026-10", credentialId: "6A36CP76AIT4", kind: "professional-cert" },
      { title: "Microsoft 365 Fundamentals", issuer: "Microsoft", issued: "2026-10", credentialId: "O8CX16KWOGZ4", kind: "specialization" },
      { title: "Entrepreneurial Case Study Workshop", issuer: "Burkina Institute of Technology", issued: "2024-10" },
    ],
  },
  {
    id: "transmission",
    label: { fr: "Transmettre & impact", en: "Teaching & impact" },
    summary: {
      fr: "Formation d'adultes, montage de projets de développement et IA générative.",
      en: "Adult training, development project design and generative AI.",
    },
    proofs: [],
    certifications: [
      { title: "Former des adultes : principes et méthodes", issuer: "Agence Française de Développement", issued: "2025-11", featured: true },
      { title: "Définir le montage opérationnel des projets", issuer: "Agence Française de Développement", issued: "2025-11", featured: true },
      { title: "Atelier d'initiation à l'IA générative", issuer: "Simplon.co", issued: "2025-10" },
      { title: "Les compétences du 21e siècle", issuer: "Agence Française de Développement", issued: "2025-11" },
      { title: "Droits humains et développement durable", issuer: "Agence Française de Développement", issued: "2025-11" },
      { title: "L'étude du comportement humain, levier pour l'action publique", issuer: "Agence Française de Développement", issued: "2025-11" },
    ],
  },
];

export function getCredentialUrl(certification: Certification) {
  if (!certification.credentialId || !certification.kind) return "";
  return `https://www.coursera.org/account/accomplishments/${certification.kind}/${certification.credentialId}`;
}

export function getProofUrl(proof: CertificationProof) {
  return `${githubBase}/${proof.repo}`;
}

export function getCertificationStats(domains = certificationDomains) {
  const certifications = domains.flatMap((domain) => domain.certifications);
  return {
    total: certifications.length,
    verifiable: certifications.filter((certification) => getCredentialUrl(certification)).length,
    issuers: new Set(certifications.map((certification) => certification.issuer)).size,
    domains: domains.length,
  };
}

export function formatIssuedDate(issued: string, language: Language) {
  const match = /^(\d{4})-(\d{2})$/.exec(issued);
  if (!match) return "";
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", { month: "short", year: "numeric" }).format(date);
}
