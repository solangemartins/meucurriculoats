import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import { AreaField, MonthField, TextField } from "@/components/resume/fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  EDUCATION_LEVELS,
  LANGUAGE_LEVELS,
  SKILL_SUGGESTIONS,
  emptyCertification,
  emptyEducation,
  emptyExperience,
  emptyLanguage,
  emptyProject,
  type LanguageLevel,
  type ResumeData,
} from "@/lib/resume/types";

type Update = (updater: (draft: ResumeData) => void) => void;

function ItemCard({
  title,
  onRemove,
  onMoveUp,
  onMoveDown,
  children,
}: {
  title: string;
  onRemove: () => void;
  onMoveUp?: (() => void) | undefined;
  onMoveDown?: (() => void) | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold">{title}</p>
        <div className="flex shrink-0 items-center gap-1">
          {onMoveUp ? (
            <Button variant="ghost" size="icon" aria-label="Mover para cima" onClick={onMoveUp}>
              <ArrowUp className="size-4" />
            </Button>
          ) : null}
          {onMoveDown ? (
            <Button variant="ghost" size="icon" aria-label="Mover para baixo" onClick={onMoveDown}>
              <ArrowDown className="size-4" />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" aria-label={`Remover ${title}`} onClick={onRemove}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function PersonalSection({ data, update }: { data: ResumeData; update: Update }) {
  return (
    <div className="space-y-4">
      <TextField
        id="nome"
        label="Nome completo"
        value={data.personal.fullName}
        autoComplete="name"
        placeholder="Ana Souza Lima"
        onChange={(v) => update((d) => void (d.personal.fullName = v))}
      />
      <TextField
        id="cargo"
        label="Cargo ou objetivo profissional"
        hint="Use o nome exato do cargo da vaga, por exemplo “Analista de Marketing”."
        value={data.personal.headline}
        placeholder="Analista de Marketing"
        onChange={(v) => update((d) => void (d.personal.headline = v))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="cidade"
          label="Cidade"
          value={data.personal.city}
          placeholder="São Paulo"
          onChange={(v) => update((d) => void (d.personal.city = v))}
        />
        <TextField
          id="estado"
          label="Estado"
          value={data.personal.state}
          placeholder="SP"
          onChange={(v) => update((d) => void (d.personal.state = v))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="telefone"
          label="Telefone"
          hint="Inclua o DDD, por exemplo (11) 91234-5678."
          value={data.personal.phone}
          placeholder="(11) 91234-5678"
          autoComplete="tel"
          onChange={(v) => update((d) => void (d.personal.phone = v))}
        />
        <TextField
          id="email-curriculo"
          label="E-mail profissional"
          type="email"
          value={data.personal.email}
          placeholder="ana.souza@email.com"
          autoComplete="email"
          onChange={(v) => update((d) => void (d.personal.email = v))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="linkedin"
          label="LinkedIn"
          hint="Cole o endereço completo. Ele também aparece como texto no currículo."
          value={data.personal.linkedin}
          placeholder="linkedin.com/in/anasouza"
          onChange={(v) => update((d) => void (d.personal.linkedin = v))}
        />
        <TextField
          id="site"
          label="Portfólio ou site"
          value={data.personal.website}
          placeholder="anasouza.com.br"
          onChange={(v) => update((d) => void (d.personal.website = v))}
        />
      </div>
      <AreaField
        id="resumo"
        label="Resumo profissional"
        hint="3 a 5 linhas: sua área, tempo de experiência, principais entregas e o que você busca."
        rows={6}
        maxLength={900}
        value={data.personal.summary}
        placeholder="Profissional de marketing com 5 anos de atuação em campanhas digitais..."
        onChange={(v) => update((d) => void (d.personal.summary = v))}
      />
      <p className="rounded-lg surface-soft p-3 text-xs">
        Não pedimos foto, CPF, RG, estado civil, idade, gênero ou endereço completo: esses dados não
        ajudam na triagem automática e podem gerar viés.
      </p>
    </div>
  );
}

export function ObjectiveSection({ data, update }: { data: ResumeData; update: Update }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="cargo-desejado"
          label="Cargo desejado"
          value={data.objective.desiredRole}
          placeholder="Analista de Marketing Pleno"
          onChange={(v) => update((d) => void (d.objective.desiredRole = v))}
        />
        <TextField
          id="area"
          label="Área profissional"
          value={data.objective.area}
          placeholder="Marketing Digital"
          onChange={(v) => update((d) => void (d.objective.area = v))}
        />
      </div>
      <AreaField
        id="objetivo"
        label="Breve objetivo"
        hint="Uma ou duas frases objetivas, sem textos genéricos como “busco crescer profissionalmente”."
        rows={3}
        maxLength={400}
        value={data.objective.objective}
        onChange={(v) => update((d) => void (d.objective.objective = v))}
      />
    </div>
  );
}

export function ExperienceSection({ data, update }: { data: ResumeData; update: Update }) {
  const move = (index: number, direction: -1 | 1) =>
    update((d) => {
      const alvo = index + direction;
      if (alvo < 0 || alvo >= d.experiences.length) return;
      const lista = d.experiences;
      const atual = lista[index]!;
      lista[index] = lista[alvo]!;
      lista[alvo] = atual;
    });

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Comece pela experiência mais recente. Use verbos de ação (“coordenei”, “reduzi”, “implantei”) e
        destaque resultados com números.
      </p>
      {data.experiences.map((exp, index) => (
        <ItemCard
          key={exp.id}
          title={exp.role || exp.company || `Experiência ${index + 1}`}
          onRemove={() => update((d) => void (d.experiences = d.experiences.filter((e) => e.id !== exp.id)))}
          onMoveUp={index > 0 ? () => move(index, -1) : undefined}
          onMoveDown={index < data.experiences.length - 1 ? () => move(index, 1) : undefined}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`cargo-${exp.id}`}
              label="Cargo"
              value={exp.role}
              onChange={(v) => update((d) => void (d.experiences[index]!.role = v))}
            />
            <TextField
              id={`empresa-${exp.id}`}
              label="Empresa"
              value={exp.company}
              onChange={(v) => update((d) => void (d.experiences[index]!.company = v))}
            />
          </div>
          <TextField
            id={`cidade-exp-${exp.id}`}
            label="Cidade"
            value={exp.city}
            onChange={(v) => update((d) => void (d.experiences[index]!.city = v))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <MonthField
              id={`inicio-${exp.id}`}
              label="Data de início"
              value={exp.startDate}
              onChange={(v) => update((d) => void (d.experiences[index]!.startDate = v))}
            />
            <MonthField
              id={`fim-${exp.id}`}
              label="Data de término"
              value={exp.endDate}
              disabled={exp.current}
              onChange={(v) => update((d) => void (d.experiences[index]!.endDate = v))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`atual-${exp.id}`}
              checked={exp.current}
              onCheckedChange={(checked) =>
                update((d) => {
                  d.experiences[index]!.current = checked === true;
                  if (checked === true) d.experiences[index]!.endDate = "";
                })
              }
            />
            <Label htmlFor={`atual-${exp.id}`} className="text-sm font-normal">
              Trabalho atualmente aqui
            </Label>
          </div>
          <AreaField
            id={`descricao-${exp.id}`}
            label="Descrição das atividades"
            rows={4}
            value={exp.description}
            placeholder="Responsável por..."
            onChange={(v) => update((d) => void (d.experiences[index]!.description = v))}
          />

          <div className="space-y-2">
            <Label>Conquistas e resultados</Label>
            {exp.achievements.map((item, aIndex) => (
              <div key={aIndex} className="flex gap-2">
                <Input
                  value={item}
                  aria-label={`Conquista ${aIndex + 1}`}
                  placeholder="Aumentei em 30% a taxa de conversão em 6 meses"
                  onChange={(event) =>
                    update((d) => void (d.experiences[index]!.achievements[aIndex] = event.target.value))
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover conquista ${aIndex + 1}`}
                  onClick={() =>
                    update(
                      (d) =>
                        void (d.experiences[index]!.achievements = d.experiences[index]!.achievements.filter(
                          (_, i) => i !== aIndex,
                        )),
                    )
                  }
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => update((d) => void d.experiences[index]!.achievements.push(""))}
            >
              <Plus className="size-4" /> Adicionar conquista
            </Button>
          </div>
        </ItemCard>
      ))}
      <Button variant="secondary" onClick={() => update((d) => void d.experiences.push(emptyExperience()))}>
        <Plus className="size-4" /> Adicionar experiência
      </Button>
    </div>
  );
}

export function EducationSection({ data, update }: { data: ResumeData; update: Update }) {
  return (
    <div className="space-y-4">
      {data.education.map((edu, index) => (
        <ItemCard
          key={edu.id}
          title={edu.course || `Formação ${index + 1}`}
          onRemove={() => update((d) => void (d.education = d.education.filter((e) => e.id !== edu.id)))}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`curso-${edu.id}`}
              label="Curso"
              value={edu.course}
              onChange={(v) => update((d) => void (d.education[index]!.course = v))}
            />
            <TextField
              id={`instituicao-${edu.id}`}
              label="Instituição"
              value={edu.institution}
              onChange={(v) => update((d) => void (d.education[index]!.institution = v))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`nivel-${edu.id}`}>Nível de formação</Label>
              <Select
                value={edu.level}
                onValueChange={(v) => update((d) => void (d.education[index]!.level = v))}
              >
                <SelectTrigger id={`nivel-${edu.id}`}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TextField
              id={`cidade-edu-${edu.id}`}
              label="Cidade"
              value={edu.city}
              onChange={(v) => update((d) => void (d.education[index]!.city = v))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MonthField
              id={`inicio-edu-${edu.id}`}
              label="Data de início"
              value={edu.startDate}
              onChange={(v) => update((d) => void (d.education[index]!.startDate = v))}
            />
            <MonthField
              id={`fim-edu-${edu.id}`}
              label="Data de conclusão"
              value={edu.endDate}
              disabled={edu.inProgress}
              onChange={(v) => update((d) => void (d.education[index]!.endDate = v))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`andamento-${edu.id}`}
              checked={edu.inProgress}
              onCheckedChange={(checked) =>
                update((d) => {
                  d.education[index]!.inProgress = checked === true;
                  if (checked === true) d.education[index]!.endDate = "";
                })
              }
            />
            <Label htmlFor={`andamento-${edu.id}`} className="text-sm font-normal">
              Em andamento
            </Label>
          </div>
        </ItemCard>
      ))}
      <Button variant="secondary" onClick={() => update((d) => void d.education.push(emptyEducation()))}>
        <Plus className="size-4" /> Adicionar formação
      </Button>
    </div>
  );
}

export function SkillsSection({ data, update }: { data: ResumeData; update: Update }) {
  const [novo, setNovo] = useState("");

  const adicionar = (valor: string) => {
    const limpo = valor.trim();
    if (!limpo) return;
    update((d) => {
      if (!d.skills.some((s) => s.toLowerCase() === limpo.toLowerCase())) d.skills.push(limpo);
    });
    setNovo("");
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Prefira palavras que aparecem na descrição da vaga. No currículo elas aparecem só como texto, sem
        barras, estrelas ou porcentagens.
      </p>
      <div className="flex gap-2">
        <Input
          value={novo}
          aria-label="Nova habilidade"
          placeholder="Ex.: Excel avançado"
          onChange={(event) => setNovo(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              adicionar(novo);
            }
          }}
        />
        <Button onClick={() => adicionar(novo)}>
          <Plus className="size-4" /> Adicionar
        </Button>
      </div>

      {data.skills.length ? (
        <ul className="flex flex-wrap gap-2">
          {data.skills.map((skill) => (
            <li key={skill}>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-primary-soft px-3 py-1 text-sm text-foreground">
                {skill}
                <button
                  type="button"
                  aria-label={`Remover ${skill}`}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  onClick={() => update((d) => void (d.skills = d.skills.filter((s) => s !== skill)))}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma habilidade adicionada ainda.</p>
      )}

      <Separator />
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Sugestões para começar</p>
        <div className="flex flex-wrap gap-2">
          {SKILL_SUGGESTIONS.filter((s) => !data.skills.includes(s)).map((s) => (
            <button key={s} type="button" onClick={() => adicionar(s)}>
              <Badge
                variant="outline"
                className="cursor-pointer hover:border-primary hover:text-primary"
              >
                + {s}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CertificationsSection({ data, update }: { data: ResumeData; update: Update }) {
  return (
    <div className="space-y-4">
      {data.certifications.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.name || `Curso ${index + 1}`}
          onRemove={() =>
            update((d) => void (d.certifications = d.certifications.filter((c) => c.id !== item.id)))
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`curso-nome-${item.id}`}
              label="Nome"
              value={item.name}
              onChange={(v) => update((d) => void (d.certifications[index]!.name = v))}
            />
            <TextField
              id={`curso-emissor-${item.id}`}
              label="Instituição emissora"
              value={item.issuer}
              onChange={(v) => update((d) => void (d.certifications[index]!.issuer = v))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`curso-data-${item.id}`}
              label="Ano ou data"
              value={item.date}
              placeholder="2024"
              onChange={(v) => update((d) => void (d.certifications[index]!.date = v))}
            />
            <TextField
              id={`curso-link-${item.id}`}
              label="Link (opcional)"
              value={item.link}
              onChange={(v) => update((d) => void (d.certifications[index]!.link = v))}
            />
          </div>
        </ItemCard>
      ))}
      <Button
        variant="secondary"
        onClick={() => update((d) => void d.certifications.push(emptyCertification()))}
      >
        <Plus className="size-4" /> Adicionar curso ou certificação
      </Button>
    </div>
  );
}

export function LanguagesSection({ data, update }: { data: ResumeData; update: Update }) {
  return (
    <div className="space-y-4">
      {data.languages.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.language || `Idioma ${index + 1}`}
          onRemove={() => update((d) => void (d.languages = d.languages.filter((l) => l.id !== item.id)))}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`idioma-${item.id}`}
              label="Idioma"
              value={item.language}
              placeholder="Inglês"
              onChange={(v) => update((d) => void (d.languages[index]!.language = v))}
            />
            <div className="space-y-1.5">
              <Label htmlFor={`nivel-idioma-${item.id}`}>Nível</Label>
              <Select
                value={item.level}
                onValueChange={(v) =>
                  update((d) => void (d.languages[index]!.level = v as LanguageLevel))
                }
              >
                <SelectTrigger id={`nivel-idioma-${item.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_LEVELS.map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ItemCard>
      ))}
      <Button variant="secondary" onClick={() => update((d) => void d.languages.push(emptyLanguage()))}>
        <Plus className="size-4" /> Adicionar idioma
      </Button>
    </div>
  );
}

export function ProjectsSection({ data, update }: { data: ResumeData; update: Update }) {
  return (
    <div className="space-y-4">
      {data.projects.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.name || `Projeto ${index + 1}`}
          onRemove={() => update((d) => void (d.projects = d.projects.filter((p) => p.id !== item.id)))}
        >
          <TextField
            id={`projeto-nome-${item.id}`}
            label="Nome do projeto"
            value={item.name}
            onChange={(v) => update((d) => void (d.projects[index]!.name = v))}
          />
          <AreaField
            id={`projeto-descricao-${item.id}`}
            label="Descrição"
            rows={3}
            value={item.description}
            onChange={(v) => update((d) => void (d.projects[index]!.description = v))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`projeto-skills-${item.id}`}
              label="Tecnologias ou competências"
              value={item.skills}
              onChange={(v) => update((d) => void (d.projects[index]!.skills = v))}
            />
            <TextField
              id={`projeto-link-${item.id}`}
              label="Link (opcional)"
              value={item.link}
              onChange={(v) => update((d) => void (d.projects[index]!.link = v))}
            />
          </div>
        </ItemCard>
      ))}
      <Button variant="secondary" onClick={() => update((d) => void d.projects.push(emptyProject()))}>
        <Plus className="size-4" /> Adicionar projeto
      </Button>
    </div>
  );
}

export function AdditionalSection({ data, update }: { data: ResumeData; update: Update }) {
  return (
    <AreaField
      id="adicionais"
      label="Informações adicionais"
      hint="Trabalho voluntário, prêmios, publicações, disponibilidade para viagens ou mudança."
      rows={6}
      maxLength={900}
      value={data.additional}
      onChange={(v) => update((d) => void (d.additional = v))}
    />
  );
}
