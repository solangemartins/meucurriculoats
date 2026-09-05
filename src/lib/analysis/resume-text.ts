import { formatPeriod, fullLocation, type ResumeData } from "@/lib/resume/types";

/**
 * Converte o currículo em texto simples para a comparação com a vaga.
 * Inclui apenas informações profissionais — nada de dados pessoais sensíveis.
 */
export function resumeToPlainText(data: ResumeData): string {
  const linhas: string[] = [];

  linhas.push(`CARGO/TÍTULO ATUAL: ${data.personal.headline || "não informado"}`);
  linhas.push(`CIDADE: ${fullLocation(data.personal.city, data.personal.state) || "não informado"}`);
  if (data.personal.summary.trim()) {
    linhas.push(`RESUMO PROFISSIONAL: ${data.personal.summary.trim()}`);
  }

  const obj = data.objective;
  if (obj.desiredRole || obj.area || obj.objective) {
    linhas.push(
      `OBJETIVO PROFISSIONAL: cargo desejado: ${obj.desiredRole || "não informado"}; área: ${
        obj.area || "não informada"
      }; texto: ${obj.objective || "não informado"}`,
    );
  }

  if (data.experiences.length > 0) {
    linhas.push("EXPERIÊNCIAS PROFISSIONAIS:");
    data.experiences.forEach((exp) => {
      linhas.push(
        `- [id=${exp.id}] ${exp.role || "cargo não informado"} — ${exp.company || "empresa não informada"} (${
          formatPeriod(exp.startDate, exp.endDate, exp.current, "atual") || "período não informado"
        })`,
      );
      if (exp.description.trim()) linhas.push(`  Atividades: ${exp.description.trim()}`);
      exp.achievements.filter(Boolean).forEach((a) => linhas.push(`  Resultado: ${a}`));
    });
  } else {
    linhas.push("EXPERIÊNCIAS PROFISSIONAIS: nenhuma informada");
  }

  if (data.education.length > 0) {
    linhas.push("FORMAÇÃO ACADÊMICA:");
    data.education.forEach((ed) =>
      linhas.push(
        `- ${ed.level} em ${ed.course || "curso não informado"} — ${
          ed.institution || "instituição não informada"
        } (${formatPeriod(ed.startDate, ed.endDate, ed.inProgress, "em andamento") || "período não informado"})`,
      ),
    );
  } else {
    linhas.push("FORMAÇÃO ACADÊMICA: nenhuma informada");
  }

  linhas.push(
    `HABILIDADES: ${data.skills.filter(Boolean).join(", ") || "nenhuma informada"}`,
  );

  if (data.certifications.length > 0) {
    linhas.push("CURSOS E CERTIFICAÇÕES:");
    data.certifications.forEach((c) =>
      linhas.push(`- ${c.name || "sem nome"} — ${c.issuer || "instituição não informada"} ${c.date}`),
    );
  } else {
    linhas.push("CURSOS E CERTIFICAÇÕES: nenhuma informada");
  }

  if (data.languages.length > 0) {
    linhas.push(
      `IDIOMAS: ${data.languages.map((l) => `${l.language} (${l.level})`).join(", ")}`,
    );
  } else {
    linhas.push("IDIOMAS: nenhum informado");
  }

  if (data.projects.length > 0) {
    linhas.push("PROJETOS:");
    data.projects.forEach((p) =>
      linhas.push(
        `- [id=${p.id}] ${p.name || "sem nome"}: ${p.description || "sem descrição"}${
          p.skills ? ` (competências: ${p.skills})` : ""
        }`,
      ),
    );
  } else {
    linhas.push("PROJETOS: nenhum informado");
  }

  if (data.additional.trim()) linhas.push(`INFORMAÇÕES ADICIONAIS: ${data.additional.trim()}`);

  linhas.push(`MODELO VISUAL USADO: ${data.template} (layout em uma coluna, sem tabelas nem imagens)`);

  return linhas.join("\n");
}
