import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageShell } from "@/components/layout/PageShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/esqueci-minha-senha")({
  head: () => ({
    meta: [
      { title: "Esqueci minha senha — Currículo ATS" },
      {
        name: "description",
        content: "Informe seu e-mail para receber um link seguro e criar uma nova senha.",
      },
      { property: "og:title", content: "Esqueci minha senha — Currículo ATS" },
      { property: "og:description", content: "Recupere o acesso à sua conta do Currículo ATS." },
    ],
  }),
  component: EsqueciSenha,
});

const schema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
});

function EsqueciSenha() {
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: z.infer<typeof schema>) => {
    setErro(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) {
      setErro("Não foi possível enviar o link agora. Tente novamente em alguns minutos.");
      return;
    }
    setEnviado(true);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Esqueci minha senha</CardTitle>
            <CardDescription>
              Enviamos um link seguro para o seu e-mail. Ele serve apenas para criar uma nova senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enviado ? (
              <Alert>
                <AlertTitle>Link enviado</AlertTitle>
                <AlertDescription>
                  Verifique sua caixa de entrada e também a pasta de spam. O link expira depois de algum
                  tempo por segurança.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {erro ? (
                  <Alert variant="destructive">
                    <AlertDescription>{erro}</AlertDescription>
                  </Alert>
                ) : null}
                <div className="space-y-1.5">
                  <Label htmlFor="recuperar-email">E-mail</Label>
                  <Input
                    id="recuperar-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={Boolean(form.formState.errors.email)}
                    {...form.register("email")}
                  />
                  {form.formState.errors.email ? (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  Enviar link de redefinição
                </Button>
              </form>
            )}
            <p className="text-sm text-muted-foreground">
              <Link to="/entrar" className="font-medium text-primary hover:underline">
                Voltar para o login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
