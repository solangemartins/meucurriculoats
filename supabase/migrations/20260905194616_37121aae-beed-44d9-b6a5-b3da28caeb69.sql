CREATE TABLE public.resume_analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  job_description text NOT NULL DEFAULT '',
  overall_score integer NOT NULL DEFAULT 0,
  analysis_result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_analyses TO authenticated;
GRANT ALL ON public.resume_analyses TO service_role;

ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gerenciam suas proprias analises"
ON public.resume_analyses
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX resume_analyses_user_created_idx ON public.resume_analyses (user_id, created_at DESC);
CREATE INDEX resume_analyses_resume_idx ON public.resume_analyses (resume_id);

CREATE TRIGGER resume_analyses_set_updated_at
BEFORE UPDATE ON public.resume_analyses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();