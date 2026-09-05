import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const REMEMBER_KEY = "curriculo-ats:lembrar";

const signInSchema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
  remember: z.boolean().optional(),
});

const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome.").max(120, "Nome muito longo."),
    email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido."),
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    confirm: z.string().min(1, "Confirme a senha."),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "As senhas não são iguais.",
  });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

function PasswordField({
  id,
  label,
  autoComplete,
  error,
  hint,
  ...rest
}: {
  id: string;
  label: string;
  autoComplete: string;
  error?: string;
  hint?: string;
} & React.ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-erro` : hint ? `${id}-dica` : undefined}
          className="pr-11"
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hint && !error ? (
        <p id={`${id}-dica`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-erro`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function mensagemErro(raw: string) {
  const texto = raw.toLowerCase();
  if (texto.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (texto.includes("already registered") || texto.includes("already been registered"))
    return "Este e-mail já possui uma conta. Use a aba “Entrar”.";
  if (texto.includes("password")) return "Senha inválida. Use pelo menos 8 caracteres.";
  if (texto.includes("network") || texto.includes("fetch"))
    return "Sem conexão agora. Tente novamente em instantes.";
  return "Não foi possível concluir agora. Tente novamente.";
}

export function SignInForm({
  onSuccess,
  showLinks = true,
}: {
  onSuccess?: () => void;
  showLinks?: boolean;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: SignInValues) => {
    setErro(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setErro(mensagemErro(error.message));
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(REMEMBER_KEY, values.remember ? "1" : "0");
    }
    toast.success("Você entrou na sua conta.");
    onSuccess?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {erro ? (
        <Alert variant="destructive">
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="entrar-email">E-mail</Label>
        <Input
          id="entrar-email"
          type="email"
          autoComplete="email"
          placeholder="seu.nome@email.com"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <PasswordField
        id="entrar-senha"
        label="Senha"
        autoComplete="current-password"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="lembrar"
            checked={form.watch("remember")}
            onCheckedChange={(checked) => form.setValue("remember", checked === true)}
          />
          <Label htmlFor="lembrar" className="text-sm font-normal">
            Lembrar de mim
          </Label>
        </div>
        {showLinks ? (
          <Link to="/esqueci-minha-senha" className="text-sm font-medium text-primary hover:underline">
            Esqueci minha senha
          </Link>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Entrar
      </Button>
    </form>
  );
}

export function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const [erro, setErro] = useState<string | null>(null);
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = async (values: SignUpValues) => {
    setErro(null);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name },
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) {
      setErro(mensagemErro(error.message));
      return;
    }
    if (!data.session) {
      // Fallback: se a sessão não vier junto, entramos com as mesmas credenciais.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (signInError) {
        setErro("Conta criada, mas não foi possível entrar automaticamente. Use a aba “Entrar”.");
        return;
      }
    }
    toast.success("Conta criada. Bem-vindo(a)!");
    onSuccess?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {erro ? (
        <Alert variant="destructive">
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="criar-nome">Nome</Label>
        <Input
          id="criar-nome"
          autoComplete="name"
          placeholder="Como você quer ser chamado(a)"
          aria-invalid={Boolean(form.formState.errors.name)}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="criar-email">E-mail</Label>
        <Input
          id="criar-email"
          type="email"
          autoComplete="email"
          placeholder="seu.nome@email.com"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <PasswordField
        id="criar-senha"
        label="Senha"
        autoComplete="new-password"
        hint="Use no mínimo 8 caracteres."
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />

      <PasswordField
        id="criar-confirmar"
        label="Confirmar senha"
        autoComplete="new-password"
        error={form.formState.errors.confirm?.message}
        {...form.register("confirm")}
      />

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Criar minha conta
      </Button>
      <p className="text-xs text-muted-foreground">
        Não pedimos telefone, CPF nem confirmação de e-mail. Você entra na hora.
      </p>
    </form>
  );
}
