export const adminDraftKey = "portfolio-admin-content-draft";

export type AdminDraft<TContent> = {
  content: TContent;
  savedAt: string;
};

export function getContentSnapshot<TContent>(content: TContent) {
  return JSON.stringify(stripRuntimeFields(content));
}

export function readAdminDraft<TContent>(): AdminDraft<TContent> | null {
  try {
    const rawDraft = localStorage.getItem(adminDraftKey);
    if (!rawDraft) return null;
    const draft = JSON.parse(rawDraft) as AdminDraft<TContent>;
    if (!draft.content || !draft.savedAt) return null;
    return draft;
  } catch {
    return null;
  }
}

export function writeAdminDraft<TContent>(content: TContent) {
  const savedAt = new Date().toISOString();
  localStorage.setItem(adminDraftKey, JSON.stringify({ content: stripRuntimeFields(content), savedAt }));
  return savedAt;
}

export function clearAdminDraft() {
  localStorage.removeItem(adminDraftKey);
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
