import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border surface-soft">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} Currículo ATS. Todos os direitos reservados.
        </p>
        <nav aria-label="Links do rodapé" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/termos-de-uso" className="font-medium text-primary hover:underline">
            Termos de Uso
          </Link>
          <Link to="/politica-de-privacidade" className="font-medium text-primary hover:underline">
            Política de Privacidade
          </Link>
          <a href="mailto:contato@curriculoats.app" className="font-medium text-primary hover:underline">
            Contato
          </a>
        </nav>
      </div>
    </footer>
  );
}
