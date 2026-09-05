import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { loadDraft } from "@/lib/resume/draft";
import type { ResumeData } from "@/lib/resume/types";

export const Route = createFileRoute("/visualizar-curriculo")({
  head: () => ({
    meta: [
      { title: "Visualizar currículo — Meu Currículo ATS" },
      {
        name: "description",
        content: "Veja seu currículo completo em uma única coluna, exatamente como ele será exportado em PDF.",
      },
      { property: "og:title", content: "Visualizar currículo — Meu Currículo ATS" },
      {
        property: "og:description",
        content: "Pré-visualização completa do currículo antes de salvar ou exportar.",
      },
    ],
  }),
  component: VisualizarCurriculo,
});

function VisualizarCurriculo() {
  const [data, setData] = useState<ResumeData | null | "vazio">(null);

  useEffect(() => {
    const rascunho = loadDraft();
    setData(rascunho ?? "vazio");
  }, []);

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Visualização do currículo</h1>
          <p className="text-sm text-muted-foreground">
            Este é o conteúdo que será exportado, sem menus nem botões do site.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/criar-curriculo">
            <ArrowLeft className="size-4" /> Voltar para o editor
          </Link>
        </Button>
      </div>

      {data === null ? (
        <Skeleton className="h-[700px] w-full rounded-xl" />
      ) : data === "vazio" ? (
        <Alert>
          <AlertTitle>Você ainda não começou um currículo neste dispositivo</AlertTitle>
          <AlertDescription>
            Comece a preencher e a visualização aparece aqui automaticamente.
            <div className="mt-3">
              <Button asChild size="sm">
                <Link to="/criar-curriculo">Criar meu currículo</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-paper)]">
          <ResumePreview data={data} />
        </div>
      )}
    </PageShell>
  );
}
