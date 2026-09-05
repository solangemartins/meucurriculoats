import { useNavigate } from "@tanstack/react-router";
import { CloudOff, Download, Eye, FileDown, Loader2, PencilLine, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AuthDialog } from "@/components/auth/AuthDialog";
import {
  AdditionalSection,
  CertificationsSection,
  EducationSection,
  ExperienceSection,
  LanguagesSection,
  ObjectiveSection,
  PersonalSection,
  ProjectsSection,
  SkillsSection,
} from "@/components/resume/EditorSections";
import { QualityPanel } from "@/components/resume/QualityPanel";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { TemplatePicker } from "@/components/resume/TemplatePicker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { createResume, updateResume } from "@/lib/resume/api";
import {
  clearDraft,
  getPendingAction,
  saveDraft,
  setDraftResumeId,
  setPendingAction,
  type PendingAction,
} from "@/lib/resume/draft";
import { exportResumePdf } from "@/lib/resume/pdf";
import { qualityScore } from "@/lib/resume/quality";
import type { ResumeData } from "@/lib/resume/types";

type SaveState = "novo" | "pendente" | "salvando" | "salvo" | "erro";

const SECTIONS = [
  { id: "pessoais", label: "Informações pessoais" },
  { id: "objetivo", label: "Objetivo profissional" },
  { id: "experiencia", label: "Experiência profissional" },
  { id: "formacao", label: "Formação acadêmica" },
  { id: "habilidades", label: "Habilidades" },
  { id: "cursos", label: "Cursos e certificações" },
  { id: "idiomas", label: "Idiomas" },
  { id: "projetos", label: "Projetos" },
  { id: "adicionais", label: "Informações adicionais" },
] as const;

