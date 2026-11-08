export const adminDraftKey = "portfolio-admin-content-draft";

export type AdminDraft<TContent> = {
  content: TContent;
  savedAt: string;
};

export function getContentSnapshot<TContent>(content: TContent) {
  return JSON.stringify(stripRuntimeFields(content));
}

// One draft per content language; French keeps the original key so existing drafts survive.
function draftKey(language = "fr") {
  return language === "fr" ? adminDraftKey : `${adminDraftKey}-${language}`;
}

export function readAdminDraft<TContent>(language = "fr"): AdminDraft<TContent> | null {
  try {
    const rawDraft = localStorage.getItem(draftKey(language));
    if (!rawDraft) return null;
    const draft = JSON.parse(rawDraft) as AdminDraft<TContent>;
    if (!draft.content || !draft.savedAt) return null;
    return draft;
  } catch {
    return null;
  }
}

export function writeAdminDraft<TContent>(content: TContent, language = "fr") {
  const savedAt = new Date().toISOString();
  localStorage.setItem(draftKey(language), JSON.stringify({ content: stripRuntimeFields(content), savedAt }));
  return savedAt;
}

export function clearAdminDraft(language = "fr") {
  localStorage.removeItem(draftKey(language));
}

export function stripRuntimeFields<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
