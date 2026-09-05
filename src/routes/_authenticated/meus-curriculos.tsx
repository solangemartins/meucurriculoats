import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Copy,
  FileDown,
  FilePlus2,
  FileText,
  History,
  Loader2,
  Pencil,
  ScanSearch,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AnalysisHistoryDialog } from "@/components/analysis/AnalysisHistoryDialog";
import { JobAnalysisDialog } from "@/components/analysis/JobAnalysisDialog";
import { PageShell } from "@/components/layout/PageShell";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import {
  deleteResume,
  duplicateResume,
  listResumes,
  renameResume,
  rowToResume,
  type ResumeRow,
} from "@/lib/resume/api";
import { exportResumePdf } from "@/lib/resume/pdf";
import { TEMPLATES } from "@/lib/resume/types";

export const Route = createFileRoute("/_authenticated/meus-curriculos")({
  head: () => ({
    meta: [
      { title: "Meus currículos — Meu Currículo ATS" },
      {
        name: "description",
        content: "Veja, continue editando, duplique, renomeie ou exporte os currículos salvos na sua conta.",
      },
      { property: "og:title", content: "Meus currículos — Meu Currículo ATS" },
      { property: "og:description", content: "Seus currículos salvos, prontos para atualizar." },
    ],
  }),
  component: MeusCurriculos,
});

function dataBr(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MeusCurriculos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [renomear, setRenomear] = useState<ResumeRow | null>(null);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [excluir, setExcluir] = useState<ResumeRow | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["curriculos", user?.id],
    queryFn: listResumes,
    enabled: Boolean(user),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["curriculos", user?.id] });

  const duplicar = useMutation({
    mutationFn: (row: ResumeRow) => duplicateResume(row, user!.id),
    onSuccess: async () => {
      toast.success("Currículo duplicado.");
      await invalidar();
    },
    onError: () => toast.error("Não foi possível duplicar agora. Tente novamente."),
  });

  const renomearMut = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameResume(id, title),
    onSuccess: async () => {
      toast.success("Nome atualizado.");
      setRenomear(null);
      await invalidar();
    },
    onError: () => toast.error("Não foi possível renomear agora."),
  });

  const excluirMut = useMutation({
    mutationFn: (id: string) => deleteResume(id),
    onSuccess: async () => {
      toast.success("Currículo excluído.");
      setExcluir(null);
      await invalidar();
    },
    onError: () => toast.error("Não foi possível excluir agora."),
  });

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Meus currículos</h1>
          <p className="text-sm text-muted-foreground">
            Continue de onde parou ou crie uma nova versão para cada vaga.
          </p>
        </div>
        <Button asChild>
          <Link to="/criar-curriculo">
            <FilePlus2 className="size-4" /> Criar novo currículo
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTitle>Não conseguimos carregar seus currículos</AlertTitle>
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
        <div className="card-elevated flex flex-col items-center gap-3 p-10 text-center">
          <FileText className="size-8 text-primary" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold">Você ainda não possui currículos salvos</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Monte seu primeiro currículo no editor. Ao salvar, ele aparece aqui para você editar quando
            quiser.
          </p>
          <Button asChild className="mt-2">
            <Link to="/criar-curriculo">Criar meu currículo</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((row) => {
            const modelo = TEMPLATES.find((t) => t.id === row.template)?.nome ?? "Clássico";
            return (
              <li key={row.id}>
                <Card className="flex h-full flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{row.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {row.target_role || "Cargo ou objetivo não informado"}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2 text-sm">
                    <Badge variant="secondary">Modelo {modelo}</Badge>
                    <p className="text-xs text-muted-foreground">
                      Atualizado em {dataBr(row.updated_at)}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate({ to: "/editar-curriculo/$id", params: { id: row.id } })}
                    >
                      <Pencil className="size-4" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        exportResumePdf(rowToResume(row));
                        toast.success("PDF gerado com sucesso.");
                      }}
                    >
                      <FileDown className="size-4" /> Exportar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicar.mutate(row)}
                      disabled={duplicar.isPending}
                    >
                      <Copy className="size-4" /> Duplicar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setRenomear(row);
                        setNovoTitulo(row.title);
                      }}
                    >
                      Renomear
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setExcluir(row)}
                    >
                      <Trash2 className="size-4" /> Excluir
                    </Button>
                  </CardFooter>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={renomear !== null} onOpenChange={(aberto) => !aberto && setRenomear(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Renomear currículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="novo-titulo">Nome</Label>
            <Input
              id="novo-titulo"
              value={novoTitulo}
              onChange={(event) => setNovoTitulo(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenomear(null)}>
              Cancelar
            </Button>
            <Button
              disabled={!novoTitulo.trim() || renomearMut.isPending}
              onClick={() =>
                renomear && renomearMut.mutate({ id: renomear.id, title: novoTitulo.trim() })
              }
            >
              {renomearMut.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={excluir !== null} onOpenChange={(aberto) => !aberto && setExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{excluir?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O currículo será removido da sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => excluir && excluirMut.mutate(excluir.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir currículo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
