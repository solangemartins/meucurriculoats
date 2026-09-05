import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { SignUpForm } from "@/components/auth/AuthForms";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/criar-conta")({
  head: () => ({
    meta: [
      { title: "Criar conta — Currículo ATS" },
      {
        name: "description",
        content: "Crie sua conta com nome, e-mail e senha para salvar e exportar seus currículos.",
      },
      { property: "og:title", content: "Criar conta — Currículo ATS" },
      { property: "og:description", content: "Cadastro rápido, sem confirmação de e-mail." },
    ],
  }),
  component: CriarConta,
});

function CriarConta() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/meus-curriculos", replace: true });
  }, [navigate, user]);

  return (
    <PageShell>
      <div className="mx-auto max-w-md">
        <h1 className="sr-only">Currículo ATS</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Criar conta</CardTitle>
            <CardDescription>
              Pedimos apenas nome, e-mail e senha. Você entra na hora, sem confirmar e-mail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SignUpForm onSuccess={() => navigate({ to: "/meus-curriculos" })} />
            <p className="text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link to="/entrar" className="font-medium text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
