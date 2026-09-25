import { CATEGORY_ICON_KEYS, CategoryIcon } from "@/lib/icons";
import { labelClass } from "@/components/admin/fields";

export const TINT_PRESETS = [
  "#D8F5F0",
  "#FFE7D6",
  "#E4E7FB",
  "#FFF1D6",
  "#FDE2E2",
  "#E7F0E2",
  "#EDE4FB",
  "#FFE9F3",
];

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <span className={labelClass}>Ikon</span>
      <div className="flex flex-wrap gap-2">
        {CATEGORY_ICON_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            aria-label={`Pilih ikon ${key}`}
            aria-pressed={value === key}
            onClick={() => onChange(key)}
            className={`grid h-11 w-11 place-items-center rounded-xl border-2 transition-colors ${
              value === key
                ? "border-tosca bg-tosca-soft"
                : "border-line bg-white hover:border-tosca/60"
            }`}
          >
            <CategoryIcon slug={key} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function TintPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <span className={labelClass}>Warna latar ikon</span>
      <div className="flex flex-wrap gap-2">
        {TINT_PRESETS.map((tint) => (
          <button
            key={tint}
            type="button"
            aria-label={`Pilih warna ${tint}`}
            aria-pressed={value === tint}
            onClick={() => onChange(tint)}
            style={{ background: tint }}
            className={`h-9 w-9 rounded-full border-2 transition-transform ${
              value === tint
                ? "border-ink scale-110"
                : "border-line hover:scale-105"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
