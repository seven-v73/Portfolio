import type { Language } from "../i18n/types";

type Localized = Record<Language, string>;

export type ArchitectureNode = {
  name: string | Localized;
  role: Localized;
};

// Main data path of each flagship project, taken from its README. Keys are the project names
// shared by both locales.
export const projectArchitectures: Record<string, ArchitectureNode[]> = {
  SevenOS: [
    { name: "Shell GTK", role: { fr: "Barre, Island, Dock", en: "Bar, Island, Dock" } },
    { name: "SevenBus", role: { fr: "Événements typés (Rust)", en: "Typed events (Rust)" } },
    { name: "polkit", role: { fr: "Autorisation", en: "Authorisation" } },
    { name: "System1", role: { fr: "Seule porte root (Rust)", en: "Only root gateway (Rust)" } },
    { name: "Btrfs", role: { fr: "Restauration, retour arrière", en: "Restore points, rollback" } },
  ],
  CocoMarket: [
    { name: { fr: "Caisse", en: "Till" }, role: { fr: "Vend hors ligne", en: "Sells offline" } },
    { name: "SQLite", role: { fr: "Outbox locale", en: "Local outbox" } },
    { name: "RabbitMQ", role: { fr: "Confirms, retry, DLQ", en: "Confirms, retry, DLQ" } },
    { name: "Consumer", role: { fr: "Idempotent", en: "Idempotent" } },
    { name: "PostgreSQL", role: { fr: "Siège", en: "Head office" } },
  ],
  "Simplon Device Manager": [
    { name: "Rust", role: { fr: "Agent Windows", en: "Windows agent" } },
    { name: "WebSocket", role: { fr: "Temps réel", en: "Real time" } },
    { name: "NestJS", role: { fr: "API centrale", en: "Core API" } },
    { name: "BullMQ", role: { fr: "Files Redis", en: "Redis queues" } },
    { name: "PostgreSQL", role: { fr: "Inventaire", en: "Inventory" } },
  ],
  "Crypted Message": [
    { name: "Alice", role: { fr: "Émetteur", en: "Sender" } },
    { name: "ECDH", role: { fr: "Échange de clés", en: "Key exchange" } },
    { name: "AES-GCM", role: { fr: "Chiffrement", en: "Encryption" } },
    { name: "ECDSA", role: { fr: "Signature", en: "Signature" } },
    { name: "Bob", role: { fr: "Vérifie", en: "Verifies" } },
  ],
  MonBaobab: [
    { name: "React", role: { fr: "Interface", en: "Interface" } },
    { name: "Express", role: { fr: "API, 2FA", en: "API, 2FA" } },
    { name: "MongoDB", role: { fr: "Contenus", en: "Content" } },
    { name: "Stripe", role: { fr: "Paiement", en: "Payments" } },
  ],
  "Simplon Procurement": [
    { name: { fr: "Demande", en: "Request" }, role: { fr: "Employé", en: "Employee" } },
    { name: { fr: "Étape 1", en: "Step 1" }, role: { fr: "Moyens généraux", en: "General services" } },
    { name: { fr: "Étape 2", en: "Step 2" }, role: { fr: "Comptabilité", en: "Accounting" } },
    { name: { fr: "Étape 3", en: "Step 3" }, role: { fr: "Direction", en: "Management" } },
    { name: "PostgreSQL", role: { fr: "Journal d'audit", en: "Audit log" } },
  ],
  ElegantStyle: [
    { name: "Flutter", role: { fr: "App mobile", en: "Mobile app" } },
    { name: "Firebase Auth", role: { fr: "Compte unique", en: "Single account" } },
    { name: "Firestore", role: { fr: "Données", en: "Data" } },
    { name: { fr: "4 espaces", en: "4 spaces" }, role: { fr: "Client, créateur, boutique, admin", en: "Client, designer, shop, admin" } },
  ],
};

export function getArchitecture(projectName: string) {
  return projectArchitectures[projectName] || [];
}

export function getNodeName(node: ArchitectureNode, language: Language) {
  return typeof node.name === "string" ? node.name : node.name[language];
}
