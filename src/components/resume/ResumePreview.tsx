import { formatPeriod, fullLocation, type ResumeData } from "@/lib/resume/types";

/**
 * Pré-visualização fiel ao PDF: uma única coluna, texto real, sem foto,
 * ícones, tabelas, barras ou gráficos — as mesmas regras aplicadas na exportação.
 */

interface Variant {
  paper: string;
  name: string;
  headline: string;
  section: string;
  sectionWrap: string;
  block: string;
  body: string;
}

const VARIANTS: Record<ResumeData["template"], Variant> = {
  classico: {
    paper: "p-10 text-[13px] leading-relaxed",
    name: "text-[26px] font-bold tracking-tight",
    headline: "text-[14px]",
    section: "text-[13px] font-bold uppercase tracking-[0.08em]",
    sectionWrap: "mt-5 border-b border-neutral-400 pb-1",
    block: "mt-3",
    body: "text-[13px]",
  },
  moderno: {
    paper: "p-10 text-[13px] leading-relaxed",
    name: "text-[30px] font-bold tracking-tight text-[#2f6cba]",
    headline: "text-[14.5px]",
    section: "text-[13px] font-bold uppercase tracking-[0.1em] text-[#2f6cba]",
    sectionWrap: "mt-5 border-b-2 border-[#2f6cba] pb-1",
    block: "mt-3",
    body: "text-[13px]",
  },
  compacto: {
    paper: "p-8 text-[12px] leading-snug",
    name: "text-[22px] font-bold tracking-tight",
    headline: "text-[13px]",
    section: "text-[12px] font-bold uppercase tracking-[0.08em]",
    sectionWrap: "mt-3.5",
    block: "mt-2",
    body: "text-[12px]",
  },
};

function Section({
  title,
  variant,
  children,
}: {
  title: string;
  variant: Variant;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-1">
      <div className={variant.sectionWrap}>
        <h2 className={variant.section}>{title}</h2>
      </div>
      <div className={variant.block}>{children}</div>
    </section>
  );
}

