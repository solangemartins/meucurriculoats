import { useServerFn } from "@tanstack/react-start";
import { Loader2, ScanSearch, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AnalysisResultPanel } from "@/components/analysis/AnalysisResultPanel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { analyzeResumeForJob } from "@/lib/analysis/analyze.functions";
import { saveAnalysis } from "@/lib/analysis/api";
import { loadLocalAnalysis, saveLocalAnalysis } from "@/lib/analysis/local";
import {
  DISCLAIMER,
  MIN_JOB_DESCRIPTION,
  type AnalysisResult,
  type AnalysisRewrite,
  type JobInput,
} from "@/lib/analysis/types";
import { useAuth } from "@/lib/auth-context";
import type { ResumeData } from "@/lib/resume/types";

const MENSAGENS: Record<string, string> = {
  "descricao-curta": `Cole a descrição completa da vaga (pelo menos ${MIN_JOB_DESCRIPTION} caracteres) para uma análise confiável.`,
  "cargo-invalido": "Informe o cargo da vaga.",
  "limite-uso": "Muitas análises em pouco tempo. Aguarde um instante e tente novamente.",
  "ia-indisponivel": "A análise está indisponível neste momento. Tente novamente em alguns minutos.",
  "falha-conexao": "Não foi possível concluir a análise. Verifique sua conexão e tente novamente.",
  "falha-analise": "Não foi possível concluir a análise agora. Tente novamente em alguns instantes.",
};

function mensagemDeErro(erro: unknown): string {
  const bruta = erro instanceof Error ? erro.message : String(erro ?? "");
  for (const chave of Object.keys(MENSAGENS)) {
    if (bruta.includes(chave)) return MENSAGENS[chave]!;
  }
  return MENSAGENS["falha-analise"]!;
}

export function JobAnalysisDialog({
  open,
  onOpenChange,
  data,
  resumeId,
  onApplyRewrite,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ResumeData;
  resumeId: string | null;
  onApplyRewrite?: (rewrite: AnalysisRewrite, texto: string) => void;
  initial?: { job: JobInput; result: AnalysisResult | null } | null;
}) {
  const { user } = useAuth();
  const analisar = useServerFn(analyzeResumeForJob);

  const [job, setJob] = useState<JobInput>({ jobTitle: "", company: "", jobDescription: "" });
  const [resultado, setResultado] = useState<AnalysisResult | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (!open) return;
    const guardado = initial ?? loadLocalAnalysis();
    if (guardado) {
      setJob(guardado.job);
      setResultado(guardado.result);
    }
    setErro(null);
    setSalvo(false);
  }, [open, initial]);

  const descricaoCurta = job.jobDescription.trim().length < MIN_JOB_DESCRIPTION;
  const semCargo = job.jobTitle.trim().length < 2;

  async function executar() {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await analisar({
        data: {
          resume: data,
          jobTitle: job.jobTitle,
          company: job.company,
          jobDescription: job.jobDescription,
        },
      });
      setResultado(resposta);
      setSalvo(false);
      saveLocalAnalysis({ job, result: resposta, createdAt: new Date().toISOString() });
    } catch (e) {
      setResultado(null);
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  async function guardarHistorico() {
    if (!user || !resultado) return;
    setSalvando(true);
    try {
      await saveAnalysis({ userId: user.id, resumeId, job, result: resultado });
      setSalvo(true);
      toast.success("Análise salva no seu histórico.");
    } catch {
      toast.error("Não foi possível salvar a análise agora.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanSearch className="size-5 text-primary" aria-hidden="true" />
            Análise de compatibilidade ATS
          </DialogTitle>
          <DialogDescription>
            Compare seu currículo com uma vaga específica. Nada é alterado no seu currículo sem você pedir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="analise-cargo">Cargo da vaga</Label>
              <Input
                id="analise-cargo"
                value={job.jobTitle}
                placeholder="Analista de Marketing"
                onChange={(event) => setJob((atual) => ({ ...atual, jobTitle: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="analise-empresa">Empresa (opcional)</Label>
              <Input
                id="analise-empresa"
                value={job.company}
                placeholder="Nome da empresa"
                onChange={(event) => setJob((atual) => ({ ...atual, company: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="analise-descricao">Descrição da vaga</Label>
            <Textarea
              id="analise-descricao"
              className="min-h-40"
              value={job.jobDescription}
              placeholder="Cole aqui a descrição completa da vaga: responsabilidades, requisitos e diferenciais."
              onChange={(event) => setJob((atual) => ({ ...atual, jobDescription: event.target.value }))}
              aria-describedby="analise-descricao-ajuda"
            />
            <p id="analise-descricao-ajuda" className="text-xs text-muted-foreground">
              {job.jobDescription.trim().length} caracteres. Quanto mais completa a descrição, melhor a
              análise (mínimo de {MIN_JOB_DESCRIPTION}).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void executar()} disabled={carregando || descricaoCurta || semCargo}>
              {carregando ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              {carregando ? "Analisando…" : resultado ? "Analisar novamente" : "Analisar compatibilidade"}
            </Button>
            {resultado && user ? (
              <Button variant="outline" onClick={() => void guardarHistorico()} disabled={salvando || salvo}>
                {salvando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                {salvo ? "Análise salva" : "Salvar no histórico"}
              </Button>
            ) : null}
          </div>

          {carregando ? (
            <p className="text-sm text-muted-foreground" role="status">
              Comparando seu currículo com a vaga. Isso leva alguns segundos.
            </p>
          ) : null}

          {erro ? (
            <Alert variant="destructive">
              <AlertTitle>Não foi possível analisar</AlertTitle>
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          ) : null}

          {resultado ? (
            <>
              {!user ? (
                <Alert>
                  <AlertTitle>Quer guardar esta análise?</AlertTitle>
                  <AlertDescription>
                    Você pode analisar quantas vagas quiser sem conta. Ao entrar, o histórico de análises
                    fica salvo junto com seus currículos.
                  </AlertDescription>
                </Alert>
              ) : null}
              <AnalysisResultPanel
                job={job}
                result={resultado}
                {...(onApplyRewrite ? { onApplyRewrite } : {})}
              />
            </>
          ) : (
            <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {resultado ? "Voltar e editar currículo" : "Fechar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
