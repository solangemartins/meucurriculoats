import { Check, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { REWRITE_LABEL, type OptimizationProposal, type OptimizationResult } from "@/lib/analysis/types";

export type ProposalDecision = "pendente" | "aceita" | "recusada";

function ProposalCard({
  proposta,
  decision,
  onAccept,
  onReject,
}: {
  proposta: OptimizationProposal;
  decision: ProposalDecision;
  onAccept: (texto: string) => void;
  onReject: () => void;
}) {
  const [texto, setTexto] = useState(proposta.textoSugerido);

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{REWRITE_LABEL[proposta.alvo]}</Badge>
        {proposta.alvoRotulo ? (
          <span className="text-sm font-medium">{proposta.alvoRotulo}</span>
        ) : null}
        {decision === "aceita" ? <Badge>Aceita</Badge> : null}
        {decision === "recusada" ? <Badge variant="outline">Recusada</Badge> : null}
      </div>

      {proposta.textoAtual ? (
        <p className="mb-2 text-xs text-muted-foreground">
          <span className="font-medium">Texto atual:</span> {proposta.textoAtual}
        </p>
      ) : null}

      <Textarea
        className="min-h-28"
        value={texto}
        aria-label={`Texto sugerido para ${proposta.alvoRotulo || REWRITE_LABEL[proposta.alvo]}`}
        onChange={(event) => setTexto(event.target.value)}
      />

      {proposta.observacao ? (
        <p className="mt-2 text-xs text-muted-foreground">{proposta.observacao}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onAccept(texto)} disabled={!texto.trim()}>
          <Check className="size-4" /> {decision === "aceita" ? "Atualizar aceite" : "Aceitar sugestão"}
        </Button>
        <Button size="sm" variant="outline" onClick={onReject}>
          <X className="size-4" /> Recusar
        </Button>
      </div>
    </div>
  );
}

export function OptimizationPanel({
  result,
  decisions,
  onAccept,
  onReject,
}: {
  result: OptimizationResult;
  decisions: Record<number, { decision: ProposalDecision; texto: string }>;
  onAccept: (index: number, texto: string) => void;
  onReject: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertTitle className="flex items-center gap-2">
          <Sparkles className="size-4" aria-hidden="true" /> Nada é aplicado automaticamente
        </AlertTitle>
        <AlertDescription>
          As sugestões usam apenas informações que já estão no seu currículo. Revise, edite se quiser e
          aceite uma por uma.
        </AlertDescription>
      </Alert>

      {result.resumoDasMudancas ? (
        <p className="text-sm text-muted-foreground">{result.resumoDasMudancas}</p>
      ) : null}

      {result.propostas.length ? (
        <div className="space-y-3">
          <h3 className="font-display text-base font-semibold">Textos sugeridos</h3>
          {result.propostas.map((proposta, index) => (
            <ProposalCard
              key={`${proposta.alvo}-${proposta.alvoId}-${index}`}
              proposta={proposta}
              decision={decisions[index]?.decision ?? "pendente"}
              onAccept={(texto) => onAccept(index, texto)}
              onReject={() => onReject(index)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Não encontramos trechos para reescrever com as informações disponíveis.
        </p>
      )}

      {result.perguntas.length ? (
        <div className="space-y-2">
          <h3 className="font-display text-base font-semibold">Perguntas antes de finalizar</h3>
          <p className="text-xs text-muted-foreground">
            Nada disso foi incluído no currículo. Adicione você mesmo apenas o que for verdadeiro.
          </p>
          <ul className="space-y-2">
            {result.perguntas.map((q) => (
              <li key={q.pergunta} className="rounded-lg border border-border p-3 text-sm">
                <p className="font-medium">{q.pergunta}</p>
                {q.motivo ? <p className="mt-1 text-xs text-muted-foreground">{q.motivo}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
