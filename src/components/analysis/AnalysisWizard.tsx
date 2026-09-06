import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardPaste,
  FilePlus2,
  FileText,
  Loader2,
  ScanSearch,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AnalysisResultPanel } from "@/components/analysis/AnalysisResultPanel";
import { OptimizationPanel, type ProposalDecision } from "@/components/analysis/OptimizationPanel";
import { Stepper } from "@/components/analysis/Stepper";
import { AuthDialog } from "@/components/auth/AuthDialog";
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
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveAnalysis } from "@/lib/analysis/api";
import { analyzeResumeForJob } from "@/lib/analysis/analyze.functions";
import { clearLocalFlow, emptyFlow, loadLocalFlow, saveLocalFlow } from "@/lib/analysis/local";
import { createOptimizedVersion } from "@/lib/analysis/optimize.functions";
import { parsePastedResume } from "@/lib/analysis/parse.functions";
import {
  GOAL_OPTIONS,
  LANGUAGE_OPTIONS,
  LEVEL_OPTIONS,
  TONE_OPTIONS,
  defaultPreferences,
  suggestLevel,
  type AnalysisPreferences,
  type ResumeSource,
} from "@/lib/analysis/preferences";
import {
  DISCLAIMER,
  MIN_JOB_DESCRIPTION,
  type AnalysisResult,
  type AnalysisRewrite,
  type JobInput,
  type OptimizationResult,
} from "@/lib/analysis/types";
import { MIN_PASTED_RESUME, hasUsablePastedResume, hasUsableResume, resumeSummaryLine } from "@/lib/analysis/usable";
import { useAuth } from "@/lib/auth-context";
import {
  createAdaptedResume,
  listResumes,
  rowToResume,
  suggestAdaptedTitle,
  type ResumeRow,
} from "@/lib/resume/api";
import { loadDraft, saveDraft, setDraftAdaptedMeta, setDraftResumeId } from "@/lib/resume/draft";
import { normalizeResume, type ResumeData } from "@/lib/resume/types";

const MENSAGENS: Record<string, string> = {
  "descricao-curta": `Cole a descrição completa da vaga (pelo menos ${MIN_JOB_DESCRIPTION} caracteres) para uma análise confiável.`,
  "cargo-invalido": "Informe o cargo da vaga.",
  "curriculo-insuficiente":
    "Precisamos das informações do seu currículo para comparar com a vaga. Selecione um currículo salvo, cole seu currículo ou crie um agora.",
  "limite-uso": "Muitas análises em pouco tempo. Aguarde um instante e tente novamente.",
  "ia-indisponivel": "A análise está indisponível neste momento. Tente novamente em alguns minutos.",
  "falha-conexao": "Não foi possível concluir a análise. Verifique sua conexão e tente novamente.",
  "falha-leitura": "Não conseguimos organizar o currículo colado. Tente colar novamente o texto completo.",
  "falha-analise": "Não foi possível concluir a análise agora. Tente novamente em alguns instantes.",
};

function mensagemDeErro(erro: unknown): string {
  const bruta = erro instanceof Error ? erro.message : String(erro ?? "");
  for (const chave of Object.keys(MENSAGENS)) {
    if (bruta.includes(chave)) return MENSAGENS[chave]!;
  }
  return MENSAGENS["falha-analise"]!;
}

type Etapa = "vaga" | "curriculo" | "preferencias" | "resultado" | "otimizar" | "revisao";
const PASSOS = ["Vaga", "Currículo", "Preferências"];

