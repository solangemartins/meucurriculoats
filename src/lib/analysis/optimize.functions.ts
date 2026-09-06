import { createServerFn } from "@tanstack/react-start";

import { normalizePreferences, type AnalysisPreferences } from "./preferences";
import { resumeToPlainText } from "./resume-text";
import { MIN_JOB_DESCRIPTION, normalizeOptimization, type OptimizationResult } from "./types";
import { hasUsableResume } from "./usable";
import { normalizeResume } from "@/lib/resume/types";

const IDIOMA: Record<AnalysisPreferences["language"], string> = {
  pt: "português do Brasil",
  en: "inglês",
  es: "espanhol",
};

const SYSTEM_PROMPT = `Você é especialista em currículos e ATS. Sua tarefa é propor uma versão otimizada de um currículo para uma vaga específica.
REGRAS ABSOLUTAS:
- Use SOMENTE informações verdadeiras já presentes no currículo. É proibido inventar experiências, empresas, cargos, períodos, formação, certificações, habilidades, idiomas, números, resultados ou ferramentas.
- Você pode reorganizar, reescrever, reduzir repetições, alinhar o resumo à vaga, destacar experiências relevantes e contextualizar palavras-chave verdadeiras.
- Quando a vaga pedir algo que não aparece no currículo, NÃO inclua. Gere uma pergunta em "perguntas".
- Nunca afirme que a pessoa não possui uma competência.
- Nada será aplicado automaticamente: cada proposta será revisada pela pessoa.
Responda SOMENTE com JSON válido, sem cercas de código:
{
  "resumoDasMudancas": "2 a 3 frases sobre o que foi ajustado e por quê",
  "propostas": [{"alvo":"resumo|objetivo|experiencia|projeto","alvoId":"id do item quando existir","alvoRotulo":"nome do trecho","textoAtual":"texto atual, se existir","textoSugerido":"nova versão","observacao":"o que confirmar antes de aplicar"}],
  "perguntas": [{"pergunta":"A vaga solicita experiência com X. Você possui essa experiência?","motivo":"por que isso importa para esta vaga"}]
}
Os textos sugeridos devem estar no idioma pedido.`;

export const createOptimizedVersion = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      resume: unknown;
      jobTitle: string;
      company: string;
      jobDescription: string;
      preferences?: unknown;
    }) => {
      const jobTitle = (input.jobTitle ?? "").toString().trim();
      const jobDescription = (input.jobDescription ?? "").toString().trim();
      if (jobTitle.length < 2) throw new Error("cargo-invalido");
      if (jobDescription.length < MIN_JOB_DESCRIPTION) throw new Error("descricao-curta");
      const resume = normalizeResume(input.resume);
      if (!hasUsableResume(resume)) throw new Error("curriculo-insuficiente");
      return {
        curriculo: resumeToPlainText(resume).slice(0, 20000),
        jobTitle: jobTitle.slice(0, 200),
        company: (input.company ?? "").toString().trim().slice(0, 200),
        jobDescription: jobDescription.slice(0, 12000),
        preferences: normalizePreferences(input.preferences),
      };
    },
  )
  .handler(async ({ data }): Promise<OptimizationResult> => {
    const { callAI, extractJson } = await import("./ai.server");
    const p = data.preferences;
    const conteudo = await callAI(
      SYSTEM_PROMPT,
      `VAGA
Cargo: ${data.jobTitle}
Empresa: ${data.company || "não informada"}
Nível: ${p.level}
Descrição:
"""
${data.jobDescription}
"""

PREFERÊNCIAS
- Idioma dos textos sugeridos: ${IDIOMA[p.language]}
- Tom: ${p.tone}
- Objetivo: ${p.goal}

CURRÍCULO ATUAL
"""
${data.curriculo}
"""

Devolva apenas o JSON.`,
      0.2,
    );
    try {
      return normalizeOptimization(extractJson(conteudo));
    } catch {
      throw new Error("falha-analise");
    }
  });
