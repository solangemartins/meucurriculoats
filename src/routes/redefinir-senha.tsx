import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PageShell } from "@/components/layout/PageShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Criar nova senha — Currículo ATS" },
      { name: "description", content: "Defina e confirme sua nova senha para voltar a acessar sua conta." },
      { property: "og:title", content: "Criar nova senha — Currículo ATS" },
      { property: "og:description", content: "Defina uma nova senha com segurança." },
    ],
  }),
  component: RedefinirSenha,
});

const schema = z
  .object({
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    confirm: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "As senhas não são iguais.",
  });

function RedefinirSenha() {
  const navigate = useNavigate();
  const [linkValido, setLinkValido] = useState<boolean | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  useEffect(() => {
    const hash = window.location.hash;
    const recovery = hash.includes("type=recovery");
    const erroNoLink = hash.includes("error");

    if (erroNoLink) {
      setLinkValido(false);
      return;
    }

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setLinkValido(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setLinkValido(Boolean(session) || recovery);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const onSubmit = async ({ password }: z.infer<typeof schema>) => {
    setErro(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErro("Não foi possível alterar a senha. O link pode ter expirado — peça um novo.");
      return;
    }
    setConcluido(true);
    toast.success("Senha alterada com sucesso.");
    await supabase.auth.signOut();
    window.setTimeout(() => navigate({ to: "/entrar" }), 1200);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Criar nova senha</CardTitle>
            <CardDescription>Escolha uma senha com pelo menos 8 caracteres.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {linkValido === false ? (
              <Alert variant="destructive">
                <AlertTitle>Link inválido ou expirado</AlertTitle>
                <AlertDescription>
                  Solicite um novo link em “Esqueci minha senha” para continuar.
                </AlertDescription>
              </Alert>
            ) : null}

            {concluido ? (
              <Alert>
                <AlertTitle>Senha alterada</AlertTitle>
                <AlertDescription>Estamos levando você para a tela de login…</AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {erro ? (
                  <Alert variant="destructive">
                    <AlertDescription>{erro}</AlertDescription>
                  </Alert>
                ) : null}
                <div className="space-y-1.5">
                  <Label htmlFor="nova-senha">Nova senha</Label>
                  <Input
                    id="nova-senha"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(form.formState.errors.password)}
                    {...form.register("password")}
                  />
                  {form.formState.errors.password ? (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmar-nova-senha">Confirmar nova senha</Label>
                  <Input
                    id="confirmar-nova-senha"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(form.formState.errors.confirm)}
                    {...form.register("confirm")}
                  />
                  {form.formState.errors.confirm ? (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {form.formState.errors.confirm.message}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting || linkValido === false}
                >
                  {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  Salvar nova senha
                </Button>
              </form>
            )}

            <p className="text-sm text-muted-foreground">
              <Link to="/esqueci-minha-senha" className="font-medium text-primary hover:underline">
                Pedir um novo link
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
