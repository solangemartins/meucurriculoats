import { Check } from "lucide-react";

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  /** Índice da etapa atual, começando em 0. */
  current: number;
}) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-3" aria-label="Etapas da análise">
      {steps.map((label, index) => {
        const concluida = index < current;
        const atual = index === current;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              aria-current={atual ? "step" : undefined}
              className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                concluida
                  ? "border-primary bg-primary text-primary-foreground"
                  : atual
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
              }`}
            >
              {concluida ? <Check className="size-4" aria-hidden="true" /> : index + 1}
            </span>
            <span
              className={`truncate text-xs sm:text-sm ${
                atual ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
              <span className="sr-only">
                {concluida ? " (etapa concluída)" : atual ? " (etapa atual)" : ""}
              </span>
            </span>
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={`hidden h-px flex-1 sm:block ${concluida ? "bg-primary" : "bg-border"}`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
