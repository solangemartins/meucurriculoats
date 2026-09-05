import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PageShell } from "@/components/layout/PageShell";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";
import { useAuth } from "@/lib/auth-context";
import { getMyProfile, updateMyName } from "@/lib/resume/api";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Currículo ATS" },
      {
        name: "description",
        content: "Atualize seu nome, altere a senha da conta ou exclua seus dados do Currículo ATS.",
      },
      { property: "og:title", content: "Meu perfil — Currículo ATS" },
      { property: "og:description", content: "Gerencie os dados da sua conta." },
    ],
  }),
  component: Perfil,
});

const nomeSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120, "Nome muito longo."),
});

const senhaSchema = z
  .object({
    current: z.string().min(1, "Informe a senha atual."),
    password: z.string().min(8, "A nova senha precisa ter pelo menos 8 caracteres."),
    confirm: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "As senhas não são iguais.",
  });

function Perfil() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const excluirConta = useServerFn(deleteMyAccount);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const { data: perfil, isLoading } = useQuery({
    queryKey: ["perfil", user?.id],
    queryFn: () => getMyProfile(user!.id),
    enabled: Boolean(user),
  });

  const nomeForm = useForm<z.infer<typeof nomeSchema>>({
    resolver: zodResolver(nomeSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (perfil?.name) nomeForm.reset({ name: perfil.name });
  }, [nomeForm, perfil?.name]);

  const senhaForm = useForm<z.infer<typeof senhaSchema>>({
    resolver: zodResolver(senhaSchema),
    defaultValues: { current: "", password: "", confirm: "" },
  });

  const salvarNome = useMutation({
    mutationFn: ({ name }: z.infer<typeof nomeSchema>) => updateMyName(user!.id, name),
    onSuccess: async () => {
      toast.success("Nome atualizado.");
      await queryClient.invalidateQueries({ queryKey: ["perfil", user?.id] });
    },
    onError: () => toast.error("Não foi possível salvar seu nome agora."),
  });

  const alterarSenha = async (valores: z.infer<typeof senhaSchema>) => {
    const { error } = await supabase.auth.updateUser({
      password: valores.password,
      current_password: valores.current,
    });
    if (error) {
      toast.error(
        error.message.toLowerCase().includes("current")
          ? "A senha atual não está correta."
          : "Não foi possível alterar a senha agora.",
      );
      return;
    }
    senhaForm.reset();
    toast.success("Senha alterada com sucesso.");
  };

  const excluir = useMutation({
    mutationFn: () => excluirConta({ data: undefined }),
    onSuccess: async () => {
      toast.success("Conta e dados excluídos.");
      await signOut();
      navigate({ to: "/", replace: true });
    },
    onError: () => toast.error("Não foi possível excluir a conta agora. Tente novamente."),
  });

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Meu perfil</h1>
          <p className="text-sm text-muted-foreground">
            Guardamos apenas nome e e-mail. Nunca pedimos foto, CPF, idade ou estado civil.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados da conta</CardTitle>
            <CardDescription>O e-mail é usado para entrar e recuperar a senha.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="perfil-email">E-mail</Label>
              <Input id="perfil-email" value={user?.email ?? ""} readOnly disabled />
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <form
                onSubmit={nomeForm.handleSubmit((v) => salvarNome.mutate(v))}
                className="space-y-3"
                noValidate
              >
                <div className="space-y-1.5">
                  <Label htmlFor="perfil-nome">Nome</Label>
                  <Input
                    id="perfil-nome"
                    autoComplete="name"
                    aria-invalid={Boolean(nomeForm.formState.errors.name)}
                    {...nomeForm.register("name")}
                  />
                  {nomeForm.formState.errors.name ? (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {nomeForm.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>
                <Button type="submit" disabled={salvarNome.isPending}>
                  {salvarNome.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Salvar nome
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterar senha</CardTitle>
            <CardDescription>Informe a senha atual e escolha uma nova com 8 caracteres ou mais.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={senhaForm.handleSubmit(alterarSenha)} className="space-y-3" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="senha-atual">Senha atual</Label>
                <Input
                  id="senha-atual"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(senhaForm.formState.errors.current)}
                  {...senhaForm.register("current")}
                />
                {senhaForm.formState.errors.current ? (
                  <p role="alert" className="text-xs font-medium text-destructive">
                    {senhaForm.formState.errors.current.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="senha-nova">Nova senha</Label>
                <Input
                  id="senha-nova"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(senhaForm.formState.errors.password)}
                  {...senhaForm.register("password")}
                />
                {senhaForm.formState.errors.password ? (
                  <p role="alert" className="text-xs font-medium text-destructive">
                    {senhaForm.formState.errors.password.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="senha-confirmar">Confirmar nova senha</Label>
                <Input
                  id="senha-confirmar"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(senhaForm.formState.errors.confirm)}
                  {...senhaForm.register("confirm")}
                />
                {senhaForm.formState.errors.confirm ? (
                  <p role="alert" className="text-xs font-medium text-destructive">
                    {senhaForm.formState.errors.confirm.message}
                  </p>
                ) : null}
              </div>
              <Button type="submit" disabled={senhaForm.formState.isSubmitting}>
                {senhaForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                Alterar senha
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Excluir minha conta</CardTitle>
            <CardDescription>
              Remove seu perfil e todos os currículos salvos. Esta ação é permanente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <AlertTitle>Antes de excluir</AlertTitle>
              <AlertDescription>
                Exporte em PDF os currículos que quiser guardar. Depois da exclusão não é possível recuperá-los.
              </AlertDescription>
            </Alert>
            <Button variant="destructive" onClick={() => setConfirmarExclusao(true)}>
              Excluir conta e dados
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmarExclusao} onOpenChange={setConfirmarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sua conta definitivamente?</AlertDialogTitle>
            <AlertDialogDescription>
              Seu perfil e todos os currículos salvos serão apagados. Não é possível desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => excluir.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
