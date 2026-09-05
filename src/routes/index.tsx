import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  FileDown,
  ListChecks,
  PencilLine,
  Save,
  ScanSearch,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meu Currículo ATS — crie um currículo profissional gratuito" },
      {
        name: "description",
        content:
          "Preencha, edite e visualize seu currículo compatível com sistemas ATS sem cadastro. Crie a conta só para salvar ou exportar em PDF.",
      },
      { property: "og:title", content: "Meu Currículo ATS — crie um currículo profissional gratuito" },
      {
        property: "og:description",
        content:
          "Editor gratuito de currículo com pré-visualização em tempo real, modelos compatíveis com ATS e exportação em PDF.",
      },
    ],
  }),
  component: Home,
});

const BENEFICIOS = [
  {
    icon: ScanSearch,
    titulo: "Análise de compatibilidade com a vaga",
    texto:
      "Cole a descrição de uma vaga e receba uma nota de 0 a 100, com pontos fortes, lacunas e sugestões. Sem cadastro.",
  },
  {
    icon: ListChecks,
    titulo: "Estrutura compatível com ATS",
    texto: "Uma coluna, títulos padronizados e texto real: o formato que os sistemas leem sem erro.",
  },
  {
    icon: PencilLine,
    titulo: "Edição fácil",
    texto: "Seções organizadas, campos claros e dicas curtas ao lado de cada informação.",
  },

  {
    icon: Eye,
    titulo: "Visualização em tempo real",
    texto: "Você vê o currículo mudando conforme escreve, igual ao arquivo final.",
  },
  {
    icon: FileDown,
    titulo: "Exportação em PDF",
    texto: "Arquivo A4 com texto selecionável e pesquisável, nunca uma imagem.",
  },
  {
    icon: Save,
    titulo: "Salve e edite depois",
    texto: "Com a conta criada, seus currículos ficam guardados para atualizar quando quiser.",
  },
  {
    icon: CheckCircle2,
    titulo: "Conteúdo bem organizado",
    texto: "Ordem de leitura lógica, datas padronizadas e nenhuma informação escondida.",
  },
];

const PASSOS = [
  {
    numero: "1",
    titulo: "Preencha suas informações",
    texto: "Dados de contato, experiências, formação e habilidades — sem foto, CPF ou dados pessoais demais.",
  },
  {
    numero: "2",
    titulo: "Personalize e revise o currículo",
    texto: "Escolha entre três modelos, reordene experiências e acompanhe o indicador de preenchimento.",
  },
  {
    numero: "3",
    titulo: "Analise seu currículo para uma vaga",
    texto:
      "Cole a descrição da vaga e veja a compatibilidade de 0 a 100, com pontos fortes, lacunas e sugestões — antes de qualquer cadastro.",
  },
  {
    numero: "4",
    titulo: "Entre ou crie uma conta para salvar ou exportar",
    texto:
      "A conta pede apenas nome, e-mail e senha, guarda seus currículos e o histórico das análises. Nada do que você escreveu é perdido.",
  },

];

function ResumeMock() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-sm rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-paper)]"
    >
      <div className="h-3.5 w-40 rounded bg-neutral-800" />
      <div className="mt-2 h-2.5 w-28 rounded bg-primary/70" />
      <div className="mt-1.5 h-2 w-48 rounded bg-neutral-300" />
      <div className="mt-5 h-2 w-32 rounded bg-neutral-700" />
      <div className="mt-1 h-px w-full bg-neutral-300" />
      <div className="mt-2 space-y-1.5">
        <div className="h-2 w-full rounded bg-neutral-200" />
        <div className="h-2 w-11/12 rounded bg-neutral-200" />
        <div className="h-2 w-9/12 rounded bg-neutral-200" />
      </div>
      <div className="mt-5 h-2 w-40 rounded bg-neutral-700" />
      <div className="mt-1 h-px w-full bg-neutral-300" />
      <div className="mt-2 space-y-1.5">
        <div className="h-2 w-2/3 rounded bg-neutral-400" />
        <div className="h-2 w-full rounded bg-neutral-200" />
        <div className="h-2 w-10/12 rounded bg-neutral-200" />
        <div className="h-2 w-7/12 rounded bg-neutral-200" />
      </div>
      <div className="mt-5 h-2 w-24 rounded bg-neutral-700" />
      <div className="mt-1 h-px w-full bg-neutral-300" />
      <div className="mt-2 h-2 w-full rounded bg-neutral-200" />
    </div>
  );
}

function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main id="conteudo" className="flex-1">
        <section className="surface-soft">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
            <div>
              <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                Gratuito e sem cadastro para começar
              </span>
              <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl md:text-[2.75rem]">
                Crie um currículo profissional e preparado para sistemas ATS
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                Preencha, edite e visualize seu currículo inteiro de graça. Você só precisa criar uma conta
                no momento de salvar na nuvem ou exportar em PDF — e nada do que escreveu é perdido.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/criar-curriculo">
                    Criar meu currículo <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/entrar">Já tenho uma conta</Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Seu rascunho fica salvo neste dispositivo enquanto você escreve.
              </p>
            </div>
            <ResumeMock />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold sm:text-3xl">Por que usar o Meu Currículo ATS</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFICIOS.map((item) => (
              <Card key={item.titulo} className="h-full">
                <CardHeader className="pb-2">
                  <item.icon className="size-5 text-primary" aria-hidden="true" />
                  <CardTitle className="text-base">{item.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{item.texto}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="surface-soft">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="text-2xl font-bold sm:text-3xl">Como funciona</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {PASSOS.map((passo) => (
                <li key={passo.numero} className="card-elevated p-5">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {passo.numero}
                  </span>
                  <h3 className="mt-3 text-base font-semibold">{passo.titulo}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{passo.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14">
          <div className="card-elevated p-6 sm:p-8">
            <ScanSearch className="size-6 text-accent" aria-hidden="true" />
            <h2 className="mt-3 text-2xl font-bold">O que é um sistema ATS?</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              ATS é o programa que muitas empresas usam para receber, ler e organizar os currículos de uma
              vaga. Ele transforma o seu arquivo em texto para localizar cargos, empresas, datas e palavras
              importantes. Quando o currículo tem colunas, tabelas, imagens ou enfeites, parte do conteúdo
              pode se perder nessa leitura.
            </p>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Uma estrutura limpa, em uma única coluna e com títulos comuns aumenta a chance de que tudo o
              que você escreveu seja interpretado corretamente. Quem lê depois é sempre uma pessoa — por isso
              o conteúdo continua sendo o mais importante.
            </p>
            <Button asChild className="mt-6">
              <Link to="/criar-curriculo">
                Começar agora <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
