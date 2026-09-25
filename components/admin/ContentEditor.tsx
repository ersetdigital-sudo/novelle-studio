"use client";

import { useState, useTransition } from "react";

import { resetContentAction, saveContentSectionAction } from "@/app/admin/actions";
import { Card, NumberField, TextAreaField, TextField } from "@/components/admin/fields";
import { Toast, useToast } from "@/components/admin/Toast";
import type { Faq, Promo, SiteContent, Testimonial, TextItem } from "@/lib/types";

type Section = keyof SiteContent;

export function ContentEditor({ content }: { content: SiteContent }) {
  const { toast, show } = useToast();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<SiteContent>(content);

  const patch = <S extends Section>(section: S, value: Partial<SiteContent[S]>) =>
    setDraft((prev) => ({ ...prev, [section]: { ...prev[section], ...value } }));

  const saveSection = (section: Section) =>
    startTransition(async () => {
      // Kirim hanya bagian yang diedit; server menggabungkan rekursif.
      const result = await saveContentSectionAction(section, draft[section]);
      show(result.message, result.ok ? "ok" : "error");
    });

  const saveButton = (section: Section) => (
    <button type="button" className="btn btn-orange px-5 py-2.5 text-xs" disabled={pending} onClick={() => saveSection(section)}>
      Simpan
    </button>
  );

  return (
    <div className="space-y-5">
      <Toast toast={toast} />

      <Card title="Identitas & Kontak" description="Nama brand, tagline, dan kontak CS." action={saveButton("settings")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nama brand" value={draft.settings.name} onChange={(name) => patch("settings", { name })} />
          <TextField label="Tagline" value={draft.settings.tagline} onChange={(tagline) => patch("settings", { tagline })} />
          <TextAreaField label="Deskripsi (SEO)" value={draft.settings.description} onChange={(description) => patch("settings", { description })} className="sm:col-span-2" rows={2} />
          <TextField label="Nomor CS (tampilan)" value={draft.settings.phoneDisplay} onChange={(phoneDisplay) => patch("settings", { phoneDisplay })} />
          <TextField label="Link WhatsApp (wa.me/…)" value={draft.settings.whatsapp} onChange={(whatsapp) => patch("settings", { whatsapp })} />
          <TextField label="Email" value={draft.settings.email} onChange={(email) => patch("settings", { email })} />
        </div>
      </Card>

      <Card title="Hero" description="Bagian atas beranda." action={saveButton("hero")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Teks badge (pill)" value={draft.hero.badge} onChange={(badge) => patch("hero", { badge })} className="sm:col-span-2" />
          <TextField label="Judul (awal)" value={draft.hero.title} onChange={(title) => patch("hero", { title })} />
          <TextField label="Kata berwarna tosca" value={draft.hero.accent} onChange={(accent) => patch("hero", { accent })} />
          <TextField label="Judul (lanjutan)" value={draft.hero.titleSuffix} onChange={(titleSuffix) => patch("hero", { titleSuffix })} />
          <TextField label="CTA utama" value={draft.hero.primaryCta} onChange={(primaryCta) => patch("hero", { primaryCta })} />
          <TextField label="CTA kedua" value={draft.hero.secondaryCta} onChange={(secondaryCta) => patch("hero", { secondaryCta })} />
          <TextAreaField label="Paragraf pengantar" value={draft.hero.lead} onChange={(lead) => patch("hero", { lead })} className="sm:col-span-2" rows={2} />
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-xs font-semibold">Statistik (satu baris: angka | label)</p>
            <textarea
              className="w-full rounded-xl border-2 border-line bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-tosca"
              rows={3}
              value={draft.hero.stats.map((stat) => `${stat.value} | ${stat.label}`).join("\n")}
              onChange={(event) =>
                patch("hero", {
                  stats: event.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line) => {
                      const [value = "", label = ""] = line.split("|").map((part) => part.trim());
                      return { value, label };
                    }),
                })
              }
            />
          </div>
        </div>
      </Card>

      <ListSection section="why" title="Kenapa Kami" draft={draft} patch={patch} saveButton={saveButton} titleFields />
      <ListSection section="steps" title="Cara Transaksi" draft={draft} patch={patch} saveButton={saveButton} titleFields />
      <ListSection section="promos" title="Promo" draft={draft} patch={patch} saveButton={saveButton} badge />
      <ListSection section="testimonials" title="Testimoni" draft={draft} patch={patch} saveButton={saveButton} person />
      <ListSection section="faqs" title="FAQ" draft={draft} patch={patch} saveButton={saveButton} faq />

      <Card title="Kembalikan ke awal" description="Semua konten kembali ke bawaan kode. Tidak berlaku pada katalog & pesanan.">
        <ResetButton />
      </Card>
    </div>
  );
}

type PatchFn = <S extends Section>(section: S, value: Partial<SiteContent[S]>) => void;

