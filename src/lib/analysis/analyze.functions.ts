import { createServerFn } from "@tanstack/react-start";

import { resumeToPlainText } from "./resume-text";
import { MIN_JOB_DESCRIPTION, normalizeAnalysis, type AnalysisResult } from "./types";
import { normalizeResume } from "@/lib/resume/types";

const SYSTEM_PROMPT = `Você é um especialista brasileiro em recrutamento e seleção e em sistemas ATS (Applicant Tracking Systems).
Sua tarefa é comparar SEMANTICAMENTE um currículo com a descrição de uma vaga e devolver uma análise estruturada, em português do Brasil.

REGRAS OBRIGATÓRIAS:
- Nunca invente experiências, formações, certificações, números, resultados ou habilidades que não estejam no currículo.
- Nunca afirme que a pessoa "não possui" uma competência. Use "Esta competência não foi identificada no currículo." ou "Caso você realmente tenha essa experiência, considere incluí-la com um exemplo concreto.".
- Reconheça sinônimos e termos relacionados (ex.: "Power BI" e "dashboards"; "atendimento ao cliente" e "suporte"; "gestão de pessoas" e "liderança de equipe"). Não marque algo como ausente apenas por diferença de escrita.
- Nunca avalie nem mencione idade, gênero, raça, religião, saúde, estado civil, orientação sexual ou aparência. Avalie somente informações profissionais.
- Não oriente o uso artificial ou repetitivo de palavras-chave.
- Ignore palavras genéricas, artigos, preposições, o nome da empresa e termos sem valor profissional nas listas de palavras-chave.
- Quando faltar informação, escreva orientações condicionais ("Se você possui experiência com X, inclua onde utilizou e qual resultado obteve.").
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
Use "podeAplicar": false sempre que a sugestão depender de informação que a pessoa ainda precisa fornecer ou confirmar.`;

function extrairJson(conteudo: string): unknown {
  const limpo = conteudo
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(limpo);
  } catch {
    const inicio = limpo.indexOf("{");
    const fim = limpo.lastIndexOf("}");
    if (inicio >= 0 && fim > inicio) return JSON.parse(limpo.slice(inicio, fim + 1));
    throw new Error("resposta-invalida");
  }
}

export const analyzeResumeForJob = createServerFn({ method: "POST" })
  .inputValidator((input: { resume: unknown; jobTitle: string; company: string; jobDescription: string }) => {
    const jobTitle = (input.jobTitle ?? "").toString().trim();
    const company = (input.company ?? "").toString().trim();
    const jobDescription = (input.jobDescription ?? "").toString().trim();
    if (jobTitle.length < 2) throw new Error("cargo-invalido");
    if (jobDescription.length < MIN_JOB_DESCRIPTION) throw new Error("descricao-curta");
    return {
      resume: input.resume,
      jobTitle: jobTitle.slice(0, 200),
      company: company.slice(0, 200),
      jobDescription: jobDescription.slice(0, 12000),
    };
  })
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("ia-indisponivel");

    const curriculo = resumeToPlainText(normalizeResume(data.resume));

    const userPrompt = `VAGA
Cargo: ${data.jobTitle}
Empresa: ${data.company || "não informada"}
Descrição completa da vaga:
"""
${data.jobDescription}
"""

CURRÍCULO DO CANDIDATO
"""
${curriculo}
"""

Compare o currículo com a vaga e devolva apenas o JSON no formato pedido.`;

    let resposta: Response;
    try {
      resposta = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          temperature: 0.1,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
      });
    } catch {
      throw new Error("falha-conexao");
    }

    if (resposta.status === 429) throw new Error("limite-uso");
    if (!resposta.ok) {
      console.error("Falha na análise ATS", resposta.status, await resposta.text().catch(() => ""));
      throw new Error("falha-analise");
    }

    const json = (await resposta.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const conteudo = json.choices?.[0]?.message?.content ?? "";
    if (!conteudo.trim()) throw new Error("falha-analise");

    try {
      return normalizeAnalysis(extrairJson(conteudo));
    } catch {
      throw new Error("falha-analise");
    }
  });