export function ResumePreview({ data }: { data: ResumeData }) {
  const v = VARIANTS[data.template] ?? VARIANTS.classico;
  const { personal, objective } = data;

  const contato = [fullLocation(personal.city, personal.state), personal.phone, personal.email].filter(
    (item) => item.trim(),
  );
  const links = [personal.linkedin, personal.website].filter((item) => item.trim());
  const experiencias = data.experiences.filter((e) => e.role.trim() || e.company.trim());
  const formacoes = data.education.filter((e) => e.course.trim() || e.institution.trim());
  const habilidades = data.skills.filter((s) => s.trim());
  const cursos = data.certifications.filter((c) => c.name.trim());
  const idiomas = data.languages.filter((l) => l.language.trim());
  const projetos = data.projects.filter((p) => p.name.trim());
  const temObjetivo =
    objective.desiredRole.trim() || objective.area.trim() || objective.objective.trim();

  return (
    <article
      className={`resume-paper mx-auto w-full max-w-[820px] ${v.paper}`}
      aria-label="Pré-visualização do currículo"
    >
      <header>
        <h1 className={v.name}>{personal.fullName || "Seu nome completo"}</h1>
        {personal.headline || objective.desiredRole ? (
          <p className={`mt-0.5 ${v.headline}`}>{personal.headline || objective.desiredRole}</p>
        ) : null}
        {contato.length ? <p className="mt-1 text-[12px] text-neutral-700">{contato.join(" | ")}</p> : null}
        {links.length ? <p className="text-[12px] text-neutral-700">{links.join(" | ")}</p> : null}
      </header>

      {personal.summary.trim() ? (
        <Section title="Resumo profissional" variant={v}>
          <p className={`whitespace-pre-line ${v.body}`}>{personal.summary.trim()}</p>
        </Section>
      ) : null}

      {temObjetivo ? (
        <Section title="Objetivo profissional" variant={v}>
          {objective.desiredRole || objective.area ? (
            <p className={`font-semibold ${v.body}`}>
              {[objective.desiredRole, objective.area].filter((x) => x.trim()).join(" — ")}
            </p>
          ) : null}
          {objective.objective.trim() ? (
            <p className={`whitespace-pre-line ${v.body}`}>{objective.objective.trim()}</p>
          ) : null}
        </Section>
      ) : null}

      {experiencias.length ? (
        <Section title="Experiência profissional" variant={v}>
          <div className="space-y-3">
            {experiencias.map((exp) => {
              const meta = [
                formatPeriod(exp.startDate, exp.endDate, exp.current, "atual"),
                exp.city,
              ].filter((x) => x.trim());
              return (
                <div key={exp.id}>
                  <p className={`font-semibold ${v.body}`}>
                    {[exp.role, exp.company].filter((x) => x.trim()).join(" — ")}
                  </p>
                  {meta.length ? <p className="text-[12px] text-neutral-700">{meta.join(" | ")}</p> : null}
                  {exp.description.trim() ? (
                    <p className={`mt-1 whitespace-pre-line ${v.body}`}>{exp.description.trim()}</p>
                  ) : null}
                  {exp.achievements.filter((a) => a.trim()).length ? (
                    <ul className={`mt-1 list-disc space-y-0.5 pl-5 ${v.body}`}>
                      {exp.achievements
                        .filter((a) => a.trim())
                        .map((a, index) => (
                          <li key={index}>{a}</li>
                        ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Section>
      ) : null}

      {formacoes.length ? (
        <Section title="Formação acadêmica" variant={v}>
          <div className="space-y-2">
            {formacoes.map((edu) => {
              const meta = [
                edu.institution,
                edu.city,
                formatPeriod(edu.startDate, edu.endDate, edu.inProgress, "em andamento"),
              ].filter((x) => x.trim());
              return (
                <div key={edu.id}>
                  <p className={`font-semibold ${v.body}`}>
                    {[edu.course, edu.level].filter((x) => x.trim()).join(" — ")}
                  </p>
                  {meta.length ? <p className="text-[12px] text-neutral-700">{meta.join(" | ")}</p> : null}
                </div>
              );
            })}
          </div>
        </Section>
      ) : null}

      {habilidades.length ? (
        <Section title="Habilidades" variant={v}>
          <p className={v.body}>{habilidades.join(" • ")}</p>
        </Section>
      ) : null}

      {cursos.length ? (
        <Section title="Cursos e certificações" variant={v}>
          <div className="space-y-1">
            {cursos.map((c) => (
              <div key={c.id}>
                <p className={v.body}>{[c.name, c.issuer, c.date].filter((x) => x.trim()).join(" — ")}</p>
                {c.link.trim() ? <p className="text-[12px] text-neutral-700">{c.link}</p> : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {idiomas.length ? (
        <Section title="Idiomas" variant={v}>
          <div className="space-y-0.5">
            {idiomas.map((l) => (
              <p key={l.id} className={v.body}>
                {l.language} — {l.level}
              </p>
            ))}
          </div>
        </Section>
      ) : null}

      {projetos.length ? (
        <Section title="Projetos" variant={v}>
          <div className="space-y-2">
            {projetos.map((p) => (
              <div key={p.id}>
                <p className={`font-semibold ${v.body}`}>{p.name}</p>
                {p.description.trim() ? (
                  <p className={`whitespace-pre-line ${v.body}`}>{p.description}</p>
                ) : null}
                {p.skills.trim() ? (
                  <p className="text-[12px] text-neutral-700">Competências: {p.skills}</p>
                ) : null}
                {p.link.trim() ? <p className="text-[12px] text-neutral-700">{p.link}</p> : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {data.additional.trim() ? (
        <Section title="Informações adicionais" variant={v}>
          <p className={`whitespace-pre-line ${v.body}`}>{data.additional.trim()}</p>
        </Section>
      ) : null}
    </article>
  );
}
