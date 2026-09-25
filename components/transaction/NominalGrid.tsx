"use client";

import { rupiah } from "@/lib/format";
import type { NominalItem } from "@/lib/types";

interface NominalGridProps {
  items: readonly NominalItem[];
  selected: NominalItem | null;
  onSelect: (item: NominalItem) => void;
}

export function NominalGrid({ items, selected, onSelect }: NominalGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2.75 min-[620px]:grid-cols-3">
      {items.map((item) => {
        const isActive = selected?.nama === item.nama;
        return (
          <button
            key={item.nama}
            type="button"
            className="nom"
            data-active={isActive}
            aria-pressed={isActive}
            onClick={() => onSelect(item)}
          >
            <b>{item.nama}</b>
            <small>{item.keterangan}</small>
            <u>{rupiah(item.harga)}</u>
          </button>
        );
      })}
    </div>
  );
}
