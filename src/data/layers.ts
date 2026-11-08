import type { Language } from "../i18n/types";

type Localized = Record<Language, string>;

export type SystemLayer = {
  id: string;
  title: Localized;
  text: Localized;
  tech: string[];
  proofs: string[];
};

// One layer per level of a system, from what the user sees down to the infrastructure.
// `proofs` are project names shared by both locales, so they can open the project dialog.
export const systemLayers: SystemLayer[] = [
  {
    id: "interface",
    title: { fr: "Interface", en: "Interface" },
    text: {
      fr: "Des parcours web et mobiles clairs, rapides et accessibles, pensés pour l'usage réel.",
      en: "Clear, fast and accessible web and mobile journeys, designed for real use.",
    },
    tech: ["React", "Next.js", "Flutter", "GTK"],
    proofs: ["SevenOS", "MonBaobab", "ElegantStyle"],
  },
  {
    id: "api",
    title: { fr: "API & services", en: "API & services" },
    text: {
      fr: "Des API sécurisées et des workflows métier : rôles, JWT, double authentification, journal d'audit.",
      en: "Secure APIs and business workflows: roles, JWT, two-factor authentication, audit log.",
    },
    tech: ["NestJS", "Django", "Express", "Flask"],
    proofs: ["Simplon Procurement", "MonBaobab"],
  },
  {
    id: "messaging",
    title: { fr: "Messagerie", en: "Messaging" },
    text: {
      fr: "Des échanges asynchrones qui tiennent les coupures : outbox, idempotence, retry et file d'erreurs.",
      en: "Asynchronous exchanges that survive outages: outbox, idempotency, retries and dead-letter queues.",
    },
    tech: ["RabbitMQ", "Redis", "BullMQ", "WebSocket"],
    proofs: ["CocoMarket", "SevenOS", "Simplon Device Manager"],
  },
  {
    id: "data",
    title: { fr: "Données", en: "Data" },
    text: {
      fr: "Des modèles cohérents, sauvegardés et traçables, du poste local jusqu'au siège.",
      en: "Consistent, backed-up and traceable data models, from the local device to head office.",
    },
    tech: ["PostgreSQL", "MongoDB", "SQLite", "Prisma"],
    proofs: ["Simplon Device Manager", "CocoMarket"],
  },
  {
    id: "infrastructure",
    title: { fr: "Infrastructure & sécurité", en: "Infrastructure & security" },
    text: {
      fr: "Services système, privilèges contrôlés, conteneurs, supervision et cryptographie appliquée.",
      en: "System services, controlled privileges, containers, monitoring and applied cryptography.",
    },
    tech: ["Linux", "systemd", "Docker", "Prometheus", "AES-GCM"],
    proofs: ["SevenOS", "CocoMarket", "Crypted Message"],
  },
];
