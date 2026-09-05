import { normalizeResume, type ResumeData } from "./types";

const DRAFT_KEY = "curriculo-ats:rascunho";
const PENDING_KEY = "curriculo-ats:acao-pendente";
const RESUME_ID_KEY = "curriculo-ats:curriculo-id";

export type PendingAction = "salvar" | "exportar";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadDraft(): ResumeData | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return normalizeResume(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveDraft(data: ResumeData) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    /* armazenamento indisponível: o conteúdo continua na tela */
  }
}

export function clearDraft() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DRAFT_KEY);
  window.localStorage.removeItem(RESUME_ID_KEY);
}

export function setPendingAction(action: PendingAction | null) {
  if (!canUseStorage()) return;
  if (action) window.localStorage.setItem(PENDING_KEY, action);
  else window.localStorage.removeItem(PENDING_KEY);
}

export function getPendingAction(): PendingAction | null {
  if (!canUseStorage()) return null;
  const value = window.localStorage.getItem(PENDING_KEY);
  return value === "salvar" || value === "exportar" ? value : null;
}

export function setDraftResumeId(id: string | null) {
  if (!canUseStorage()) return;
  if (id) window.localStorage.setItem(RESUME_ID_KEY, id);
  else window.localStorage.removeItem(RESUME_ID_KEY);
}

export function getDraftResumeId(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(RESUME_ID_KEY);
}
