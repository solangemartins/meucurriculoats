import { jsPDF } from "jspdf";

import {
  formatPeriod,
  fullLocation,
  type ResumeData,
  type TemplateId,
} from "./types";

/**
 * Geração do PDF com texto real (selecionável e pesquisável), uma única coluna,
 * sem imagens, tabelas ou elementos decorativos — compatível com leitores ATS.
 */

interface Style {
  base: number;
  nameSize: number;
  sectionSize: number;
  lineGap: number;
  sectionGap: number;
  rule: boolean;
  uppercaseSections: boolean;
  accent: [number, number, number];
}

const STYLES: Record<TemplateId, Style> = {
  classico: {
    base: 10.5,
    nameSize: 18,
    sectionSize: 11.5,
    lineGap: 1.32,
    sectionGap: 14,
    rule: true,
    uppercaseSections: true,
    accent: [26, 26, 26],
  },
  moderno: {
    base: 10.5,
    nameSize: 21,
    sectionSize: 12,
    lineGap: 1.36,
    sectionGap: 15,
    rule: true,
    uppercaseSections: true,
    accent: [74, 139, 223],
  },
  compacto: {
    base: 9.8,
    nameSize: 16,
    sectionSize: 10.8,
    lineGap: 1.22,
    sectionGap: 10,
    rule: false,
    uppercaseSections: true,
    accent: [26, 26, 26],
  },
};

function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || "curriculo"
  );
}

export function pdfFileName(data: ResumeData) {
  return `curriculo-${slugify(data.personal.fullName || data.title)}.pdf`;
}

export function buildResumePdf(data: ResumeData): jsPDF {
  const style = STYLES[data.template] ?? STYLES.classico;
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  doc.setProperties({
    title: `Currículo — ${data.personal.fullName || data.title}`,
    subject: data.personal.headline || data.objective.desiredRole,
    author: data.personal.fullName,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 52;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const write = (
    text: string,
    opts: {
      size?: number;
      bold?: boolean;
      italic?: boolean;
      color?: [number, number, number];
      indent?: number;
      gapAfter?: number;
      link?: string;
    } = {},
  ) => {
    if (!text.trim()) return;
    const size = opts.size ?? style.base;
    doc.setFont("helvetica", opts.bold ? "bold" : opts.italic ? "italic" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color ?? [26, 26, 26]));
    const indent = opts.indent ?? 0;
    const lines = doc.splitTextToSize(text, maxWidth - indent) as string[];
    const lineHeight = size * style.lineGap;
    lines.forEach((line, index) => {
      ensureSpace(lineHeight);
      if (opts.link && index === 0) {
        doc.textWithLink(line, margin + indent, y + size, { url: opts.link });
      } else {
        doc.text(line, margin + indent, y + size);
      }
      y += lineHeight;
    });
    y += opts.gapAfter ?? 0;
  };

  const section = (title: string) => {
    ensureSpace(style.sectionSize * 3);
    y += style.sectionGap;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(style.sectionSize);
    doc.setTextColor(...style.accent);
    const label = style.uppercaseSections ? title.toUpperCase() : title;
    doc.text(label, margin, y + style.sectionSize);
    y += style.sectionSize * 1.3;
    if (style.rule) {
      doc.setDrawColor(...style.accent);
      doc.setLineWidth(0.7);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    } else {
      y += 2;
    }
  };

  const { personal, objective } = data;

  // Cabeçalho no corpo do documento (nunca em header/footer do arquivo)
  write(personal.fullName || "Nome completo", {
    size: style.nameSize,
    bold: true,
    color: data.template === "moderno" ? style.accent : [26, 26, 26],
  });
  if (personal.headline || objective.desiredRole) {
    write(personal.headline || objective.desiredRole, { size: style.base + 1.5 });
  }

  const contato = [
    fullLocation(personal.city, personal.state),
    personal.phone,
    personal.email,
  ].filter((v) => v.trim());
  if (contato.length) write(contato.join(" | "), { size: style.base, color: [60, 60, 60] });

  const links = [personal.linkedin, personal.website].filter((v) => v.trim());
  if (links.length) write(links.join(" | "), { size: style.base, color: [60, 60, 60] });

  if (personal.summary.trim()) {
    section("Resumo profissional");
    write(personal.summary.trim());
  }

  if (objective.desiredRole.trim() || objective.area.trim() || objective.objective.trim()) {
    section("Objetivo profissional");
    const linha = [objective.desiredRole, objective.area].filter((v) => v.trim()).join(" — ");
    if (linha) write(linha, { bold: true });
    if (objective.objective.trim()) write(objective.objective.trim());
  }

  const experiencias = data.experiences.filter((e) => e.role.trim() || e.company.trim());
  if (experiencias.length) {
    section("Experiência profissional");
    experiencias.forEach((exp, index) => {
      if (index > 0) y += 6;
      write([exp.role, exp.company].filter((v) => v.trim()).join(" — "), { bold: true });
      const meta = [
        formatPeriod(exp.startDate, exp.endDate, exp.current, "atual"),
        exp.city,
      ].filter((v) => v.trim());
      if (meta.length) write(meta.join(" | "), { size: style.base - 0.6, color: [70, 70, 70] });
      if (exp.description.trim()) write(exp.description.trim());
      exp.achievements
        .filter((a) => a.trim())
        .forEach((a) => write(`- ${a.trim()}`, { indent: 10 }));
    });
  }

  const formacoes = data.education.filter((e) => e.course.trim() || e.institution.trim());
  if (formacoes.length) {
    section("Formação acadêmica");
    formacoes.forEach((edu, index) => {
      if (index > 0) y += 4;
      write([edu.course, edu.level].filter((v) => v.trim()).join(" — "), { bold: true });
      const meta = [
        edu.institution,
        edu.city,
        formatPeriod(edu.startDate, edu.endDate, edu.inProgress, "em andamento"),
      ].filter((v) => v.trim());
      if (meta.length) write(meta.join(" | "), { size: style.base - 0.6, color: [70, 70, 70] });
    });
  }

  const habilidades = data.skills.filter((s) => s.trim());
  if (habilidades.length) {
    section("Habilidades");
    write(habilidades.join(" • "));
  }

  const cursos = data.certifications.filter((c) => c.name.trim());
  if (cursos.length) {
    section("Cursos e certificações");
    cursos.forEach((c) => {
      const linha = [c.name, c.issuer, c.date].filter((v) => v.trim()).join(" — ");
      write(linha);
      if (c.link.trim()) write(c.link.trim(), { size: style.base - 0.6, color: [40, 80, 150], link: c.link.trim() });
    });
  }

  const idiomas = data.languages.filter((l) => l.language.trim());
  if (idiomas.length) {
    section("Idiomas");
    idiomas.forEach((l) => write(`${l.language} — ${l.level}`));
  }

  const projetos = data.projects.filter((p) => p.name.trim());
  if (projetos.length) {
    section("Projetos");
    projetos.forEach((p, index) => {
      if (index > 0) y += 4;
      write(p.name, { bold: true });
      if (p.description.trim()) write(p.description.trim());
      if (p.skills.trim()) write(`Competências: ${p.skills.trim()}`, { size: style.base - 0.6, color: [70, 70, 70] });
      if (p.link.trim()) write(p.link.trim(), { size: style.base - 0.6, color: [40, 80, 150], link: p.link.trim() });
    });
  }

  if (data.additional.trim()) {
    section("Informações adicionais");
    write(data.additional.trim());
  }

  return doc;
}

export function exportResumePdf(data: ResumeData) {
  const doc = buildResumePdf(data);
  doc.save(pdfFileName(data));
}
