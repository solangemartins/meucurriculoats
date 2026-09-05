import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        {hint ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`Dica sobre ${label}`}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Info className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">{hint}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      {children}
      {hint ? <p className="text-xs text-muted-foreground sm:hidden">{hint}</p> : null}
    </div>
  );
}

export function TextField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function AreaField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {maxLength ? (
        <p className="text-right text-xs text-muted-foreground">
          {value.length}/{maxLength}
        </p>
      ) : null}
    </Field>
  );
}

export function MonthField({
  id,
  label,
  value,
  onChange,
  disabled,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hint?: string | undefined;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        type="month"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
