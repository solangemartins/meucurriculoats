import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { ResumeEditor } from "@/components/resume/ResumeEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { getDraftResumeId, loadDraft } from "@/lib/resume/draft";
import { emptyResume, type ResumeData } from "@/lib/resume/types";

export const Route = createFileRoute("/criar-curriculo")({
  head: () => ({
    meta: [
      { title: "Criar currículo — Meu Currículo ATS" },
      {
        name: "description",
        content:
          "Preencha seu currículo em seções simples, escolha um modelo compatível com ATS e veja o resultado em tempo real. Sem cadastro.",
      },
      { property: "og:title", content: "Criar currículo — Meu Currículo ATS" },
      {
        property: "og:description",
        content: "Editor gratuito com pré-visualização em tempo real e rascunho salvo no seu dispositivo.",
      },
    ],
  }),
  component: CriarCurriculo,
});

function CriarCurriculo() {
  const [estado, setEstado] = useState<{ data: ResumeData; resumeId: string | null } | null>(null);

  useEffect(() => {
    const rascunho = loadDraft();
    setEstado({ data: rascunho ?? emptyResume(), resumeId: getDraftResumeId() });
  }, []);

  return (
    <PageShell wide showFooter={false}>
      {estado ? (
        <ResumeEditor initialData={estado.data} resumeId={estado.resumeId} keepLocalDraft />
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-[520px] w-full rounded-xl" />
            <Skeleton className="hidden h-[520px] w-full rounded-xl lg:block" />
          </div>
        </div>
      )}
    </PageShell>
  );
}
