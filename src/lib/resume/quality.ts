import type { ResumeData } from "./types";

export interface QualityCheck {
  id: string;
  label: string;
  ok: boolean;
  hint: string;
  essential: boolean;
}

export function runQualityChecks(data: ResumeData): QualityCheck[] {
  const { personal, objective, experiences, education, skills } = data;

  const temContato = Boolean(personal.email.trim()) && Boolean(personal.phone.trim());
  const experienciasDescritas = experiences.filter(
    (e) => e.role.trim() && e.company.trim() && (e.description.trim() || e.achievements.length > 0),
  );

  return [
    {
      id: "nome",
      label: "Nome completo informado",
      ok: personal.fullName.trim().length > 2,
      hint: "O nome deve aparecer no topo do currículo.",
      essential: true,
    },
    {
      id: "contato",
      label: "E-mail e telefone informados",
      ok: temContato,
      hint: "Empresas precisam de pelo menos duas formas de contato.",
      essential: true,
    },
    {
      id: "objetivo",
      label: "Cargo ou objetivo profissional",
      ok: Boolean(personal.headline.trim() || objective.desiredRole.trim()),
      hint: "Use o nome do cargo da vaga desejada.",
      essential: true,
    },
    {
      id: "resumo",
      label: "Resumo profissional com pelo menos 200 caracteres",
      ok: personal.summary.trim().length >= 200,
      hint: "Escreva de 3 a 5 linhas sobre sua atuação, resultados e o que você busca.",
      essential: false,
    },
    {
      id: "experiencia",
      label: "Ao menos uma experiência descrita",
      ok: experienciasDescritas.length > 0,
      hint: "Descreva as atividades com verbos de ação e resultados.",
      essential: false,
    },
    {
      id: "conquistas",
      label: "Conquistas ou resultados registrados",
      ok: experiences.some((e) => e.achievements.some((a) => a.trim())),
      hint: "Inclua números: percentuais, volumes, prazos ou economia gerada.",
      essential: false,
    },
    {
      id: "formacao",
      label: "Formação acadêmica preenchida",
      ok: education.some((e) => e.course.trim() && e.institution.trim()),
      hint: "Informe curso, instituição e período.",
      essential: false,
    },
    {
      id: "habilidades",
      label: "Pelo menos 5 habilidades",
      ok: skills.filter((s) => s.trim()).length >= 5,
      hint: "Use palavras que aparecem na descrição da vaga.",
      essential: false,
    },
    {
      id: "localizacao",
      label: "Cidade e estado informados",
      ok: Boolean(personal.city.trim() && personal.state.trim()),
      hint: "Muitas triagens filtram por região.",
      essential: false,
    },
  ];
}

export function qualityScore(data: ResumeData) {
  const checks = runQualityChecks(data);
  const done = checks.filter((c) => c.ok).length;
  const score = Math.round((done / checks.length) * 100);
  const label = score >= 85 ? "Muito bom" : score >= 60 ? "Bom caminho" : score >= 30 ? "Em construção" : "Início";
  return { checks, score, label, missingEssentials: checks.filter((c) => c.essential && !c.ok) };
}
