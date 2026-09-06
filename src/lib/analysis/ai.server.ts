/** Chamada única ao gateway de IA. Só roda no servidor. */
export async function callAI(system: string, user: string, temperature = 0.1): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("ia-indisponivel");

  let resposta: Response;
  try {
    resposta = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch {
    throw new Error("falha-conexao");
  }

  if (resposta.status === 429) throw new Error("limite-uso");
  if (resposta.status === 402) throw new Error("ia-indisponivel");
  if (!resposta.ok) {
    console.error("Falha na chamada de IA", resposta.status, await resposta.text().catch(() => ""));
    throw new Error("falha-analise");
  }

  const json = (await resposta.json()) as { choices?: { message?: { content?: string } }[] };
  const conteudo = json.choices?.[0]?.message?.content ?? "";
  if (!conteudo.trim()) throw new Error("falha-analise");
  return conteudo;
}

export function extractJson(conteudo: string): unknown {
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
    throw new Error("falha-analise");
  }
}
