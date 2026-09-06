export type JobLevel =
  | "nao_informado"
  | "estagio"
  | "junior"
  | "pleno"
  | "senior"
  | "especialista"
  | "coordenacao"
  | "gerencia"
  | "diretoria";

export type ResumeLanguage = "pt" | "en" | "es";
export type AnalysisTone = "equilibrado" | "direto" | "tecnico" | "executivo";
export type AnalysisGoal = "ats" | "clareza" | "reduzir" | "transicao";

/** Origem do conteúdo analisado. */
export type ResumeSource = "salvo" | "rascunho" | "colado";

export interface AnalysisPreferences {
  level: JobLevel;
  language: ResumeLanguage;
  tone: AnalysisTone;
  goal: AnalysisGoal;
}

export const LEVEL_OPTIONS: { id: JobLevel; label: string }[] = [
  { id: "nao_informado", label: "Não informado" },
  { id: "estagio", label: "Estágio" },
  { id: "junior", label: "Júnior" },
  { id: "pleno", label: "Pleno" },
  { id: "senior", label: "Sênior" },
  { id: "especialista", label: "Especialista" },
  { id: "coordenacao", label: "Coordenação" },
  { id: "gerencia", label: "Gerência" },
  { id: "diretoria", label: "Diretoria" },
];

export const LANGUAGE_OPTIONS: { id: ResumeLanguage; label: string; descricao: string }[] = [
  { id: "pt", label: "Português", descricao: "Textos sugeridos em português do Brasil." },
  { id: "en", label: "Inglês", descricao: "Textos sugeridos em inglês, para vagas internacionais." },
  { id: "es", label: "Espanhol", descricao: "Textos sugeridos em espanhol." },
];

export const TONE_OPTIONS: { id: AnalysisTone; label: string; descricao: string }[] = [
  { id: "equilibrado", label: "Equilibrado", descricao: "Profissional e acessível. Serve para a maioria das vagas." },
  { id: "direto", label: "Direto", descricao: "Frases curtas, foco em atividades e resultados." },
  { id: "tecnico", label: "Técnico", descricao: "Destaca ferramentas, processos e termos da área." },
  { id: "executivo", label: "Executivo", descricao: "Ênfase em gestão, times, metas e impacto no negócio." },
];

export const GOAL_OPTIONS: { id: AnalysisGoal; label: string; descricao: string }[] = [
  {
    id: "ats",
    label: "Melhorar compatibilidade ATS",
    descricao: "Foco em alinhar termos e requisitos que os sistemas de triagem procuram.",
  },
  {
    id: "clareza",
    label: "Melhorar clareza e narrativa",
    descricao: "Foco em deixar sua trajetória mais fácil de entender por quem lê.",
  },
  {
    id: "reduzir",
    label: "Reduzir currículo",
    descricao: "Foco em cortar repetições e manter apenas o que é relevante para a vaga.",
  },
  {
    id: "transicao",
    label: "Adaptar para transição de carreira",
    descricao: "Foco em destacar experiências transferíveis para a nova área.",
  },
];

export const LEVEL_LABEL: Record<JobLevel, string> = Object.fromEntries(
  LEVEL_OPTIONS.map((o) => [o.id, o.label]),
) as Record<JobLevel, string>;

export const LANGUAGE_LABEL: Record<ResumeLanguage, string> = Object.fromEntries(
  LANGUAGE_OPTIONS.map((o) => [o.id, o.label]),
) as Record<ResumeLanguage, string>;

export const TONE_LABEL: Record<AnalysisTone, string> = Object.fromEntries(
  TONE_OPTIONS.map((o) => [o.id, o.label]),
) as Record<AnalysisTone, string>;

export const GOAL_LABEL: Record<AnalysisGoal, string> = Object.fromEntries(
  GOAL_OPTIONS.map((o) => [o.id, o.label]),
) as Record<AnalysisGoal, string>;

export const SOURCE_LABEL: Record<ResumeSource, string> = {
  salvo: "Currículo salvo na conta",
  rascunho: "Rascunho deste dispositivo",
  colado: "Currículo colado",
};

export function defaultPreferences(): AnalysisPreferences {
  return { level: "nao_informado", language: "pt", tone: "equilibrado", goal: "ats" };
}

/** Sugere o nível da vaga a partir do cargo e da descrição; a pessoa sempre pode trocar. */
export function suggestLevel(jobTitle: string, jobDescription: string): JobLevel {
  const texto = `${jobTitle} ${jobDescription}`.toLowerCase();
  const regras: { nivel: JobLevel; termos: string[] }[] = [
    { nivel: "diretoria", termos: ["diretor", "diretora", "head of", "cto", "cfo", "ceo"] },
    { nivel: "gerencia", termos: ["gerente", "gerência", "gerencia", "manager"] },
    { nivel: "coordenacao", termos: ["coordenador", "coordenadora", "coordenação", "coordenacao", "supervisor"] },
    { nivel: "especialista", termos: ["especialista", "specialist", "expert"] },
    { nivel: "senior", termos: ["sênior", "senior", "sr"] },
    { nivel: "pleno", termos: ["pleno", "mid-level"] },
    { nivel: "junior", termos: ["júnior", "junior", "jr"] },
    { nivel: "estagio", termos: ["estágio", "estagio", "estagiário", "estagiaria", "trainee", "aprendiz"] },
  ];
  const cargo = jobTitle.toLowerCase();
  const contem = (alvo: string, termo: string) =>
    new RegExp(`(^|[^\\p{L}])${termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}]|$)`, "u").test(alvo);
  // O cargo tem prioridade sobre a descrição da vaga.
  for (const regra of regras) {
    if (regra.termos.some((t) => contem(cargo, t))) return regra.nivel;
  }
  for (const regra of regras) {
    if (regra.termos.some((t) => contem(texto, t))) return regra.nivel;
  }
  return "nao_informado";
}

export function normalizePreferences(raw: unknown): AnalysisPreferences {
  const base = defaultPreferences();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const inList = <T extends string>(value: unknown, list: readonly T[], fallback: T): T =>
    list.includes(value as T) ? (value as T) : fallback;
  return {
    level: inList(
      o["level"],
      LEVEL_OPTIONS.map((l) => l.id),
      base.level,
    ),
    language: inList(
      o["language"],
      LANGUAGE_OPTIONS.map((l) => l.id),
      base.language,
    ),
    tone: inList(
      o["tone"],
      TONE_OPTIONS.map((l) => l.id),
      base.tone,
    ),
    goal: inList(
      o["goal"],
      GOAL_OPTIONS.map((l) => l.id),
      base.goal,
    ),
  };
}

export function describePreferences(p: AnalysisPreferences): string {
  return `Nível: ${LEVEL_LABEL[p.level]} • Idioma: ${LANGUAGE_LABEL[p.language]} • Tom: ${TONE_LABEL[p.tone]} • Objetivo: ${GOAL_LABEL[p.goal]}`;
}
