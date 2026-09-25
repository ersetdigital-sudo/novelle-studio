import type { ReactNode } from "react";

/** Kelas dasar input admin — dipakai semua field supaya konsisten. */
export const inputClass =
  "w-full rounded-xl border-2 border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition-colors focus:border-tosca";

export const labelClass = "mb-1.5 block text-xs font-semibold text-ink";

export function Card({
  title,
  description,
  action,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border-2 border-line bg-white">
      {(title || action) && (
        <header className="flex flex-wrap items-center gap-3 border-b-2 border-line bg-cream/60 px-5 py-3.5">
          <div className="mr-auto">
            {title && <h2 className="font-display text-base font-extrabold">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "url" | "email" | "tel";
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input
        className={inputClass}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <textarea
        className={`${inputClass} resize-y leading-relaxed`}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  hint,
  min = 0,
  className,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  min?: number;
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input
        className={inputClass}
        type="number"
        min={min}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Math.max(min, Math.round(Number(event.target.value) || 0)))}
      />
    </Field>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="-mx-2 flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-cream/70">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] leading-snug text-muted">{hint}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tosca ${
          checked ? "border-tosca bg-tosca" : "border-line bg-white"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-transform duration-200 ${
            checked ? "translate-x-5 bg-white" : "translate-x-0 bg-muted"
          }`}
        />
      </span>
      <span
        className={`w-14 shrink-0 text-right text-[11px] font-bold uppercase tracking-wide ${
          checked ? "text-tosca-dark" : "text-muted"
        }`}
      >
        {checked ? "Aktif" : "Nonaktif"}
      </span>
    </label>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ok" | "wait" | "off";
}) {
  const tones = {
    neutral: "bg-cream text-muted border-line",
    ok: "bg-tosca-soft text-tosca-dark border-tosca-soft",
    wait: "bg-orange-soft text-orange-dark border-orange-soft",
    off: "bg-slate-100 text-slate-500 border-slate-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
