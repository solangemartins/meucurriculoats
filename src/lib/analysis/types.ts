export type GapKind = "nao_encontrado" | "pouco_demonstrado" | "diferencial";
export type Priority = "alta" | "media" | "opcional";
export type RewriteTarget = "resumo" | "objetivo" | "experiencia" | "projeto" | "outro";

export interface AnalysisStrength {
  titulo: string;
  explicacao: string;
}

export interface AnalysisGap {
  titulo: string;
  tipo: GapKind;
  orientacao: string;
}

export interface AnalysisSuggestion {
  titulo: string;
  prioridade: Priority;
  acao: string;
}

export interface AnalysisRewrite {
  alvo: RewriteTarget;
  alvoId: string;
  alvoRotulo: string;
  textoSugerido: string;
  podeAplicar: boolean;
  observacao: string;
}

export interface AnalysisCriterion {
  nome: string;
  peso: number;
  nota: number;
  comentario: string;
}

export interface AnalysisResult {
  overallScore: number;
  explicacao: string;
  pontosFortes: AnalysisStrength[];
  lacunas: AnalysisGap[];
  palavrasChaveEncontradas: string[];
  palavrasChaveAusentes: string[];
  sugestoes: AnalysisSuggestion[];
  reescritas: AnalysisRewrite[];
  criterios: AnalysisCriterion[];
}

export interface JobInput {
  jobTitle: string;
  company: string;
  jobDescription: string;
}

export const MIN_JOB_DESCRIPTION = 250;

export const GAP_LABEL: Record<GapKind, string> = {
  nao_encontrado: "Não encontrado no currículo",
  pouco_demonstrado: "Mencionado, mas pouco demonstrado",
  diferencial: "Requisito desejável ou diferencial",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  alta: "Alta prioridade",
  media: "Média prioridade",
  opcional: "Melhoria opcional",
};

export const REWRITE_LABEL: Record<RewriteTarget, string> = {
  resumo: "Resumo profissional",
  objetivo: "Objetivo profissional",
  experiencia: "Descrição de experiência",
  projeto: "Projeto",
  outro: "Outro trecho",
};

export const DISCLAIMER =
  "Esta análise é orientativa e não garante aprovação em processos seletivos. Cada empresa pode utilizar critérios e sistemas de recrutamento diferentes.";

export function scoreBand(score: number): { rotulo: string; tom: "baixa" | "parcial" | "boa" | "alta" } {
  if (score >= 80) return { rotulo: "Alta compatibilidade", tom: "alta" };
  if (score >= 60) return { rotulo: "Boa compatibilidade", tom: "boa" };
  if (score >= 40) return { rotulo: "Compatibilidade parcial", tom: "parcial" };
  return { rotulo: "Baixa compatibilidade", tom: "baixa" };
}

function texto(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function listaTexto(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => texto(v)).filter(Boolean).slice(0, 40);
}

/** Deixa qualquer resposta da IA no formato esperado pela interface. */
export function normalizeAnalysis(raw: unknown): AnalysisResult {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const bruto = Number(data["overallScore"]);
  const score = Number.isFinite(bruto) ? Math.max(0, Math.min(100, Math.round(bruto))) : 0;

  const pontosFortes = (Array.isArray(data["pontosFortes"]) ? data["pontosFortes"] : [])
    .map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      return { titulo: texto(o["titulo"]), explicacao: texto(o["explicacao"]) };
    })
    .filter((i) => i.titulo);

  const lacunas = (Array.isArray(data["lacunas"]) ? data["lacunas"] : [])
    .map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      const tipo = texto(o["tipo"]) as GapKind;
      return {
        titulo: texto(o["titulo"]),
        tipo: (["nao_encontrado", "pouco_demonstrado", "diferencial"] as string[]).includes(tipo)
          ? tipo
          : "nao_encontrado",
        orientacao: texto(o["orientacao"]),
      } satisfies AnalysisGap;
    })
    .filter((i) => i.titulo);

  const sugestoes = (Array.isArray(data["sugestoes"]) ? data["sugestoes"] : [])
    .map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      const prioridade = texto(o["prioridade"]) as Priority;
      return {
        titulo: texto(o["titulo"]),
        prioridade: (["alta", "media", "opcional"] as string[]).includes(prioridade)
          ? prioridade
          : "media",
        acao: texto(o["acao"]),
      } satisfies AnalysisSuggestion;
    })
    .filter((i) => i.titulo);

  const reescritas = (Array.isArray(data["reescritas"]) ? data["reescritas"] : [])
    .map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      const alvo = texto(o["alvo"]) as RewriteTarget;
      return {
        alvo: (["resumo", "objetivo", "experiencia", "projeto", "outro"] as string[]).includes(alvo)
          ? alvo
          : "outro",
        alvoId: texto(o["alvoId"]),
        alvoRotulo: texto(o["alvoRotulo"]),
        textoSugerido: texto(o["textoSugerido"]),
        podeAplicar: o["podeAplicar"] === true,
        observacao: texto(o["observacao"]),
      } satisfies AnalysisRewrite;
    })
    .filter((i) => i.textoSugerido);

  const criterios = (Array.isArray(data["criterios"]) ? data["criterios"] : [])
    .map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      const nota = Number(o["nota"]);
      const peso = Number(o["peso"]);
      return {
        nome: texto(o["nome"]),
        peso: Number.isFinite(peso) ? Math.round(peso) : 0,
        nota: Number.isFinite(nota) ? Math.max(0, Math.min(100, Math.round(nota))) : 0,
        comentario: texto(o["comentario"]),
      } satisfies AnalysisCriterion;
    })
    .filter((i) => i.nome);

  return {
    overallScore: score,
    explicacao: texto(data["explicacao"]),
    pontosFortes,
    lacunas,
    palavrasChaveEncontradas: listaTexto(data["palavrasChaveEncontradas"]),
    palavrasChaveAusentes: listaTexto(data["palavrasChaveAusentes"]),
    sugestoes,
    reescritas,
    criterios,
  };
}

/* ---------- Versão otimizada ---------- */

export interface OptimizationProposal {
  alvo: RewriteTarget;
  alvoId: string;
  alvoRotulo: string;
  textoAtual: string;
  textoSugerido: string;
  observacao: string;
}

export interface OptimizationQuestion {
  pergunta: string;
  motivo: string;
}

export interface OptimizationResult {
  resumoDasMudancas: string;
  propostas: OptimizationProposal[];
  perguntas: OptimizationQuestion[];
}

export function normalizeOptimization(raw: unknown): OptimizationResult {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const propostas = (Array.isArray(data["propostas"]) ? data["propostas"] : [])
    .map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      const alvo = texto(o["alvo"]) as RewriteTarget;
      return {
        alvo: (["resumo", "objetivo", "experiencia", "projeto", "outro"] as string[]).includes(alvo)
          ? alvo
          : "outro",
        alvoId: texto(o["alvoId"]),
        alvoRotulo: texto(o["alvoRotulo"]),
        textoAtual: texto(o["textoAtual"]),
        textoSugerido: texto(o["textoSugerido"]),
        observacao: texto(o["observacao"]),
      } satisfies OptimizationProposal;
    })
    .filter((p) => p.textoSugerido);

  const perguntas = (Array.isArray(data["perguntas"]) ? data["perguntas"] : [])
    .map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      return { pergunta: texto(o["pergunta"]), motivo: texto(o["motivo"]) } satisfies OptimizationQuestion;
    })
    .filter((p) => p.pergunta);

  return { resumoDasMudancas: texto(data["resumoDasMudancas"]), propostas, perguntas };
}
