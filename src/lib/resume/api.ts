import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

import type { AnalysisPreferences } from "@/lib/analysis/preferences";

import { normalizeResume, type ResumeData } from "./types";

export type ResumeKind = "principal" | "adaptada";

export interface ResumeRow {
  id: string;
  user_id: string;
  title: string;
  target_role: string;
  template: string;
  resume_data: unknown;
  kind: string;
  parent_resume_id: string | null;
  job_title: string;
  job_company: string;
  job_description: string;
  preferences: unknown;
  created_at: string;
  updated_at: string;
}

export function isAdapted(row: Pick<ResumeRow, "kind">): boolean {
  return row.kind === "adaptada";
}

/** Nome sugerido para uma versão feita sob medida para uma vaga. */
export function suggestAdaptedTitle(jobTitle: string, company: string): string {
  const cargo = jobTitle.trim() || "Vaga";
  const empresa = company.trim();
  return empresa ? `${cargo} — ${empresa}` : `${cargo} — Versão adaptada`;
}

function payload(data: ResumeData) {
  return {
    title: data.title.trim() || "Meu currículo",
    target_role: data.personal.headline.trim() || data.objective.desiredRole.trim(),
    template: data.template,
    resume_data: JSON.parse(JSON.stringify(data)) as Json,
  };
}

export async function listResumes(): Promise<ResumeRow[]> {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ResumeRow[];
}

export async function getResume(id: string): Promise<ResumeRow> {
  const { data, error } = await supabase.from("resumes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Currículo não encontrado.");
  return data as ResumeRow;
}

export async function createResume(data: ResumeData, userId: string): Promise<ResumeRow> {
  const { data: row, error } = await supabase
    .from("resumes")
    .insert({ ...payload(data), user_id: userId })
    .select("*")
    .single();
  if (error) throw error;
  return row as ResumeRow;
}

/** Cria uma cópia dedicada a uma vaga, sem tocar no currículo original. */
export async function createAdaptedResume(
  data: ResumeData,
  userId: string,
  meta: {
    parentResumeId: string | null;
    jobTitle: string;
    company: string;
    jobDescription: string;
    preferences: AnalysisPreferences;
  },
): Promise<ResumeRow> {
  const copia: ResumeData = {
    ...structuredClone(data),
    title: suggestAdaptedTitle(meta.jobTitle, meta.company),
  };
  const { data: row, error } = await supabase
    .from("resumes")
    .insert({
      ...payload(copia),
      user_id: userId,
      kind: "adaptada",
      parent_resume_id: meta.parentResumeId,
      job_title: meta.jobTitle,
      job_company: meta.company,
      job_description: meta.jobDescription,
      preferences: JSON.parse(JSON.stringify(meta.preferences)) as Json,
    })
    .select("*")
    .single();
  if (error) throw error;
  return row as ResumeRow;
}

export async function updateResume(id: string, data: ResumeData): Promise<ResumeRow> {
  const { data: row, error } = await supabase
    .from("resumes")
    .update(payload(data))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return row as ResumeRow;
}

export async function deleteResume(id: string) {
  const { error } = await supabase.from("resumes").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateResume(row: ResumeRow, userId: string) {
  const data = normalizeResume(row.resume_data);
  data.title = `${row.title} (cópia)`;
  if (row.kind !== "adaptada") return createResume(data, userId);
  const { data: novo, error } = await supabase
    .from("resumes")
    .insert({
      ...payload(data),
      user_id: userId,
      kind: "adaptada",
      parent_resume_id: row.parent_resume_id,
      job_title: row.job_title,
      job_company: row.job_company,
      job_description: row.job_description,
      preferences: (row.preferences ?? {}) as Json,
    })
    .select("*")
    .single();
  if (error) throw error;
  return novo as ResumeRow;
}

export async function renameResume(id: string, title: string) {
  const { error } = await supabase.from("resumes").update({ title }).eq("id", id);
  if (error) throw error;
}

export function rowToResume(row: ResumeRow): ResumeData {
  const data = normalizeResume(row.resume_data);
  data.title = row.title;
  return data;
}

export interface ProfileRow {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export async function getMyProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

export async function updateMyName(userId: string, name: string) {
  const { error } = await supabase.from("profiles").update({ name }).eq("user_id", userId);
  if (error) throw error;
  await supabase.auth.updateUser({ data: { name } });
}
