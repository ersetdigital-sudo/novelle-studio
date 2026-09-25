"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createCategoryAction } from "@/app/admin/actions";
import { IconPicker, TintPicker } from "@/components/admin/CategoryAppearance";
import { Card, NumberField, TextField, inputClass, labelClass } from "@/components/admin/fields";
import { Toast, useToast } from "@/components/admin/Toast";
import { CategoryIcon } from "@/lib/icons";

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "kategori"
  );
}

export function NewCategoryForm() {
  const router = useRouter();
  const { toast, show } = useToast();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [short, setShort] = useState("");
  const [icon, setIcon] = useState("box");
  const [tint, setTint] = useState("#D8F5F0");
  const [admin, setAdmin] = useState(0);
  const [nomLabel, setNomLabel] = useState("Pilih Nominal");
  const [fieldLabel, setFieldLabel] = useState("Nomor Tujuan");
  const [fieldPlaceholder, setFieldPlaceholder] = useState("Masukkan nomor tujuan");
  const [fieldHint, setFieldHint] = useState("");
  const [fieldMinLength, setFieldMinLength] = useState(6);
  const [fieldType, setFieldType] = useState<"tel" | "text">("tel");

  const slugPreview = slugify(name);
  const canSubmit = name.trim().length > 0 && !pending;

  function submit() {
    if (!canSubmit) return;
    startTransition(async () => {
      const result = await createCategoryAction({
        name,
        short,
        icon,
        tint,
        admin,
        nomLabel,
        fieldLabel,
        fieldPlaceholder,
        fieldHint,
        fieldMinLength,
        fieldType,
      });
      if (result.ok && result.slug) {
        router.push(`/admin/katalog/${result.slug}?baru=1`);
        return;
      }
      show(result.message, "error");
    });
  }

  return (
    <div className="space-y-5">
      <Toast toast={toast} />

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-5">
          <Card title="Identitas kategori" description="Nama ini yang tampil di beranda dan halaman produk.">
            <div className="space-y-4">
              <TextField
                label="Nama kategori"
                value={name}
                onChange={setName}
                placeholder="Contoh: Top Up Game"
                hint={`Alamat halaman: /produk/${slugPreview}`}
              />
              <TextField
                label="Deskripsi singkat"
                value={short}
                onChange={setShort}
                placeholder="Contoh: Semua game populer, proses instan"
                hint="Muncul di bawah nama pada kartu kategori."
              />
            </div>
          </Card>

          <Card title="Tampilan" description="Pilih ikon dan warna latar biar mudah dikenali.">
            <div className="space-y-4">
              <IconPicker value={icon} onChange={setIcon} />
              <TintPicker value={tint} onChange={setTint} />
            </div>
          </Card>

          <Card title="Yang diisi pembeli" description="Sudah ada isian awal — sesuaikan kalau perlu.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Label kolom tujuan"
                value={fieldLabel}
                onChange={setFieldLabel}
                placeholder="Nomor Tujuan"
              />
              <TextField
                label="Placeholder"
                value={fieldPlaceholder}
                onChange={setFieldPlaceholder}
                placeholder="Masukkan nomor tujuan"
              />
              <label className="block">
                <span className={labelClass}>Jenis input</span>
                <select
                  className={inputClass}
                  value={fieldType}
                  onChange={(event) => setFieldType(event.target.value === "text" ? "text" : "tel")}
                >
                  <option value="tel">Angka (keyboard nomor)</option>
                  <option value="text">Teks bebas</option>
                </select>
              </label>
              <NumberField
                label="Panjang minimal tujuan"
                value={fieldMinLength}
                onChange={setFieldMinLength}
                min={1}
              />
              <TextField
                label="Label pilih nominal"
                value={nomLabel}
                onChange={setNomLabel}
                placeholder="Pilih Nominal"
              />
              <NumberField
                label="Biaya admin (Rp)"
                value={admin}
                onChange={setAdmin}
                hint="0 = gratis."
              />
              <TextField
                label="Catatan untuk pembeli"
                value={fieldHint}
                onChange={setFieldHint}
                placeholder="Contoh: Proses otomatis maksimal 5 menit"
                className="sm:col-span-2"
              />
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-6">
          <p className="mb-2 text-xs font-semibold text-muted">Pratinjau kartu di beranda</p>
          <div className="max-w-[300px] rounded-2xl border-2 border-line bg-white p-5 shadow-hard">
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl"
              style={{ background: tint }}
            >
              <CategoryIcon slug={icon} />
            </span>
            <h3 className="mt-3 font-bold text-ink">{name || "Nama kategori"}</h3>
            <p className="mt-0.5 text-xs text-muted">
              {short || "Deskripsi singkat tampil di sini"}
            </p>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-ink bg-white p-3.5 shadow-hard">
        <button type="button" className="btn btn-orange" disabled={!canSubmit} onClick={submit}>
          {pending ? "Membuat…" : "Buat Kategori"}
        </button>
        <span className="text-[11px] text-muted">
          Setelah dibuat, langkah berikutnya tinggal menambahkan nominal &amp; harganya.
        </span>
      </div>
    </div>
  );
}
