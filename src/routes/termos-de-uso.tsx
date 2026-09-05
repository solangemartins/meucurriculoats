import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";

export const Route = createFileRoute("/termos-de-uso")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Currículo ATS" },
      {
        name: "description",
        content: "Regras de uso do Currículo ATS: responsabilidades, conteúdo do usuário e limites do serviço.",
      },
      { property: "og:title", content: "Termos de Uso — Currículo ATS" },
      { property: "og:description", content: "Condições de uso da plataforma Currículo ATS." },
    ],
  }),
  component: Termos,
});

function Termos() {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl space-y-5">
        <h1 className="font-display text-3xl font-bold">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground">Última atualização: janeiro de 2026.</p>

        <h2 className="text-xl font-semibold">1. Sobre o serviço</h2>
        <p className="text-sm text-muted-foreground">
          O Currículo ATS é uma ferramenta gratuita para montar, editar, visualizar e exportar currículos em
          formato compatível com sistemas de triagem. O uso do editor não exige cadastro.
        </p>

        <h2 className="text-xl font-semibold">2. Conteúdo que você escreve</h2>
        <p className="text-sm text-muted-foreground">
          Todo o conteúdo do currículo é de sua responsabilidade. Você declara que as informações são
          verdadeiras. Não criamos, inventamos nem alteramos experiências ou qualificações.
        </p>

        <h2 className="text-xl font-semibold">3. Conta</h2>
        <p className="text-sm text-muted-foreground">
          A conta é pessoal. Mantenha sua senha em segurança e avise-nos se suspeitar de acesso indevido. Você
          pode excluir sua conta a qualquer momento na página de perfil; os currículos salvos também são
          removidos.
        </p>

        <h2 className="text-xl font-semibold">4. Limites</h2>
        <p className="text-sm text-muted-foreground">
          A ferramenta ajuda a organizar seu currículo, mas não garante entrevistas, aprovação em processos
          seletivos ou contratação. O indicador de qualidade é apenas orientativo.
        </p>

        <h2 className="text-xl font-semibold">5. Disponibilidade</h2>
        <p className="text-sm text-muted-foreground">
          Podemos ajustar, suspender ou encerrar recursos para manutenção e melhorias. Se houver falha de
          conexão durante a edição, o rascunho permanece salvo no seu navegador.
        </p>

        <h2 className="text-xl font-semibold">6. Contato</h2>
        <p className="text-sm text-muted-foreground">
          Dúvidas sobre estes termos: contato@curriculoats.app.
        </p>
      </article>
    </PageShell>
  );
}
