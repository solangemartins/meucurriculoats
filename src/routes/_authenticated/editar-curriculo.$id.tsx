import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { ResumeEditor } from "@/components/resume/ResumeEditor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getResume, rowToResume } from "@/lib/resume/api";
import { listAnalyses } from "@/lib/analysis/api";

export const Route = createFileRoute("/_authenticated/editar-curriculo/$id")({
  head: () => ({
    meta: [
      { title: "Editar currículo — Meu Currículo ATS" },
      { name: "description", content: "Atualize um currículo salvo na sua conta e exporte novamente em PDF." },
      { property: "og:title", content: "Editar currículo — Meu Currículo ATS" },
      { property: "og:description", content: "Continue editando um currículo salvo." },
    ],
  }),
  component: EditarCurriculo,
});

function EditarCurriculo() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["curriculo", id],
    queryFn: () => getResume(id),
  });

  const { data: analises } = useQuery({
    queryKey: ["analises", id],
    queryFn: () => listAnalyses(id),
  });

  const adapted =
    data && data.kind === "adaptada"
      ? {
          jobTitle: data.job_title,
          company: data.job_company,
          jobDescription: data.job_description,
          parentResumeId: data.parent_resume_id,
          lastScore: analises?.[0]?.overall_score ?? null,
          preferences: data.preferences,
        }
      : null;

  return (
    <PageShell wide showFooter={false}>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-[520px] w-full rounded-xl" />
            <Skeleton className="hidden h-[520px] w-full rounded-xl lg:block" />
          </div>
        </div>
      ) : isError || !data ? (
        <Alert variant="destructive">
          <AlertTitle>Currículo não encontrado</AlertTitle>
          <AlertDescription>
            Ele pode ter sido excluído ou pertence a outra conta.
            <div className="mt-3">
              <Button asChild size="sm" variant="outline">
                <Link to="/meus-curriculos">Voltar para meus currículos</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <ResumeEditor
          initialData={rowToResume(data)}
          resumeId={data.id}
          keepLocalDraft={false}
          adapted={adapted}
        />
      )}
    </PageShell>
  );
}