export function ResumeEditor({
  initialData,
  resumeId: initialResumeId,
  keepLocalDraft,
}: {
  initialData: ResumeData;
  resumeId: string | null;
  /** Rascunho do visitante (ou currículo iniciado sem conta) fica salvo no navegador. */
  keepLocalDraft: boolean;
}) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<ResumeData>(initialData);
  const [resumeId, setResumeId] = useState<string | null>(initialResumeId);
  const [saveState, setSaveState] = useState<SaveState>(initialResumeId ? "salvo" : "novo");
  const [rascunhoSalvo, setRascunhoSalvo] = useState(false);
  const [authDialog, setAuthDialog] = useState<PendingAction | null>(null);
  const [avisoExport, setAvisoExport] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [salvandoManual, setSalvandoManual] = useState(false);
  const [erroConexao, setErroConexao] = useState(false);
  const [abaMobile, setAbaMobile] = useState("editar");

  const dataRef = useRef(data);
  dataRef.current = data;
  const acaoPendenteRef = useRef(false);

  const update = useCallback((updater: (draft: ResumeData) => void) => {
    setData((atual) => {
      const copia = structuredClone(atual);
      updater(copia);
      return copia;
    });
    setSaveState((estado) => (estado === "novo" ? "novo" : "pendente"));
  }, []);

  const quality = useMemo(() => qualityScore(data), [data]);

  // Rascunho local (nunca guarda senha)
  useEffect(() => {
    if (!keepLocalDraft) return;
    const timer = window.setTimeout(() => {
      saveDraft(data);
      setRascunhoSalvo(true);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [data, keepLocalDraft]);

  const persistir = useCallback(
    async (payload: ResumeData): Promise<string | null> => {
      if (!user) return null;
      setSaveState("salvando");
      try {
        if (resumeId) {
          await updateResume(resumeId, payload);
        } else {
          const row = await createResume(payload, user.id);
          setResumeId(row.id);
          setDraftResumeId(row.id);
          window.history.replaceState(null, "", `/editar-curriculo/${row.id}`);
        }
        setSaveState("salvo");
        setErroConexao(false);
        return resumeId ?? null;
      } catch {
        setSaveState("erro");
        setErroConexao(true);
        saveDraft(payload);
        throw new Error("falha-ao-salvar");
      }
    },
    [resumeId, user],
  );

  // Salvamento automático com debounce quando já existe registro na conta
  useEffect(() => {
    if (!user || !resumeId || saveState !== "pendente") return;
    const timer = window.setTimeout(() => {
      void persistir(dataRef.current).catch(() => {
        toast.error("Não foi possível salvar agora. Seu conteúdo continua protegido neste dispositivo.");
      });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [data, persistir, resumeId, saveState, user]);

  const salvarNaConta = useCallback(async () => {
    if (!user) {
      setPendingAction("salvar");
      setAuthDialog("salvar");
      return;
    }
    setSalvandoManual(true);
    try {
      await persistir(dataRef.current);
      toast.success("Currículo salvo com sucesso.");
    } catch {
      toast.error("Não foi possível salvar agora. Seu conteúdo continua protegido neste dispositivo.");
    } finally {
      setSalvandoManual(false);
    }
  }, [persistir, user]);

  const gerarPdf = useCallback(async () => {
    setExportando(true);
    try {
      exportResumePdf(dataRef.current);
      toast.success("PDF gerado com sucesso.");
      if (user) {
        try {
          await persistir(dataRef.current);
        } catch {
          toast.warning("O PDF foi gerado, mas não conseguimos salvar a versão atual na sua conta.");
        }
      }
    } catch {
      toast.error("Não foi possível gerar o PDF agora. Tente novamente.");
    } finally {
      setExportando(false);
    }
  }, [persistir, user]);

  const exportar = useCallback(async () => {
    if (!user) {
      setPendingAction("exportar");
      setAuthDialog("exportar");
      return;
    }
    if (quality.missingEssentials.length > 0) {
      setAvisoExport(true);
      return;
    }
    await gerarPdf();
  }, [gerarPdf, quality.missingEssentials.length, user]);

  // Retoma a ação pendente logo após entrar ou criar a conta
  useEffect(() => {
    if (loading || !user || acaoPendenteRef.current) return;
    const pendente = getPendingAction();
    if (!pendente) return;
    acaoPendenteRef.current = true;
    setPendingAction(null);
    setAuthDialog(null);
    void (async () => {
      if (pendente === "salvar") {
        await salvarNaConta();
      } else {
        if (quality.missingEssentials.length > 0) setAvisoExport(true);
        else await gerarPdf();
      }
    })();
  }, [gerarPdf, loading, quality.missingEssentials.length, salvarNaConta, user]);

  const statusTexto: Record<SaveState, string> = {
    novo: keepLocalDraft ? "Rascunho salvo neste dispositivo" : "Ainda não salvo",
    pendente: user && resumeId ? "Alterações pendentes" : "Rascunho salvo neste dispositivo",
    salvando: "Salvando…",
    salvo: "Salvo na sua conta",
    erro: "Não foi possível salvar",
  };

  const formulario = (
    <div className="space-y-5">
      <div className="card-elevated space-y-4 p-4">
        <div className="space-y-1.5">
          <Label htmlFor="titulo-curriculo">Nome deste currículo</Label>
          <Input
            id="titulo-curriculo"
            value={data.title}
            onChange={(event) => update((d) => void (d.title = event.target.value))}
            placeholder="Currículo — Analista de Marketing"
          />
          <p className="text-xs text-muted-foreground">
            Serve apenas para você se organizar. Não aparece no currículo.
          </p>
        </div>
        <TemplatePicker value={data.template} onChange={(tpl) => update((d) => void (d.template = tpl))} />
      </div>

      <Accordion type="multiple" defaultValue={["pessoais", "experiencia"]} className="space-y-3">
        {SECTIONS.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="card-elevated border px-4 last:border-b"
          >
            <AccordionTrigger className="text-left font-display text-base font-semibold hover:no-underline">
              {section.label}
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4">
              {section.id === "pessoais" ? <PersonalSection data={data} update={update} /> : null}
              {section.id === "objetivo" ? <ObjectiveSection data={data} update={update} /> : null}
              {section.id === "experiencia" ? <ExperienceSection data={data} update={update} /> : null}
              {section.id === "formacao" ? <EducationSection data={data} update={update} /> : null}
              {section.id === "habilidades" ? <SkillsSection data={data} update={update} /> : null}
              {section.id === "cursos" ? <CertificationsSection data={data} update={update} /> : null}
              {section.id === "idiomas" ? <LanguagesSection data={data} update={update} /> : null}
              {section.id === "projetos" ? <ProjectsSection data={data} update={update} /> : null}
              {section.id === "adicionais" ? <AdditionalSection data={data} update={update} /> : null}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <QualityPanel data={data} />
    </div>
  );

  const previa = (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-paper)]">
        <ResumePreview data={data} />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Pré-visualização em uma coluna, igual ao arquivo que será exportado.
      </p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-border surface-soft p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Editor de currículo</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            {saveState === "salvando" ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            {saveState === "erro" ? <CloudOff className="size-3.5 text-destructive" aria-hidden="true" /> : null}
            {statusTexto[saveState]}
            <span className="text-border">•</span>
            <span>{quality.score}% preenchido</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={salvarNaConta} disabled={salvandoManual}>
            {salvandoManual ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Salvar na minha conta
          </Button>
          <Button onClick={exportar} disabled={exportando}>
            {exportando ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
            Exportar em PDF
          </Button>
        </div>
      </div>

      {erroConexao ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível salvar agora</AlertTitle>
          <AlertDescription>
            Seu conteúdo continua protegido neste dispositivo. Verifique a conexão e toque em “Salvar na
            minha conta” novamente.
          </AlertDescription>
        </Alert>
      ) : null}

      {!user && rascunhoSalvo ? (
        <p className="text-xs text-muted-foreground">
          Seu rascunho foi salvo neste dispositivo. Você só precisa de uma conta para salvar na nuvem ou
          exportar em PDF.
        </p>
      ) : null}

      {/* Celular: alterna entre editar e visualizar */}
      <div className="lg:hidden">
        <Tabs value={abaMobile} onValueChange={setAbaMobile}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editar">
              <PencilLine className="size-4" aria-hidden="true" /> Editar
            </TabsTrigger>
            <TabsTrigger value="visualizar">
              <Eye className="size-4" aria-hidden="true" /> Visualizar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="editar" className="pt-4">
            {formulario}
          </TabsContent>
          <TabsContent value="visualizar" className="pt-4">
            {previa}
          </TabsContent>
        </Tabs>
      </div>

      {/* Computador: formulário + pré-visualização fixa */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div>{formulario}</div>
        <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
          {previa}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button variant="ghost" onClick={() => navigate({ to: "/visualizar-curriculo" })}>
          <Eye className="size-4" /> Abrir visualização completa
        </Button>
        {user ? (
          <Button variant="ghost" onClick={() => navigate({ to: "/meus-curriculos" })}>
            Ir para meus currículos
          </Button>
        ) : null}
        {keepLocalDraft ? (
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              clearDraft();
              toast.success("Rascunho apagado deste dispositivo.");
              navigate({ to: "/" });
            }}
          >
            Apagar rascunho
          </Button>
        ) : null}
      </div>

      <AuthDialog
        open={authDialog !== null}
        action={authDialog ?? "salvar"}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setPendingAction(null);
            setAuthDialog(null);
          }
        }}
        onAuthenticated={() => {
          acaoPendenteRef.current = false;
          setAuthDialog(null);
        }}
      />

      <AlertDialog open={avisoExport} onOpenChange={setAvisoExport}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Algumas informações essenciais estão faltando</AlertDialogTitle>
            <AlertDialogDescription>
              Você pode voltar e corrigir ou exportar assim mesmo. Faltam:{" "}
              {quality.missingEssentials.map((c) => c.label.toLowerCase()).join("; ")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar e corrigir</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setAvisoExport(false);
                void gerarPdf();
              }}
            >
              <Download className="size-4" /> Exportar assim mesmo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
