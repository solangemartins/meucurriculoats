import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { SignInForm } from "@/components/auth/AuthForms";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Currículo ATS" },
      {
        name: "description",
        content: "Acesse sua conta para salvar, editar e exportar seus currículos compatíveis com ATS.",
      },
      { property: "og:title", content: "Entrar — Currículo ATS" },
      { property: "og:description", content: "Acesse sua conta do Currículo ATS." },
    ],
  }),
  component: Entrar,
});

function Entrar() {
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
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>
              Use o e-mail e a senha da sua conta. Não é necessário confirmar e-mail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SignInForm onSuccess={() => navigate({ to: "/meus-curriculos" })} />
            <p className="text-sm text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link to="/criar-conta" className="font-medium text-primary hover:underline">
                Criar uma conta
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Quer apenas testar?{" "}
              <Link to="/criar-curriculo" className="font-medium text-primary hover:underline">
                Monte um currículo sem cadastro
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
