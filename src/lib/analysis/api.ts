import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

import { normalizeAnalysis, type AnalysisResult, type JobInput } from "./types";

export interface AnalysisRow {
  id: string;
  user_id: string;
  resume_id: string | null;
  job_title: string;
  company: string;
  job_description: string;
  overall_score: number;
  analysis_result: unknown;
  created_at: string;
  updated_at: string;
}

export async function listAnalyses(resumeId?: string): Promise<AnalysisRow[]> {
  let query = supabase.from("resume_analyses").select("*").order("created_at", { ascending: false });
  if (resumeId) query = query.eq("resume_id", resumeId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AnalysisRow[];
}

export async function saveAnalysis(input: {
  userId: string;
  resumeId: string | null;
  job: JobInput;
  result: AnalysisResult;
}): Promise<AnalysisRow> {
  const { data, error } = await supabase
    .from("resume_analyses")
    .insert({
      user_id: input.userId,
      resume_id: input.resumeId,
      job_title: input.job.jobTitle,
      company: input.job.company,
      job_description: input.job.jobDescription,
      overall_score: input.result.overallScore,
      analysis_result: JSON.parse(JSON.stringify(input.result)) as Json,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as AnalysisRow;
}

export async function deleteAnalysis(id: string) {
  const { error } = await supabase.from("resume_analyses").delete().eq("id", id);
  if (error) throw error;
}

export function rowToAnalysis(row: AnalysisRow): { job: JobInput; result: AnalysisResult } {
  return {
    job: {
      jobTitle: row.job_title,
      company: row.company,
      jobDescription: row.job_description,
    },
    result: normalizeAnalysis(row.analysis_result),
  };
}
