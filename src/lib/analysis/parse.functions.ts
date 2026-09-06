import { createServerFn } from "@tanstack/react-start";

import { hasUsablePastedResume } from "./usable";
import { normalizeResume, type ResumeData } from "@/lib/resume/types";

const SYSTEM_PROMPT = `Você organiza o texto de um currículo colado pela própria pessoa em campos estruturados.
REGRAS:
- Use SOMENTE informações presentes no texto. Nunca invente nome, empresa, cargo, período, formação, certificação, habilidade, idioma, número ou resultado.
- Quando um dado não existir, devolva string vazia ou lista vazia.
- Datas no formato "AAAA-MM" quando o mês for identificável; se só houver o ano, use "AAAA-01" apenas quando o ano estiver explícito, senão deixe vazio.
- Não inclua idade, gênero, estado civil, foto, CPF, RG ou qualquer dado sensível.
- Responda SOMENTE com JSON válido, sem cercas de código, neste formato:
{
  "personal": {"fullName":"","headline":"","city":"","state":"","phone":"","email":"","linkedin":"","website":"","summary":""},
  "objective": {"desiredRole":"","area":"","objective":""},
  "experiences": [{"role":"","company":"","city":"","startDate":"","endDate":"","current":false,"description":"","achievements":[""]}],
  "education": [{"course":"","institution":"","level":"","city":"","startDate":"","endDate":"","inProgress":false}],
  "skills": [""],
  "certifications": [{"name":"","issuer":"","date":"","link":""}],
  "languages": [{"language":"","level":"Básico|Intermediário|Avançado|Fluente|Nativo"}],
  "projects": [{"name":"","description":"","skills":"","link":""}],
  "additional": ""
}`;

export const parsePastedResume = createServerFn({ method: "POST" })
  .inputValidator((input: { pastedText: string }) => {
    const pastedText = (input.pastedText ?? "").toString().trim();
    if (!hasUsablePastedResume(pastedText)) throw new Error("curriculo-insuficiente");
    return { pastedText: pastedText.slice(0, 20000) };
  })
  .handler(async ({ data }): Promise<ResumeData> => {
    const { callAI, extractJson } = await import("./ai.server");
    const conteudo = await callAI(
      SYSTEM_PROMPT,
      `TEXTO DO CURRÍCULO COLADO\n"""\n${data.pastedText}\n"""\n\nDevolva apenas o JSON.`,
      0,
    );
    try {
      return normalizeResume(extractJson(conteudo));
    } catch {
      throw new Error("falha-leitura");
    }
  });
