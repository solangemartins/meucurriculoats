export type TemplateId = "classico" | "moderno" | "compacto";

export const TEMPLATES: { id: TemplateId; nome: string; descricao: string }[] = [
  {
    id: "classico",
    nome: "Clássico",
    descricao: "Títulos em maiúsculas com linhas discretas. Tradicional e seguro.",
  },
  {
    id: "moderno",
    nome: "Moderno",
    descricao: "Nome em destaque e títulos com detalhe em azul royal.",
  },
  {
    id: "compacto",
    nome: "Compacto",
    descricao: "Espaçamento reduzido para caber mais conteúdo em uma página.",
  },
];

export interface PersonalInfo {
  fullName: string;
  headline: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  linkedin: string;
  website: string;
  summary: string;
}

export interface ObjectiveInfo {
  desiredRole: string;
  area: string;
  objective: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  city: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  course: string;
  institution: string;
  level: string;
  city: string;
  startDate: string;
  endDate: string;
  inProgress: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export type LanguageLevel = "Básico" | "Intermediário" | "Avançado" | "Fluente" | "Nativo";

export interface LanguageItem {
  id: string;
  language: string;
  level: LanguageLevel;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  skills: string;
  link: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  objective: ObjectiveInfo;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  additional: string;
  template: TemplateId;
  title: string;
}

export const LANGUAGE_LEVELS: LanguageLevel[] = [
  "Básico",
  "Intermediário",
  "Avançado",
  "Fluente",
  "Nativo",
];

export const EDUCATION_LEVELS = [
  "Ensino médio",
  "Curso técnico",
  "Tecnólogo",
  "Graduação",
  "Pós-graduação",
  "MBA",
  "Mestrado",
  "Doutorado",
];

export const SKILL_SUGGESTIONS = [
  "Atendimento ao cliente",
  "Excel",
  "Liderança",
  "Vendas",
  "Organização",
  "Comunicação",
];

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function emptyExperience(): Experience {
  return {
    id: newId(),
    role: "",
    company: "",
    city: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    achievements: [],
  };
}

export function emptyEducation(): Education {
  return {
    id: newId(),
    course: "",
    institution: "",
    level: "Graduação",
    city: "",
    startDate: "",
    endDate: "",
    inProgress: false,
  };
}

export function emptyCertification(): Certification {
  return { id: newId(), name: "", issuer: "", date: "", link: "" };
}

export function emptyLanguage(): LanguageItem {
  return { id: newId(), language: "", level: "Intermediário" };
}

export function emptyProject(): ProjectItem {
  return { id: newId(), name: "", description: "", skills: "", link: "" };
}

export function emptyResume(): ResumeData {
  return {
    personal: {
      fullName: "",
      headline: "",
      city: "",
      state: "",
      phone: "",
      email: "",
      linkedin: "",
      website: "",
      summary: "",
    },
    objective: { desiredRole: "", area: "", objective: "" },
    experiences: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    projects: [],
    additional: "",
    template: "classico",
    title: "Meu currículo",
  };
}

/** Normaliza dados vindos do banco ou do rascunho local. */
export function normalizeResume(raw: unknown): ResumeData {
  const base = emptyResume();
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ResumeData>;
  return {
    personal: { ...base.personal, ...(data.personal ?? {}) },
    objective: { ...base.objective, ...(data.objective ?? {}) },
    experiences: (data.experiences ?? []).map((e) => ({
      ...emptyExperience(),
      ...e,
      achievements: Array.isArray(e?.achievements) ? e.achievements : [],
    })),
    education: (data.education ?? []).map((e) => ({ ...emptyEducation(), ...e })),
    skills: Array.isArray(data.skills) ? data.skills.filter(Boolean) : [],
    certifications: (data.certifications ?? []).map((c) => ({ ...emptyCertification(), ...c })),
    languages: (data.languages ?? []).map((l) => ({ ...emptyLanguage(), ...l })),
    projects: (data.projects ?? []).map((p) => ({ ...emptyProject(), ...p })),
    additional: typeof data.additional === "string" ? data.additional : "",
    template: (["classico", "moderno", "compacto"] as string[]).includes(data.template ?? "")
      ? (data.template as TemplateId)
      : "classico",
    title: data.title?.trim() ? data.title : "Meu currículo",
  };
}

/** Converte "2023-05" em "mai/2023"; devolve o texto original se não reconhecer. */
const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

export function formatMonth(value: string): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const mes = Number(match[2]);
  if (mes < 1 || mes > 12) return value;
  return `${MESES[mes - 1]}/${match[1]}`;
}

export function formatPeriod(start: string, end: string, ongoing: boolean, ongoingLabel: string) {
  const inicio = formatMonth(start);
  const fim = ongoing ? ongoingLabel : formatMonth(end);
  if (!inicio && !fim) return "";
  if (!inicio) return fim;
  if (!fim) return inicio;
  return `${inicio} – ${fim}`;
}

export function fullLocation(city: string, state: string) {
  return [city, state].filter((v) => v.trim()).join(" – ");
}
