import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CircleHelp,
  Info,
  Lightbulb,
  Sparkles,
  Tag,
  Wand2,
} from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  DISCLAIMER,
  GAP_LABEL,
  PRIORITY_LABEL,
  REWRITE_LABEL,
  scoreBand,
  type AnalysisResult,
  type AnalysisRewrite,
  type JobInput,
} from "@/lib/analysis/types";

const GAP_ICON = {
  nao_encontrado: AlertTriangle,
  pouco_demonstrado: CircleHelp,
  diferencial: Info,
} as const;

export function AnalysisResultPanel({
  job,
  result,
  onApplyRewrite,
}: {
  job: JobInput;
  result: AnalysisResult;
  /** Disponível apenas no editor: aplica o texto sugerido no currículo. */
  onApplyRewrite?: (rewrite: AnalysisRewrite, texto: string) => void;
}) {
  const banda = scoreBand(result.overallScore);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-accent" aria-hidden="true" />
            Compatibilidade geral com a vaga
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {job.jobTitle}
            {job.company ? ` — ${job.company}` : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <p className="font-display text-4xl font-bold text-primary">
              {result.overallScore}
              <span className="text-lg text-muted-foreground">/100</span>
            </p>
            <Badge variant="secondary" className="mb-1.5">
              {banda.rotulo}
            </Badge>
          </div>
          <Progress
            value={result.overallScore}
            aria-label={`Compatibilidade de ${result.overallScore} em 100: ${banda.rotulo}`}
          />
          {result.explicacao ? <p className="text-sm">{result.explicacao}</p> : null}
          <p className="text-xs text-muted-foreground">
            Esta nota compara seu currículo com a descrição desta vaga. Ela é diferente do indicador de
            “Qualidade do preenchimento”, que apenas verifica se as seções foram completadas.
          </p>

          {result.criterios.length > 0 ? (
            <>
              <Separator />
              <ul className="space-y-2">
                {result.criterios.map((c) => (
                  <li key={c.nome} className="text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">
                        {c.nome} <span className="text-xs text-muted-foreground">(peso {c.peso}%)</span>
                      </span>
                      <span className="font-semibold text-primary">{c.nota}/100</span>
                    </div>
                    {c.comentario ? (
                      <p className="text-xs text-muted-foreground">{c.comentario}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BadgeCheck className="size-4 text-success" aria-hidden="true" />
              Pontos fortes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.pontosFortes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Não identificamos pontos claramente alinhados a esta vaga. Veja as sugestões abaixo.
              </p>
            ) : (
              <ul className="space-y-3">
                {result.pontosFortes.map((p, i) => (
                  <li key={`${p.titulo}-${i}`} className="text-sm">
                    <p className="font-medium">{p.titulo}</p>
                    <p className="text-muted-foreground">{p.explicacao}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-accent" aria-hidden="true" />
              Lacunas identificadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.lacunas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma lacuna importante foi identificada nesta comparação.
              </p>
            ) : (
              <ul className="space-y-3">
                {result.lacunas.map((l, i) => {
                  const Icone = GAP_ICON[l.tipo];
                  return (
                    <li key={`${l.titulo}-${i}`} className="text-sm">
                      <p className="flex items-center gap-1.5 font-medium">
                        <Icone className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                        {l.titulo}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {GAP_LABEL[l.tipo]}
                      </Badge>
                      <p className="mt-1 text-muted-foreground">{l.orientacao}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="size-4 text-primary" aria-hidden="true" />
              Palavras-chave encontradas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {result.palavrasChaveEncontradas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum termo relevante da vaga foi localizado no currículo.
              </p>
            ) : (
              result.palavrasChaveEncontradas.map((k) => (
                <Badge key={k} variant="secondary">
                  {k}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="size-4 text-accent" aria-hidden="true" />
              Palavras-chave ausentes ou pouco representadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {result.palavrasChaveAusentes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Os termos relevantes da vaga aparecem no currículo.
                </p>
              ) : (
                result.palavrasChaveAusentes.map((k) => (
                  <Badge key={k} variant="outline">
                    {k}
                  </Badge>
                ))
              )}
            </div>
            {result.palavrasChaveAusentes.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Inclua um termo apenas se ele descreve algo que você realmente fez. Repetir palavras sem
                contexto não ajuda.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="size-4 text-accent" aria-hidden="true" />
            Sugestões de melhoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result.sugestoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma sugestão adicional nesta análise.</p>
          ) : (
            <ul className="space-y-3">
              {(["alta", "media", "opcional"] as const).flatMap((prioridade) =>
                result.sugestoes
                  .filter((s) => s.prioridade === prioridade)
                  .map((s, i) => (
                    <li key={`${prioridade}-${s.titulo}-${i}`} className="text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            prioridade === "alta"
                              ? "default"
                              : prioridade === "media"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {PRIORITY_LABEL[prioridade]}
                        </Badge>
                        <p className="font-medium">{s.titulo}</p>
                      </div>
                      <p className="mt-1 text-muted-foreground">{s.acao}</p>
                    </li>
                  )),
              )}
            </ul>
          )}
        </CardContent>
      </Card>

      {result.reescritas.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="size-4 text-primary" aria-hidden="true" />
              Sugestões de reescrita
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Nada é alterado automaticamente. Revise, edite se quiser e confirme o que é verdadeiro sobre
              a sua trajetória.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.reescritas.map((r, i) => (
              <RewriteItem
                key={`${r.alvo}-${r.alvoId}-${i}`}
                rewrite={r}
                {...(onApplyRewrite ? { onApply: onApplyRewrite } : {})}
              />
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Alert>
        <Info className="size-4" aria-hidden="true" />
        <AlertTitle>Aviso importante</AlertTitle>
        <AlertDescription>{DISCLAIMER}</AlertDescription>
      </Alert>
    </div>
  );
}

function RewriteItem({
  rewrite,
  onApply,
}: {
  rewrite: AnalysisRewrite;
  onApply?: (rewrite: AnalysisRewrite, texto: string) => void;
}) {
  const [texto, setTexto] = useState(rewrite.textoSugerido);
  const [aplicado, setAplicado] = useState(false);

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{REWRITE_LABEL[rewrite.alvo]}</Badge>
        {rewrite.alvoRotulo ? (
          <span className="text-sm font-medium">{rewrite.alvoRotulo}</span>
        ) : null}
        {!rewrite.podeAplicar ? (
          <Badge variant="outline">Precisa da sua confirmação</Badge>
        ) : null}
      </div>
      <Textarea
        className="mt-2 min-h-28"
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
        aria-label={`Texto sugerido para ${rewrite.alvoRotulo || REWRITE_LABEL[rewrite.alvo]}`}
      />
      {rewrite.observacao ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{rewrite.observacao}</p>
      ) : null}
      {onApply && rewrite.podeAplicar ? (
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          disabled={!texto.trim()}
          onClick={() => {
            onApply(rewrite, texto.trim());
            setAplicado(true);
          }}
        >
          <ArrowRight className="size-4" /> {aplicado ? "Sugestão aplicada" : "Aplicar sugestão"}
        </Button>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          Copie o texto e ajuste no editor apenas com informações verdadeiras.
        </p>
      )}
    </div>
  );
}
