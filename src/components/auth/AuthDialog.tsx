import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm, SignUpForm } from "@/components/auth/AuthForms";
import type { PendingAction } from "@/lib/resume/draft";

export function AuthDialog({
  open,
  onOpenChange,
  action,
  onAuthenticated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: PendingAction;
  onAuthenticated: () => void;
}) {
  const titulo =
    action === "salvar" ? "Entre para salvar seu currículo" : "Seu currículo está pronto para ser exportado";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            Tudo o que você preencheu continua salvo neste dispositivo. Depois de entrar,{" "}
            {action === "salvar" ? "salvamos o currículo na sua conta" : "geramos o PDF"} automaticamente.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="criar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="criar">Criar conta</TabsTrigger>
            <TabsTrigger value="entrar">Entrar</TabsTrigger>
          </TabsList>
          <TabsContent value="criar" className="pt-4">
            <SignUpForm onSuccess={onAuthenticated} />
          </TabsContent>
          <TabsContent value="entrar" className="pt-4">
            <SignInForm onSuccess={onAuthenticated} showLinks={false} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
