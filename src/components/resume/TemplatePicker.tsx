import { Check } from "lucide-react";

import { TEMPLATES, type TemplateId } from "@/lib/resume/types";

export function TemplatePicker({
  value,
  onChange,
}: {
  value: TemplateId;
  onChange: (value: TemplateId) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Modelo do currículo</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {TEMPLATES.map((tpl) => {
          const ativo = tpl.id === value;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onChange(tpl.id)}
              aria-pressed={ativo}
              className={`rounded-xl border p-3 text-left transition-colors ${
                ativo
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card hover:border-primary/60 hover:bg-muted"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm">{tpl.nome}</span>
                {ativo ? <Check className="size-4 text-primary" aria-hidden="true" /> : null}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">{tpl.descricao}</span>
              {ativo ? <span className="sr-only">Modelo selecionado</span> : null}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Todos os modelos usam uma única coluna, texto real e títulos padronizados — o formato lido
        corretamente por sistemas de triagem.
      </p>
    </fieldset>
  );
}
