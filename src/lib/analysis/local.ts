import { normalizeAnalysis, type AnalysisResult, type JobInput } from "./types";

const KEY = "curriculo-ats:analise-vaga";

export interface LocalAnalysis {
  job: JobInput;
  result: AnalysisResult | null;
  createdAt: string;
}

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadLocalAnalysis(): LocalAnalysis | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalAnalysis>;
    const job = parsed.job;
    if (!job) return null;
    return {
      job: {
        jobTitle: job.jobTitle ?? "",
        company: job.company ?? "",
        jobDescription: job.jobDescription ?? "",
      },
      result: parsed.result ? normalizeAnalysis(parsed.result) : null,
      createdAt: parsed.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveLocalAnalysis(value: LocalAnalysis) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* armazenamento indisponível: a análise continua visível na tela */
  }
}

export function clearLocalAnalysis() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(KEY);
}
