"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteCustomCategoryAction, saveCategoryAction } from "@/app/admin/actions";
import { IconPicker, TintPicker } from "@/components/admin/CategoryAppearance";
import { Card, NumberField, TextField, Toggle, inputClass, labelClass } from "@/components/admin/fields";
import { Toast, useToast } from "@/components/admin/Toast";
import { rupiah } from "@/lib/format";
import type { CategoryItemRecord, CategorySetting } from "@/lib/types";

interface DraftItem {
  id: string;
  variant: "main" | "alt";
  label: string;
  note: string;
  price: number;
  isActive: boolean;
}

export interface CategoryIdentity {
  name: string;
  short: string;
  tint: string;
  icon: string;
  fieldType: "tel" | "text";
}

export function CategoryEditor({
  setting: initialSetting,
  items: initialItems,
  hasAlt,
  identity: initialIdentity,
}: {
  setting: CategorySetting;
  items: CategoryItemRecord[];
  hasAlt: boolean;
  identity?: CategoryIdentity;
}) {
  const router = useRouter();
  const { toast, show } = useToast();
  const [pending, startTransition] = useTransition();

  const [setting, setSetting] = useState<CategorySetting>(initialSetting);
  const [identity, setIdentityState] = useState<CategoryIdentity | null>(initialIdentity ?? null);
  const [items, setItems] = useState<DraftItem[]>(
    initialItems.map(({ id, variant, label, note, price, isActive }) => ({
      id,
      variant,
      label,
      note,
      price,
      isActive,
    })),
  );

  const setItem = (index: number, patch: Partial<DraftItem>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const addItem = (variant: "main" | "alt") =>
    setItems((prev) => [
      ...prev,
      { id: `draft-${Date.now()}`, variant, label: "", note: "", price: 0, isActive: true },
    ]);

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  function save() {
    startTransition(async () => {
      const result = await saveCategoryAction({ setting, items, identity: identity ?? undefined });
      show(result.message, result.ok ? "ok" : "error");
    });
  }

  function remove() {
    if (!identity) return;
    if (!window.confirm(`Hapus kategori "${identity.name}"? Semua nominal di dalamnya ikut terhapus.`)) return;
    startTransition(async () => {
      const result = await deleteCustomCategoryAction(setting.slug);
      show(result.message, result.ok ? "ok" : "error");
      if (result.ok) router.push("/admin/katalog");
    });
  }

  const patchIdentity = (patch: Partial<CategoryIdentity>) =>
    setIdentityState((prev) => (prev ? { ...prev, ...patch } : prev));

  const main = items.filter((item) => item.variant === "main");
  const alt = items.filter((item) => item.variant === "alt");
  const activePrices = main.filter((item) => item.isActive && item.price > 0).map((item) => item.price);
  const cheapest = activePrices.length ? Math.min(...activePrices) : 0;

  return (
    <div className="space-y-5">
      <Toast toast={toast} />

      {identity && (
        <Card title="Identitas & tampilan" description="Nama, ikon, dan warna kartu kategori di beranda.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Nama kategori"
              value={identity.name}
              onChange={(name) => patchIdentity({ name })}
              placeholder="Nama kategori"
            />
            <TextField
              label="Deskripsi singkat"
              value={identity.short}
              onChange={(short) => patchIdentity({ short })}
              placeholder="Tampil di bawah nama pada kartu"
            />
            <label className="block">
              <span className={labelClass}>Jenis input tujuan</span>
              <select
                className={inputClass}
                value={identity.fieldType}
                onChange={(event) =>
                  patchIdentity({ fieldType: event.target.value === "text" ? "text" : "tel" })
                }
              >
                <option value="tel">Angka (keyboard nomor)</option>
                <option value="text">Teks bebas</option>
              </select>
            </label>
          </div>
          <div className="mt-4 space-y-4 border-t-2 border-dashed border-line pt-4">
            <IconPicker value={identity.icon} onChange={(icon) => patchIdentity({ icon })} />
            <TintPicker value={identity.tint} onChange={(tint) => patchIdentity({ tint })} />
          </div>
        </Card>
      )}

      <Card title="Pengaturan kategori">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Biaya admin (Rp)"
            value={setting.adminFee}
            onChange={(adminFee) => setSetting((prev) => ({ ...prev, adminFee }))}
            hint="0 = gratis. Ditampilkan terpisah di ringkasan pembeli."
          />
          <TextField
            label="Label bagian nominal"
            value={setting.nomLabel}
            onChange={(nomLabel) => setSetting((prev) => ({ ...prev, nomLabel }))}
            placeholder="Pilih Nominal"
          />
          <TextField
            label="Label field nomor tujuan"
            value={setting.fieldLabel}
            onChange={(fieldLabel) => setSetting((prev) => ({ ...prev, fieldLabel }))}
          />
          <NumberField
            label="Panjang minimal nomor"
            value={setting.fieldMinLength}
            onChange={(fieldMinLength) => setSetting((prev) => ({ ...prev, fieldMinLength }))}
          />
          <TextField
            label="Placeholder"
            value={setting.fieldPlaceholder}
            onChange={(fieldPlaceholder) => setSetting((prev) => ({ ...prev, fieldPlaceholder }))}
            className="sm:col-span-2"
          />
          <TextField
            label="Hint untuk pembeli"
            value={setting.fieldHint}
            onChange={(fieldHint) => setSetting((prev) => ({ ...prev, fieldHint }))}
            className="sm:col-span-2"
          />
        </div>

        {setting.providers && (
          <div className="mt-4 rounded-xl border-2 border-line bg-cream/60 p-4">
            <TextField
              label="Label daftar penyedia"
              value={setting.providerLabel ?? ""}
              onChange={(providerLabel) =>
                setSetting((prev) => ({ ...prev, providerLabel: providerLabel || null }))
              }
            />
            <p className="mt-2 mb-1.5 text-xs font-semibold">Daftar penyedia (satu per baris)</p>
            <textarea
              className={`${inputClass} resize-y`}
              rows={Math.min(8, setting.providers.length + 1)}
              value={setting.providers.join("\n")}
              onChange={(event) =>
                setSetting((prev) => ({
                  ...prev,
                  providers: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
                }))
              }
            />
          </div>
        )}

        <div className="mt-4">
          <Toggle
            label="Tampilkan kategori di situs"
            checked={setting.isActive}
            onChange={(isActive) => setSetting((prev) => ({ ...prev, isActive }))}
            hint="Kategori disembunyikan tetap punya data, tapi hilang dari beranda, footer, dan sitemap."
          />
        </div>
      </Card>

      <Card
        title="Nominal / paket"
        description={`${main.filter((i) => i.isActive).length} aktif dari ${main.length}`}
        action={
          <button type="button" className="btn btn-ghost px-4 py-2 text-xs" onClick={() => addItem("main")}>
            + Tambah nominal
          </button>
        }
      >
        <ItemList items={main} onPatch={setItem} onRemove={removeItem} />
      </Card>

      {hasAlt && (
        <Card
          title={`Daftar alternatif (untuk "${setting.altProvider ?? "provider alt"}")`}
          description="Contoh: PLN pascabayar memakai daftar tagihan, bukan token."
          action={
            <button type="button" className="btn btn-ghost px-4 py-2 text-xs" onClick={() => addItem("alt")}>
              + Tambah
            </button>
          }
        >
          <ItemList items={alt} onPatch={setItem} onRemove={removeItem} />
        </Card>
      )}

      <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border-2 border-ink bg-white p-3.5 shadow-hard">
        <button type="button" className="btn btn-orange" disabled={pending} onClick={save}>
          {pending ? "Menyimpan…" : "Simpan Perubahan"}
        </button>
        <span className="text-[11px] text-muted">
          Total termurah sekarang: {rupiah(cheapest)}
        </span>
        {identity && (
          <button
            type="button"
            className="ml-auto text-xs font-bold text-rose-600 hover:underline disabled:opacity-50"
            disabled={pending}
            onClick={remove}
          >
            Hapus kategori
          </button>
        )}
      </div>
    </div>
  );
}

function ItemList({
  items,
  onPatch,
  onRemove,
}: {
  items: DraftItem[];
  onPatch: (index: number, patch: Partial<DraftItem>) => void;
  onRemove: (index: number) => void;
}) {
  if (items.length === 0) {
    return <p className="py-4 text-center text-xs text-muted">Belum ada item.</p>;
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={item.id} className="grid gap-2 rounded-xl border-2 border-line p-3 sm:grid-cols-[1fr_1fr_auto]">
          <div className="sm:col-span-2 grid gap-2 sm:grid-cols-[1fr_120px]">
            <input
              className={inputClass}
              value={item.label}
              placeholder="Nama paket, contoh: Pulsa 10.000"
              onChange={(event) => onPatch(index, { label: event.target.value })}
            />
            <input
              className={inputClass}
              type="number"
              min={0}
              value={item.price}
              onChange={(event) => onPatch(index, { price: Math.max(0, Math.round(Number(event.target.value) || 0)) })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <input
              className={`${inputClass} flex-1`}
              value={item.note}
              placeholder="Keterangan singkat (opsional)"
              onChange={(event) => onPatch(index, { note: event.target.value })}
            />
            <Toggle
              label="Tampil"
              checked={item.isActive}
              onChange={(isActive) => onPatch(index, { isActive })}
            />
            <button
              type="button"
              className="text-xs font-semibold text-rose-600 hover:underline"
              onClick={() => onRemove(index)}
            >
              Hapus
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
