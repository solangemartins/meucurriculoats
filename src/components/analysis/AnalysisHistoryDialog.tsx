import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AnalysisResultPanel } from "@/components/analysis/AnalysisResultPanel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteAnalysis, listAnalyses, rowToAnalysis } from "@/lib/analysis/api";
import { scoreBand } from "@/lib/analysis/types";

function dataBr(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AnalysisHistoryDialog({
  open,
  onOpenChange,
  resumeId,
  resumeTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  resumeTitle: string;
}) {
  const queryClient = useQueryClient();
  const [aberta, setAberta] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["analises", resumeId],
    queryFn: () => listAnalyses(resumeId),
    enabled: open,
  });

  const excluir = useMutation({
    mutationFn: (id: string) => deleteAnalysis(id),
    onSuccess: async () => {
      toast.success("Análise excluída.");
      await queryClient.invalidateQueries({ queryKey: ["analises", resumeId] });
    },
    onError: () => toast.error("Não foi possível excluir a análise agora."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" aria-hidden="true" />
            Histórico de análises
          </DialogTitle>
          <DialogDescription>Análises salvas para “{resumeTitle}”.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertTitle>Não conseguimos carregar o histórico</AlertTitle>
            <AlertDescription>
              Verifique sua conexão e tente novamente.
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => void refetch()}>
                  Tentar novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma análise salva para este currículo. Abra “Analisar vaga” e salve o resultado para
            acompanhar sua evolução.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.map((row) => {
              const banda = scoreBand(row.overall_score);
              const detalhe = rowToAnalysis(row);
              return (
                <li key={row.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {row.job_title}
                        {row.company ? ` — ${row.company}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">Analisado em {dataBr(row.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {row.overall_score}/100 · {banda.rotulo}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAberta(aberta === row.id ? null : row.id)}
                      >
                        {aberta === row.id ? "Ocultar" : "Ver detalhes"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Excluir análise da vaga ${row.job_title}`}
                        onClick={() => excluir.mutate(row.id)}
                        disabled={excluir.isPending}
                      >
                        {excluir.isPending ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="size-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {aberta === row.id ? (
                    <div className="mt-3">
                      <AnalysisResultPanel job={detalhe.job} result={detalhe.result} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
