import { createServerFn } from "@tanstack/react-start";

import { resumeToPlainText } from "./resume-text";
import { normalizePreferences, type AnalysisPreferences } from "./preferences";
import { MIN_JOB_DESCRIPTION, normalizeAnalysis, type AnalysisResult } from "./types";
import { hasUsablePastedResume, hasUsableResume } from "./usable";
import { normalizeResume } from "@/lib/resume/types";

const IDIOMA: Record<AnalysisPreferences["language"], string> = {
  pt: "português do Brasil",
  en: "inglês",
  es: "espanhol",
};

const TOM: Record<AnalysisPreferences["tone"], string> = {
  equilibrado: "profissional e acessível",
  direto: "direto, com frases curtas e foco em atividades e resultados",
  tecnico: "técnico, destacando ferramentas, processos e termos da área",
  executivo: "executivo, com ênfase em gestão, times, metas e impacto no negócio",
};

const OBJETIVO: Record<AnalysisPreferences["goal"], string> = {
  ats: "aumentar a compatibilidade com sistemas de triagem (ATS)",
  clareza: "melhorar clareza e narrativa da trajetória",
  reduzir: "reduzir o tamanho do currículo, cortando repetições e conteúdo irrelevante",
  transicao: "adaptar o currículo para uma transição de carreira, destacando experiências transferíveis",
};

const SYSTEM_PROMPT = `Você é um especialista brasileiro em recrutamento e seleção e em sistemas ATS (Applicant Tracking Systems).
Sua tarefa é comparar SEMANTICAMENTE um currículo com a descrição de uma vaga e devolver uma análise estruturada. Os textos de análise ficam em português do Brasil.

REGRAS OBRIGATÓRIAS:
- Nunca invente experiências, formações, certificações, números, resultados ou habilidades que não estejam no currículo.
- Nunca afirme que a pessoa "não possui" uma competência. Use "Esta competência não foi identificada no currículo." ou "Caso você realmente possua essa experiência, inclua onde a utilizou e qual resultado obteve.".
- Reconheça sinônimos e termos relacionados (ex.: "Power BI" e "dashboards"; "atendimento ao cliente" e "suporte"; "gestão de pessoas" e "liderança de equipe"). Não marque algo como ausente apenas por diferença de escrita. Não faça simples contagem de palavras.
- Nunca avalie nem mencione idade, gênero, raça, religião, saúde, estado civil, orientação sexual ou aparência.
- Não oriente o uso artificial ou repetitivo de palavras-chave.
- Ignore palavras genéricas, artigos, preposições, o nome da empresa e termos sem valor profissional nas listas de palavras-chave.
- Quando faltar informação, escreva orientações condicionais ("Caso você realmente possua experiência com X, inclua onde utilizou e qual resultado obteve.").
- Seja consistente: o mesmo currículo com a mesma vaga deve receber pontuação praticamente igual.

CÁLCULO DA PONTUAÇÃO (0 a 100), nota de cada critério de 0 a 100 e média ponderada:
- competências e palavras-chave relevantes: 30%
- experiências e responsabilidades relacionadas: 30%
- formação, certificações e requisitos objetivos: 15%
- resultados e evidências profissionais: 10%
- resumo e objetivo alinhados: 10%
- organização e legibilidade para ATS: 5%
Se a vaga não exigir um critério, atribua peso 0 a ele e redistribua o peso proporcionalmente entre os demais. A explicação e as justificativas precisam ser coerentes com a nota final.

Responda SOMENTE com um JSON válido, sem comentários e sem cercas de código, neste formato:
{
  "overallScore": 0,
  "explicacao": "2 a 3 frases explicando o resultado",
  "criterios": [{"nome":"Competências e palavras-chave","peso":30,"nota":0,"comentario":"..."}],
  "pontosFortes": [{"titulo":"...","explicacao":"por que é relevante para esta vaga"}],
  "lacunas": [{"titulo":"...","tipo":"nao_encontrado|pouco_demonstrado|diferencial","orientacao":"orientação condicional e respeitosa"}],
  "palavrasChaveEncontradas": ["..."],
  "palavrasChaveAusentes": ["..."],
  "sugestoes": [{"titulo":"...","prioridade":"alta|media|opcional","acao":"o que fazer, de forma específica"}],
  "reescritas": [{"alvo":"resumo|objetivo|experiencia|projeto","alvoId":"id informado no currículo quando existir","alvoRotulo":"nome do trecho","textoSugerido":"versão melhor usando apenas informações já presentes","podeAplicar":true,"observacao":"o que a pessoa precisa confirmar antes de aplicar"}]
}
Os textos do campo "textoSugerido" devem estar no idioma pedido pelo usuário. Use "podeAplicar": false sempre que a sugestão depender de informação que a pessoa ainda precisa fornecer ou confirmar.`;

export interface AnalyzeInput {
  resume?: unknown;
  pastedText?: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  preferences?: unknown;
}

export const analyzeResumeForJob = createServerFn({ method: "POST" })
  .inputValidator((input: AnalyzeInput) => {
    const jobTitle = (input.jobTitle ?? "").toString().trim();
    const company = (input.company ?? "").toString().trim();
    const jobDescription = (input.jobDescription ?? "").toString().trim();
    const pastedText = (input.pastedText ?? "").toString().trim();
    if (jobTitle.length < 2) throw new Error("cargo-invalido");
    if (jobDescription.length < MIN_JOB_DESCRIPTION) throw new Error("descricao-curta");

    let curriculo = "";
    if (pastedText) {
      if (!hasUsablePastedResume(pastedText)) throw new Error("curriculo-insuficiente");
      curriculo = pastedText.slice(0, 20000);
    } else {
      const resume = normalizeResume(input.resume);
      if (!hasUsableResume(resume)) throw new Error("curriculo-insuficiente");
      curriculo = resumeToPlainText(resume).slice(0, 20000);
    }

    return {
      curriculo,
      jobTitle: jobTitle.slice(0, 200),
      company: company.slice(0, 200),
      jobDescription: jobDescription.slice(0, 12000),
      preferences: normalizePreferences(input.preferences),
    };
  })
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const { callAI, extractJson } = await import("./ai.server");
    const p = data.preferences;

    const userPrompt = `VAGA
Cargo: ${data.jobTitle}
Empresa: ${data.company || "não informada"}
Nível da vaga informado pela pessoa: ${p.level === "nao_informado" ? "não informado" : p.level}
Descrição completa da vaga:
"""
${data.jobDescription}
"""

PREFERÊNCIAS DA PESSOA
- Idioma dos textos sugeridos: ${IDIOMA[p.language]}
- Tom profissional desejado: ${TOM[p.tone]}
- Objetivo principal: ${OBJETIVO[p.goal]}

CURRÍCULO DO CANDIDATO
"""
${data.curriculo}
"""

Compare o currículo com a vaga e devolva apenas o JSON no formato pedido.`;

    const conteudo = await callAI(SYSTEM_PROMPT, userPrompt);
    try {
      return normalizeAnalysis(extractJson(conteudo));
    } catch {
      throw new Error("falha-analise");
    }
  });
