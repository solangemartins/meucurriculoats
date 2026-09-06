import { defaultPreferences, normalizePreferences, type AnalysisPreferences, type ResumeSource } from "./preferences";
import { normalizeAnalysis, type AnalysisResult, type JobInput } from "./types";

const KEY = "curriculo-ats:analise-fluxo";

export interface LocalAnalysisFlow {
  job: JobInput;
  preferences: AnalysisPreferences;
  source: ResumeSource | null;
  pastedText: string;
  savedResumeId: string | null;
  result: AnalysisResult | null;
  createdAt: string;
}

export function emptyFlow(): LocalAnalysisFlow {
  return {
    job: { jobTitle: "", company: "", jobDescription: "" },
    preferences: defaultPreferences(),
    source: null,
    pastedText: "",
    savedResumeId: null,
    result: null,
    createdAt: new Date().toISOString(),
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadLocalFlow(): LocalAnalysisFlow | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalAnalysisFlow>;
    const job = parsed.job;
    if (!job) return null;
    const source = parsed.source;
    return {
      job: {
        jobTitle: job.jobTitle ?? "",
        company: job.company ?? "",
        jobDescription: job.jobDescription ?? "",
      },
      preferences: normalizePreferences(parsed.preferences),
      source: source === "salvo" || source === "rascunho" || source === "colado" ? source : null,
      pastedText: typeof parsed.pastedText === "string" ? parsed.pastedText : "",
      savedResumeId: typeof parsed.savedResumeId === "string" ? parsed.savedResumeId : null,
      result: parsed.result ? normalizeAnalysis(parsed.result) : null,
      createdAt: parsed.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveLocalFlow(value: LocalAnalysisFlow) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* armazenamento indisponível: o conteúdo continua visível na tela */
  }
}

export function clearLocalFlow() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(KEY);
}
