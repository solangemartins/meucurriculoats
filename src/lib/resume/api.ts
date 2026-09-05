import { supabase } from "@/integrations/supabase/client";

import { normalizeResume, type ResumeData } from "./types";

export interface ResumeRow {
  id: string;
  user_id: string;
  title: string;
  target_role: string;
  template: string;
  resume_data: unknown;
  created_at: string;
  updated_at: string;
}

function payload(data: ResumeData) {
  return {
    title: data.title.trim() || "Meu currículo",
    target_role: data.personal.headline.trim() || data.objective.desiredRole.trim(),
    template: data.template,
    resume_data: data as unknown as Record<string, unknown>,
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
  return createResume(data, userId);
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
