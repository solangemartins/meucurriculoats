ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'principal',
  ADD COLUMN IF NOT EXISTS parent_resume_id uuid REFERENCES public.resumes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS job_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS job_company text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS job_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.resume_analyses
  ADD COLUMN IF NOT EXISTS source_kind text NOT NULL DEFAULT 'salvo',
  ADD COLUMN IF NOT EXISTS pasted_resume text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS adapted_resume_id uuid REFERENCES public.resumes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS resumes_parent_idx ON public.resumes (parent_resume_id);
CREATE INDEX IF NOT EXISTS resumes_kind_idx ON public.resumes (user_id, kind);