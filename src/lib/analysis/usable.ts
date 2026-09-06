import type { ResumeData } from "@/lib/resume/types";

/** Mínimo de caracteres para aceitar um currículo colado. */
export const MIN_PASTED_RESUME = 350;

/** Verifica localmente se existe conteúdo profissional suficiente para analisar. */
export function hasUsableResume(data: ResumeData | null | undefined): boolean {
  if (!data) return false;
  const experiencias = data.experiences.filter(
    (e) => e.role.trim() && (e.company.trim() || e.description.trim()),
  );
  const formacoes = data.education.filter((e) => e.course.trim());
  const habilidades = data.skills.filter((s) => s.trim());
  const resumo = data.personal.summary.trim();
  const sinais =
    (experiencias.length > 0 ? 2 : 0) +
    (formacoes.length > 0 ? 1 : 0) +
    (habilidades.length >= 3 ? 1 : 0) +
    (resumo.length >= 120 ? 1 : 0) +
    (data.projects.some((p) => p.name.trim() && p.description.trim()) ? 1 : 0);
  return sinais >= 2;
}

export function hasUsablePastedResume(texto: string | null | undefined): boolean {
  const limpo = (texto ?? "").trim();
  if (limpo.length < MIN_PASTED_RESUME) return false;
  return limpo.split(/\s+/).length >= 60;
}

/** Nível de preenchimento resumido, usado nos cartões de escolha do currículo. */
export function resumeSummaryLine(data: ResumeData): string {
  const partes: string[] = [];
  if (data.experiences.length) partes.push(`${data.experiences.length} experiência(s)`);
  if (data.education.length) partes.push(`${data.education.length} formação(ões)`);
  const habilidades = data.skills.filter((s) => s.trim()).length;
  if (habilidades) partes.push(`${habilidades} habilidade(s)`);
  return partes.length ? partes.join(" • ") : "Nenhuma informação profissional preenchida ainda";
}
