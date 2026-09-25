"use client";

interface ProviderChipsProps {
  label: string;
  providers: readonly string[];
  active: string | null;
  onSelect: (provider: string) => void;
}

export function ProviderChips({ label, providers, active, onSelect }: ProviderChipsProps) {
  return (
    <div className="mb-4.5">
      <span className="label-fl">{label}</span>
      <div className="chips" role="group" aria-label={label}>
        {providers.map((provider) => (
          <button
            key={provider}
            type="button"
            className="chip"
            data-active={provider === active}
            aria-pressed={provider === active}
            onClick={() => onSelect(provider)}
          >
            {provider}
          </button>
        ))}
      </div>
    </div>
  );
}
