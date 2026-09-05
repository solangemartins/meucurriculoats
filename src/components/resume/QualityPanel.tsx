import { Check, X } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { qualityScore } from "@/lib/resume/quality";
import type { ResumeData } from "@/lib/resume/types";

export function QualityPanel({ data }: { data: ResumeData }) {
  const { checks, score, label } = qualityScore(data);

  return (
    <div className="card-elevated p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-sm font-semibold">Qualidade do preenchimento</h3>
        <span className="text-sm font-semibold text-primary">{score}%</span>
      </div>
      <Progress value={score} className="mt-2" aria-label={`Preenchimento em ${score}%`} />
      <p className="mt-2 text-xs text-muted-foreground">
        {label}. Este indicador é apenas orientativo e não garante aprovação em processos seletivos.
      </p>
      <Separator className="my-3" />
      <ul className="space-y-2">
        {checks.map((check) => (
          <li key={check.id} className="flex gap-2 text-xs">
            <span
              className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
                check.ok ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
              }`}
              aria-hidden="true"
            >
              {check.ok ? <Check className="size-3" /> : <X className="size-3" />}
            </span>
            <span>
              <span className={check.ok ? "text-muted-foreground line-through" : "font-medium"}>
                {check.label}
              </span>
              {!check.ok ? <span className="block text-muted-foreground">{check.hint}</span> : null}
              <span className="sr-only">{check.ok ? "concluído" : "pendente"}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
