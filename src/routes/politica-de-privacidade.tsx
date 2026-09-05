import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Currículo ATS" },
      {
        name: "description",
        content: "Como tratamos seus dados no Currículo ATS: rascunho local, dados da conta e exclusão.",
      },
      { property: "og:title", content: "Política de Privacidade — Currículo ATS" },
      { property: "og:description", content: "Transparência sobre o uso dos seus dados." },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl space-y-5">
        <h1 className="font-display text-3xl font-bold">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground">Última atualização: janeiro de 2026.</p>

        <h2 className="text-xl font-semibold">Dados que tratamos</h2>
        <p className="text-sm text-muted-foreground">
          Sem conta: o conteúdo do currículo fica apenas no armazenamento local do seu navegador, neste
          dispositivo. Com conta: guardamos nome, e-mail e os currículos que você optar por salvar.
        </p>

        <h2 className="text-xl font-semibold">Senhas</h2>
        <p className="text-sm text-muted-foreground">
          Senhas nunca são exibidas nem armazenadas em texto puro e nunca ficam no armazenamento local do
          navegador. A autenticação é feita por um serviço que guarda apenas a versão criptografada.
        </p>

        <h2 className="text-xl font-semibold">Quem pode ver seus currículos</h2>
        <p className="text-sm text-muted-foreground">
          Somente você. As regras de acesso do banco de dados impedem que uma conta leia, altere ou exclua
          currículos de outra pessoa.
        </p>

        <h2 className="text-xl font-semibold">Dados que não pedimos</h2>
        <p className="text-sm text-muted-foreground">
          Não pedimos foto, CPF, RG, estado civil, idade, gênero ou endereço completo — nem no cadastro, nem
          no currículo.
        </p>

        <h2 className="text-xl font-semibold">Exclusão</h2>
        <p className="text-sm text-muted-foreground">
          Você pode excluir a conta na página de perfil. Isso remove o perfil e todos os currículos salvos.
          Para apagar o rascunho local, use “Apagar rascunho” no editor.
        </p>

        <h2 className="text-xl font-semibold">Contato</h2>
        <p className="text-sm text-muted-foreground">
          Pedidos relacionados a dados pessoais: contato@curriculoats.app.
        </p>
      </article>
    </PageShell>
  );
}