function dataBr(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-lg border p-3 text-left transition ${
        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"
      }`}
    >
      <span className="flex items-center gap-2 font-medium">
        {icon}
        {title}
      </span>
      {children ? <span className="mt-1 block text-sm text-muted-foreground">{children}</span> : null}
    </button>
  );
}

export function AnalysisWizard({
  open,
  onOpenChange,
  resumeData,
  resumeId,
  initialJob,
  previousScore,
  onApplyRewrite,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Currículo aberto na tela, quando existir. */
  resumeData?: ResumeData | null;
  resumeId?: string | null;
  initialJob?: JobInput | null;
  previousScore?: number | null;
  onApplyRewrite?: (rewrite: AnalysisRewrite, texto: string) => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const analisar = useServerFn(analyzeResumeForJob);
  const otimizar = useServerFn(createOptimizedVersion);
  const interpretar = useServerFn(parsePastedResume);

  const [etapa, setEtapa] = useState<Etapa>("vaga");
  const [job, setJob] = useState<JobInput>({ jobTitle: "", company: "", jobDescription: "" });
  const [prefs, setPrefs] = useState<AnalysisPreferences>(defaultPreferences());
  const [nivelTocado, setNivelTocado] = useState(false);
  const [source, setSource] = useState<ResumeSource | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<ResumeData | null>(null);

  const [resultado, setResultado] = useState<AnalysisResult | null>(null);
  const [anterior, setAnterior] = useState<number | null>(previousScore ?? null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [authAberto, setAuthAberto] = useState(false);
  const [aguardandoLogin, setAguardandoLogin] = useState(false);
  const [cancelar, setCancelar] = useState(false);

  const [otimizacao, setOtimizacao] = useState<OptimizationResult | null>(null);
  const [decisoes, setDecisoes] = useState<Record<number, { decision: ProposalDecision; texto: string }>>({});
  const [processando, setProcessando] = useState(false);
  const [interpretado, setInterpretado] = useState<ResumeData | null>(null);
  const [acaoPosRevisao, setAcaoPosRevisao] = useState<"editar" | "otimizar" | null>(null);

  const { data: salvos } = useQuery({
    queryKey: ["curriculos", user?.id],
    queryFn: listResumes,
    enabled: Boolean(user) && open,
  });

  /* ---------- carregamento inicial ---------- */
  useEffect(() => {
    if (!open) return;
    const guardado = loadLocalFlow();
    const draft = loadDraft();
    setRascunho(draft);
    setErro(null);
    setSalvo(false);
    setEtapa("vaga");
    setOtimizacao(null);
    setDecisoes({});
    setInterpretado(null);
    setAnterior(previousScore ?? null);

    if (initialJob?.jobTitle) {
      setJob(initialJob);
    } else if (guardado) {
      setJob(guardado.job);
    }
    if (guardado) {
      setPrefs(guardado.preferences);
      setPastedText(guardado.pastedText);
      setResultado(guardado.result);
    }

    if (resumeId) {
      setSource("salvo");
      setSavedId(resumeId);
    } else if (resumeData && hasUsableResume(resumeData)) {
      setSource("rascunho");
    } else if (guardado?.source) {
      setSource(guardado.source);
      setSavedId(guardado.savedResumeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* ---------- persistência local ---------- */
  useEffect(() => {
    if (!open) return;
    saveLocalFlow({
      ...emptyFlow(),
      job,
      preferences: prefs,
      source,
      pastedText,
      savedResumeId: savedId,
      result: resultado,
    });
  }, [open, job, prefs, source, pastedText, savedId, resultado]);

  /* ---------- sugestão de nível ---------- */
  useEffect(() => {
    if (nivelTocado) return;
    const sugerido = suggestLevel(job.jobTitle, job.jobDescription);
    setPrefs((atual) => (atual.level === sugerido ? atual : { ...atual, level: sugerido }));
  }, [job.jobTitle, job.jobDescription, nivelTocado]);

  const selecionado: ResumeRow | null = useMemo(
    () => (savedId ? (salvos?.find((r) => r.id === savedId) ?? null) : null),
    [salvos, savedId],
  );

  const curriculoEscolhido: ResumeData | null = useMemo(() => {
    if (source === "colado") return null;
    if (source === "salvo") {
      if (savedId && resumeId && savedId === resumeId && resumeData) return resumeData;
      return selecionado ? rowToResume(selecionado) : null;
    }
    if (source === "rascunho") return resumeData ?? rascunho;
    return null;
  }, [source, savedId, resumeId, resumeData, selecionado, rascunho]);

  const descricaoCurta = job.jobDescription.trim().length < MIN_JOB_DESCRIPTION;
  const semCargo = job.jobTitle.trim().length < 2;
  const curriculoOk =
    source === "colado" ? hasUsablePastedResume(pastedText) : hasUsableResume(curriculoEscolhido);

  /* ---------- análise ---------- */
  const executar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await analisar({
        data: {
          ...(source === "colado" ? { pastedText } : { resume: curriculoEscolhido }),
          jobTitle: job.jobTitle,
          company: job.company,
          jobDescription: job.jobDescription,
          preferences: prefs,
        },
      });
      setAnterior(resultado?.overallScore ?? previousScore ?? null);
      setResultado(resposta);
      setSalvo(false);
      setEtapa("resultado");
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, [analisar, curriculoEscolhido, job, pastedText, prefs, previousScore, resultado, source]);

  /* ---------- salvar análise ---------- */
  const guardarHistorico = useCallback(
    async (adaptedResumeId?: string | null) => {
      if (!user || !resultado || !source) return;
      setSalvando(true);
      try {
        await saveAnalysis({
          userId: user.id,
          resumeId: source === "salvo" ? savedId : null,
          job,
          result: resultado,
          source,
          pastedText,
          preferences: prefs,
          adaptedResumeId: adaptedResumeId ?? null,
        });
        setSalvo(true);
        toast.success("Análise salva no seu histórico.");
      } catch {
        toast.error("Não foi possível salvar a análise agora.");
      } finally {
        setSalvando(false);
      }
    },
    [job, pastedText, prefs, resultado, savedId, source, user],
  );

  const pedirSalvar = () => {
    if (!user) {
      setAguardandoLogin(true);
      setAuthAberto(true);
      return;
    }
    void guardarHistorico();
  };

  useEffect(() => {
    if (user && aguardandoLogin) {
      setAguardandoLogin(false);
      setAuthAberto(false);
      void guardarHistorico();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, aguardandoLogin]);

  /* ---------- versão adaptada ---------- */
  const abrirVersaoAdaptada = useCallback(
    async (base: ResumeData) => {
      setProcessando(true);
      try {
        if (user) {
          const row = await createAdaptedResume(base, user.id, {
            parentResumeId: source === "salvo" ? savedId : null,
            jobTitle: job.jobTitle,
            company: job.company,
            jobDescription: job.jobDescription,
            preferences: prefs,
          });
          if (resultado && !salvo) await guardarHistorico(row.id);
          onOpenChange(false);
          await navigate({ to: "/editar-curriculo/$id", params: { id: row.id } });
          toast.success("Criamos uma versão para esta vaga. Seu currículo original continua inalterado.");
        } else {
          saveDraft({ ...base, title: suggestAdaptedTitle(job.jobTitle, job.company) });
          setDraftResumeId(null);
          setDraftAdaptedMeta({
            jobTitle: job.jobTitle,
            company: job.company,
            jobDescription: job.jobDescription,
            parentResumeId: null,
            lastScore: resultado?.overallScore ?? null,
            preferences: prefs,
          });
          onOpenChange(false);
          await navigate({ to: "/criar-curriculo" });
          toast.success("Versão para esta vaga aberta no editor. Nada foi enviado para a nuvem ainda.");
        }
      } catch {
        toast.error("Não foi possível abrir a versão adaptada agora. Tente novamente.");
      } finally {
        setProcessando(false);
      }
    },
    [guardarHistorico, job, navigate, onOpenChange, prefs, resultado, salvo, savedId, source, user],
  );

  const garantirEstruturado = useCallback(
    async (acao: "editar" | "otimizar"): Promise<ResumeData | null> => {
      if (source !== "colado") return curriculoEscolhido;
      if (interpretado) return interpretado;
      setProcessando(true);
      setErro(null);
      try {
        const organizado = normalizeResume(await interpretar({ data: { pastedText } }));
        setInterpretado(organizado);
        setAcaoPosRevisao(acao);
        setEtapa("revisao");
        return null;
      } catch (e) {
        setErro(mensagemDeErro(e));
        return null;
      } finally {
        setProcessando(false);
      }
    },
    [curriculoEscolhido, interpretado, interpretar, pastedText, source],
  );

  const editarParaVaga = async () => {
    const base = await garantirEstruturado("editar");
    if (base) await abrirVersaoAdaptada(base);
  };

  const gerarOtimizada = async (baseInformada?: ResumeData) => {
    const base = baseInformada ?? (await garantirEstruturado("otimizar"));
    if (!base) return;
    setProcessando(true);
    setErro(null);
    try {
      const resposta = await otimizar({
        data: {
          resume: base,
          jobTitle: job.jobTitle,
          company: job.company,
          jobDescription: job.jobDescription,
          preferences: prefs,
        },
      });
      setOtimizacao(resposta);
      setDecisoes({});
      setEtapa("otimizar");
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setProcessando(false);
    }
  };

  const aplicarAceitas = async () => {
    const base = interpretado ?? curriculoEscolhido;
    if (!base || !otimizacao) return;
    const copia = structuredClone(base);
    otimizacao.propostas.forEach((proposta, index) => {
      const decisao = decisoes[index];
      if (!decisao || decisao.decision !== "aceita") return;
      const texto = decisao.texto;
      if (proposta.alvo === "resumo") copia.personal.summary = texto;
      else if (proposta.alvo === "objetivo") copia.objective.objective = texto;
      else if (proposta.alvo === "experiencia") {
        const alvo = copia.experiences.find((e) => e.id === proposta.alvoId) ?? copia.experiences[0];
        if (alvo) alvo.description = texto;
      } else if (proposta.alvo === "projeto") {
        const alvo = copia.projects.find((p) => p.id === proposta.alvoId) ?? copia.projects[0];
        if (alvo) alvo.description = texto;
      }
    });
    await abrirVersaoAdaptada(copia);
  };

  const fecharComConfirmacao = () => {
    const temDados = job.jobTitle.trim() || job.jobDescription.trim() || pastedText.trim() || resultado;
    if (temDados) setCancelar(true);
    else onOpenChange(false);
  };

  /* ---------- conteúdo por etapa ---------- */
  const etapaIndex = etapa === "vaga" ? 0 : etapa === "curriculo" ? 1 : 2;

  const cabecalho = (
    <div className="space-y-3 border-b border-border p-4 sm:p-5">
      <div>
        <DialogTitle className="flex items-center gap-2">
          <ScanSearch className="size-5 text-primary" aria-hidden="true" />
          Análise de compatibilidade ATS
        </DialogTitle>
        <DialogDescription>
          Em três etapas comparamos seu currículo com uma vaga. Nada é alterado no seu currículo sem você
          pedir.
        </DialogDescription>
      </div>
      {etapa === "vaga" || etapa === "curriculo" || etapa === "preferencias" ? (
        <Stepper steps={PASSOS} current={etapaIndex} />
      ) : null}
    </div>
  );

  const passoVaga = (
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
          {semCargo && job.jobTitle.length > 0 ? (
            <p className="text-xs text-destructive">Informe o cargo da vaga.</p>
          ) : null}
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
        <Label htmlFor="analise-descricao">Descrição completa da vaga</Label>
        <p className="text-xs text-muted-foreground">
          Cole a descrição completa da vaga, incluindo atividades, requisitos e diferenciais. Quanto mais
          completa for a descrição, mais precisa será a análise.
        </p>
        <Textarea
          id="analise-descricao"
          className="min-h-44"
          value={job.jobDescription}
          placeholder="Atividades, requisitos obrigatórios e diferenciais da vaga."
          onChange={(event) => setJob((atual) => ({ ...atual, jobDescription: event.target.value }))}
          aria-describedby="analise-descricao-ajuda"
        />
        <p id="analise-descricao-ajuda" className="text-xs text-muted-foreground">
          {job.jobDescription.trim().length} de {MIN_JOB_DESCRIPTION} caracteres mínimos.
        </p>
        {descricaoCurta && job.jobDescription.length > 0 ? (
          <p className="text-xs text-destructive">
            A descrição precisa ter pelo menos {MIN_JOB_DESCRIPTION} caracteres.
          </p>
        ) : null}
      </div>
    </div>
  );

  const passoCurriculo = (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Escolha o que vamos comparar com a vaga. Você não precisa recriar seu currículo no site.
      </p>

      {user ? (
        <OptionCard
          selected={source === "salvo"}
          onSelect={() => {
            setSource("salvo");
            if (!savedId && salvos?.length === 1) setSavedId(salvos[0]!.id);
          }}
          icon={<FileText className="size-4 text-primary" aria-hidden="true" />}
          title="Usar currículo criado no site"
        >
          {salvos && salvos.length > 0
            ? "Selecione qual currículo salvo será analisado."
            : "Você ainda não tem currículos salvos na conta."}
        </OptionCard>
      ) : null}

      {source === "salvo" && salvos && salvos.length > 0 ? (
        <div className="space-y-2 rounded-lg border border-border p-3">
          <RadioGroup value={savedId ?? ""} onValueChange={setSavedId} className="gap-2">
            {salvos.map((row) => (
              <label
                key={row.id}
                htmlFor={`cv-${row.id}`}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-2.5"
              >
                <RadioGroupItem id={`cv-${row.id}`} value={row.id} className="mt-1" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{row.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {row.target_role || "Cargo não informado"} • atualizado em {dataBr(row.updated_at)}
                    {row.kind === "adaptada" ? " • versão adaptada" : ""}
                  </span>
                </span>
              </label>
            ))}
          </RadioGroup>
          {savedId && curriculoEscolhido && !hasUsableResume(curriculoEscolhido) ? (
            <p className="text-xs text-destructive">
              Este currículo ainda não tem informações profissionais suficientes para a análise.
            </p>
          ) : null}
        </div>
      ) : null}

      {rascunho && hasUsableResume(resumeData ?? rascunho) ? (
        <OptionCard
          selected={source === "rascunho"}
          onSelect={() => setSource("rascunho")}
          icon={<FileText className="size-4 text-primary" aria-hidden="true" />}
          title="Usar meu rascunho atual"
        >
          {(resumeData ?? rascunho)!.personal.fullName || "Sem nome informado"} —{" "}
          {(resumeData ?? rascunho)!.personal.headline || "cargo não informado"}.{" "}
          {resumeSummaryLine((resumeData ?? rascunho)!)}
        </OptionCard>
      ) : null}

      <OptionCard
        selected={source === "colado"}
        onSelect={() => setSource("colado")}
        icon={<ClipboardPaste className="size-4 text-primary" aria-hidden="true" />}
        title="Colar um currículo que já tenho"
      >
        Analise o texto do seu currículo atual, sem precisar preencher tudo de novo.
      </OptionCard>

      {source === "colado" ? (
        <div className="space-y-1.5">
          <Label htmlFor="curriculo-colado">Conteúdo do currículo</Label>
          <p className="text-xs text-muted-foreground">
            Copie o conteúdo do seu currículo atual e cole aqui. Não é necessário reorganizar o texto antes
            da análise.
          </p>
          <Textarea
            id="curriculo-colado"
            className="min-h-48"
            value={pastedText}
            onChange={(event) => setPastedText(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {pastedText.trim().length} de {MIN_PASTED_RESUME} caracteres mínimos.
          </p>
          {pastedText.length > 0 && !hasUsablePastedResume(pastedText) ? (
            <p className="text-xs text-destructive">
              Cole um pouco mais do seu currículo para conseguirmos comparar com a vaga.
            </p>
          ) : null}
        </div>
      ) : null}

      {!user && !rascunho ? (
        <OptionCard
          selected={false}
          onSelect={() => {
            onOpenChange(false);
            void navigate({ to: "/criar-curriculo" });
          }}
          icon={<FilePlus2 className="size-4 text-primary" aria-hidden="true" />}
          title="Criar meu currículo"
        >
          Abrimos o editor e guardamos a descrição desta vaga para você voltar à análise depois.
        </OptionCard>
      ) : null}

      {!curriculoOk ? (
        <Alert>
          <AlertTitle>Selecione ou informe seu currículo</AlertTitle>
          <AlertDescription>
            Para comparar seu perfil com esta vaga, precisamos das informações do seu currículo.
            <div className="mt-3 flex flex-wrap gap-2">
              {user ? (
                <Button size="sm" variant="outline" onClick={() => setSource("salvo")}>
                  Usar currículo salvo
                </Button>
              ) : null}
              <Button size="sm" variant="outline" onClick={() => setSource("colado")}>
                Colar meu currículo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  void navigate({ to: "/criar-curriculo" });
                }}
              >
                Criar meu currículo
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );

  const passoPreferencias = (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pref-nivel">Nível da vaga</Label>
          <Select
            value={prefs.level}
            onValueChange={(value) => {
              setNivelTocado(true);
              setPrefs((atual) => ({ ...atual, level: value as AnalysisPreferences["level"] }));
            }}
          >
            <SelectTrigger id="pref-nivel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Sugerimos com base no cargo e na descrição. Você pode alterar.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pref-idioma">Idioma do currículo</Label>
          <Select
            value={prefs.language}
            onValueChange={(value) =>
              setPrefs((atual) => ({ ...atual, language: value as AnalysisPreferences["language"] }))
            }
          >
            <SelectTrigger id="pref-idioma">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {LANGUAGE_OPTIONS.find((o) => o.id === prefs.language)?.descricao}
          </p>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Tom profissional</legend>
        <RadioGroup
          value={prefs.tone}
          onValueChange={(value) =>
            setPrefs((atual) => ({ ...atual, tone: value as AnalysisPreferences["tone"] }))
          }
          className="grid gap-2 sm:grid-cols-2"
        >
          {TONE_OPTIONS.map((o) => (
            <label
              key={o.id}
              htmlFor={`tom-${o.id}`}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-2.5"
            >
              <RadioGroupItem id={`tom-${o.id}`} value={o.id} className="mt-1" />
              <span>
                <span className="block font-medium">{o.label}</span>
                <span className="block text-xs text-muted-foreground">{o.descricao}</span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Objetivo da análise</legend>
        <RadioGroup
          value={prefs.goal}
          onValueChange={(value) =>
            setPrefs((atual) => ({ ...atual, goal: value as AnalysisPreferences["goal"] }))
          }
          className="grid gap-2 sm:grid-cols-2"
        >
          {GOAL_OPTIONS.map((o) => (
            <label
              key={o.id}
              htmlFor={`obj-${o.id}`}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-2.5"
            >
              <RadioGroupItem id={`obj-${o.id}`} value={o.id} className="mt-1" />
              <span>
                <span className="block font-medium">{o.label}</span>
                <span className="block text-xs text-muted-foreground">{o.descricao}</span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
    </div>
  );

  const passoResultado = resultado ? (
    <div className="space-y-4">
      {anterior !== null && anterior !== resultado.overallScore ? (
        <Alert>
          <AlertTitle>Comparação com a análise anterior</AlertTitle>
          <AlertDescription>
            Antes: {anterior}/100 • Agora: {resultado.overallScore}/100 (
            {resultado.overallScore > anterior ? "melhorou" : "reduziu"}{" "}
            {Math.abs(resultado.overallScore - anterior)} pontos).
          </AlertDescription>
        </Alert>
      ) : null}

      {!user ? (
        <Alert>
          <AlertTitle>Você está analisando como visitante</AlertTitle>
          <AlertDescription>
            Entre ou crie uma conta somente se quiser salvar esta análise no seu histórico, salvar um
            currículo ou exportar em PDF.
          </AlertDescription>
        </Alert>
      ) : null}

      <AnalysisResultPanel
        job={job}
        result={resultado}
        {...(onApplyRewrite ? { onApplyRewrite } : {})}
      />
    </div>
  ) : null;

  const passoRevisao = interpretado ? (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Revise os dados interpretados</AlertTitle>
        <AlertDescription>
          Organizamos as informações do currículo colado. Revise os dados antes de salvar ou exportar, pois a
          leitura automática pode cometer erros.
        </AlertDescription>
      </Alert>
      <div className="space-y-1.5 rounded-lg border border-border p-3 text-sm">
        <p>
          <span className="font-medium">Nome:</span> {interpretado.personal.fullName || "não identificado"}
        </p>
        <p>
          <span className="font-medium">Cargo:</span> {interpretado.personal.headline || "não identificado"}
        </p>
        <p>
          <span className="font-medium">Contato:</span>{" "}
          {[interpretado.personal.email, interpretado.personal.phone].filter(Boolean).join(" • ") ||
            "não identificado"}
        </p>
        <p>
          <span className="font-medium">Resumo:</span>{" "}
          {interpretado.personal.summary ? "identificado" : "não identificado"}
        </p>
        <p className="text-muted-foreground">{resumeSummaryLine(interpretado)}</p>
      </div>
    </div>
  ) : null;

  const rodape = (
    <div className="flex flex-wrap items-center gap-2 border-t border-border p-4 sm:p-5">
      {etapa === "vaga" ? (
        <>
          <Button onClick={() => setEtapa("curriculo")} disabled={semCargo || descricaoCurta}>
            Continuar <ArrowRight className="size-4" />
          </Button>
          <Button variant="ghost" onClick={fecharComConfirmacao}>
            Cancelar análise
          </Button>
        </>
      ) : null}

      {etapa === "curriculo" ? (
        <>
          <Button onClick={() => setEtapa("preferencias")} disabled={!curriculoOk}>
            Continuar <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" onClick={() => setEtapa("vaga")}>
            <ArrowLeft className="size-4" /> Voltar
          </Button>
          <Button variant="ghost" onClick={fecharComConfirmacao}>
            Cancelar análise
          </Button>
        </>
      ) : null}

      {etapa === "preferencias" ? (
        <>
          <Button onClick={() => void executar()} disabled={carregando || !curriculoOk}>
            {carregando ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="size-4" aria-hidden="true" />
            )}
            {carregando ? "Analisando…" : "Gerar análise ATS"}
          </Button>
          <Button variant="outline" onClick={() => setEtapa("curriculo")} disabled={carregando}>
            <ArrowLeft className="size-4" /> Voltar
          </Button>
          <Button variant="ghost" onClick={fecharComConfirmacao} disabled={carregando}>
            Cancelar análise
          </Button>
        </>
      ) : null}

      {etapa === "resultado" ? (
        <>
          <Button onClick={() => void editarParaVaga()} disabled={processando}>
            {processando ? <Loader2 className="size-4 animate-spin" /> : null}
            Editar currículo para esta vaga
          </Button>
          <Button variant="secondary" onClick={() => void gerarOtimizada()} disabled={processando}>
            <Wand2 className="size-4" /> Criar versão otimizada
          </Button>
          <Button variant="outline" onClick={() => void executar()} disabled={carregando}>
            {carregando ? <Loader2 className="size-4 animate-spin" /> : null} Analisar novamente
          </Button>
          <Button variant="outline" onClick={pedirSalvar} disabled={salvando || salvo}>
            {salvando ? <Loader2 className="size-4 animate-spin" /> : null}
            {salvo ? "Análise salva" : "Salvar análise"}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Voltar sem salvar
          </Button>
        </>
      ) : null}

      {etapa === "revisao" ? (
        <>
          <Button
            onClick={() => {
              if (!interpretado) return;
              if (acaoPosRevisao === "otimizar") void gerarOtimizada(interpretado);
              else void abrirVersaoAdaptada(interpretado);
            }}
            disabled={processando}
          >
            {processando ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirmar dados e continuar
          </Button>
          <Button variant="outline" onClick={() => setEtapa("resultado")} disabled={processando}>
            <ArrowLeft className="size-4" /> Voltar
          </Button>
        </>
      ) : null}

      {etapa === "otimizar" ? (
        <>
          <Button onClick={() => void aplicarAceitas()} disabled={processando}>
            {processando ? <Loader2 className="size-4 animate-spin" /> : null}
            Abrir versão para esta vaga
          </Button>
          <Button variant="outline" onClick={() => setEtapa("resultado")} disabled={processando}>
            <ArrowLeft className="size-4" /> Voltar ao resultado
          </Button>
        </>
      ) : null}
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={(aberto) => (aberto ? onOpenChange(true) : fecharComConfirmacao())}>
        <DialogContent
          className="flex h-dvh max-h-dvh w-screen max-w-none flex-col gap-0 rounded-none p-0 sm:h-auto sm:max-h-[92dvh] sm:w-full sm:max-w-3xl sm:rounded-xl"
        >
          {cabecalho}

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {erro ? (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Não foi possível continuar</AlertTitle>
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            ) : null}

            {carregando && etapa === "preferencias" ? (
              <p className="mb-3 text-sm text-muted-foreground" role="status">
                Comparando seu currículo com a vaga. Isso leva alguns segundos.
              </p>
            ) : null}

            {etapa === "vaga" ? passoVaga : null}
            {etapa === "curriculo" ? passoCurriculo : null}
            {etapa === "preferencias" ? passoPreferencias : null}
            {etapa === "resultado" ? passoResultado : null}
            {etapa === "revisao" ? passoRevisao : null}
            {etapa === "otimizar" && otimizacao ? (
              <OptimizationPanel
                result={otimizacao}
                decisions={decisoes}
                onAccept={(index, texto) =>
                  setDecisoes((atual) => ({ ...atual, [index]: { decision: "aceita", texto } }))
                }
                onReject={(index) =>
                  setDecisoes((atual) => ({ ...atual, [index]: { decision: "recusada", texto: "" } }))
                }
              />
            ) : null}

            {processando && etapa !== "otimizar" ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground" role="status">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Preparando as informações…
              </p>
            ) : null}
          </div>

          {rodape}
        </DialogContent>
      </Dialog>

      <AuthDialog
        open={authAberto}
        action="salvar"
        onOpenChange={(aberto) => {
          if (!aberto) {
            setAuthAberto(false);
            setAguardandoLogin(false);
          }
        }}
        onAuthenticated={() => setAuthAberto(false)}
      />

      <AlertDialog open={cancelar} onOpenChange={setCancelar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar a análise?</AlertDialogTitle>
            <AlertDialogDescription>
              Você pode fechar mantendo os dados preenchidos para continuar depois, ou descartar tudo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar preenchendo</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                setCancelar(false);
                onOpenChange(false);
              }}
            >
              Fechar e manter os dados
            </Button>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                clearLocalFlow();
                setJob({ jobTitle: "", company: "", jobDescription: "" });
                setPastedText("");
                setResultado(null);
                setCancelar(false);
                onOpenChange(false);
              }}
            >
              Descartar dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {salvo ? <Badge className="sr-only">Análise salva</Badge> : null}
    </>
  );
}