function ListSection({
  section,
  title,
  draft,
  patch,
  saveButton,
  titleFields,
  badge,
  person,
  faq,
}: {
  section: Section;
  title: string;
  draft: SiteContent;
  patch: PatchFn;
  saveButton: (section: Section) => React.ReactNode;
  titleFields?: boolean;
  badge?: boolean;
  person?: boolean;
  faq?: boolean;
}) {
  // Semua daftar memakai bentuk { kicker, title, subtitle, items }, tapi tipe
  // itemnya berbeda tiap section — editor menanganinya lewat tipe gabungan ini.
  type ListItem = Partial<TextItem & Promo & Testimonial & Faq>;
  const data = draft[section] as SiteContent["why"];
  const items = data.items as ListItem[];

  const setItems = (next: ListItem[]) =>
    patch(section, { items: next } as never);

  return (
    <Card title={title} description={`${items.length} item`} action={saveButton(section)}>
      {titleFields && (
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <TextField label="Kicker" value={data.kicker} onChange={(kicker) => patch(section, { kicker } as never)} />
          <TextField label="Judul" value={data.title} onChange={(t) => patch(section, { title: t } as never)} />
          <TextField label="Subjudul" value={data.subtitle} onChange={(s) => patch(section, { subtitle: s } as never)} />
        </div>
      )}

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="grid gap-2.5 rounded-xl border-2 border-line p-3.5">
            {titleFields && (
              <TextField label="Judul item" value={item.title ?? ""} onChange={(t) => setItems(items.map((it, i) => (i === index ? { ...it, title: t } : it)))} />
            )}
            {faq && (
              <TextField label="Pertanyaan" value={item.question ?? ""} onChange={(q) => setItems(items.map((it, i) => (i === index ? { ...it, question: q } : it)))} />
            )}
            {badge && (
              <div className="grid gap-2.5 sm:grid-cols-3">
                <TextField label="Kode" value={item.code ?? ""} onChange={(c) => setItems(items.map((it, i) => (i === index ? { ...it, code: c } : it)))} />
                <TextField label="Judul" value={item.title ?? ""} onChange={(t) => setItems(items.map((it, i) => (i === index ? { ...it, title: t } : it)))} />
                <TextField label="Varian (tosca/orange/indigo)" value={item.variant ?? "tosca"} onChange={(v) => setItems(items.map((it, i) => (i === index ? { ...it, variant: (v === "orange" ? "orange" : v === "indigo" ? "indigo" : "tosca") } : it)))} />
              </div>
            )}
            {person && (
              <div className="grid gap-2.5 sm:grid-cols-4">
                <TextField label="Nama" value={item.name ?? ""} onChange={(n) => setItems(items.map((it, i) => (i === index ? { ...it, name: n } : it)))} />
                <TextField label="Peran" value={item.role ?? ""} onChange={(r) => setItems(items.map((it, i) => (i === index ? { ...it, role: r } : it)))} />
                <TextField label="Inisial" value={item.initial ?? ""} onChange={(ini) => setItems(items.map((it, i) => (i === index ? { ...it, initial: ini } : it)))} />
                <NumberField label="Rating (0-5)" value={item.rating ?? 5} onChange={(rating) => setItems(items.map((it, i) => (i === index ? { ...it, rating: Math.min(5, Math.max(0, rating)) } : it)))} />
              </div>
            )}
            <TextAreaField
              label={faq ? "Jawaban" : badge ? "Deskripsi" : "Isi"}
              value={faq ? item.answer ?? "" : item.description ?? ""}
              rows={2}
              onChange={(text) =>
                setItems(
                  items.map((it, i) =>
                    i === index
                      ? faq
                        ? { ...it, answer: text }
                        : { ...it, description: text }
                      : it,
                  ),
                )
              }
            />
            {person && (
              <TextAreaField label="Kutipan" value={item.quote ?? ""} rows={2} onChange={(quote) => setItems(items.map((it, i) => (i === index ? { ...it, quote } : it)))} />
            )}
            <button type="button" className="justify-self-start text-xs font-semibold text-rose-600 hover:underline" onClick={() => setItems(items.filter((_, i) => i !== index))}>
              Hapus item
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="btn btn-ghost mt-3 px-4 py-2 text-xs"
        onClick={() => {
          if (badge) setItems([...items, { code: "KODE: BARU", title: "Promo Baru", description: "", variant: "tosca" }]);
          else if (faq) setItems([...items, { question: "Pertanyaan baru", answer: "" }]);
          else if (person) setItems([...items, { rating: 5, quote: "", name: "", role: "", initial: "?", color: "#0FB9A8" }]);
          else setItems([...items, { title: "Judul baru", description: "" }]);
        }}
        // Tipe item tiap section berbeda; di atas sudah dinarrow via ListItem.
      >
        + Tambah item
      </button>
    </Card>
  );
}

function ResetButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="btn btn-ghost border-rose-200 text-rose-600 hover:border-rose-300"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Kembalikan seluruh konten ke isi awal?")) return;
          startTransition(async () => {
            const result = await resetContentAction();
            setMessage(result.message);
          });
        }}
      >
        {pending ? "…" : "Reset Konten"}
      </button>
      {message && <span className="text-xs font-semibold text-muted">{message}</span>}
    </div>
  );
}
