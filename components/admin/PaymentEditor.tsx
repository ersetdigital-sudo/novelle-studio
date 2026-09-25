"use client";

import { useState, useTransition } from "react";

import { savePaymentMethodsAction } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Badge, Card, TextField, Toggle, inputClass } from "@/components/admin/fields";
import { Toast, useToast } from "@/components/admin/Toast";
import { isPaymentMethodReady } from "@/lib/payment-shared";
import type { PaymentMethod } from "@/lib/types";

type Draft = Omit<PaymentMethod, "sortOrder">;

export function PaymentEditor({ methods: initial }: { methods: PaymentMethod[] }) {
  const { toast, show } = useToast();
  const [pending, startTransition] = useTransition();
  const [methods, setMethods] = useState<Draft[]>(
    initial.map(({ sortOrder: _sortOrder, ...rest }) => rest),
  );

  const patch = (index: number, value: Partial<Draft>) =>
    setMethods((prev) => prev.map((m, i) => (i === index ? { ...m, ...value } : m)));

  const add = () =>
    setMethods((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        type: "transfer",
        accountLabel: "Nomor Tujuan",
        accountNumber: "",
        accountName: "",
        qrImage: "",
        instructions: [],
        isActive: true,
      },
    ]);

  const remove = (index: number) => setMethods((prev) => prev.filter((_, i) => i !== index));

  const move = (index: number, delta: number) =>
    setMethods((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });

  function save() {
    startTransition(async () => {
      // sortOrder ditetapkan ulang server berdasarkan urutan array.
      const result = await savePaymentMethodsAction(
        methods.map((method, index) => ({ ...method, sortOrder: index }) as PaymentMethod),
      );
      show(result.message, result.ok ? "ok" : "error");
    });
  }

  return (
    <div className="space-y-5">
      <Toast toast={toast} />

      <div className="space-y-4">
        {methods.map((method, index) => (
          <Card
            key={method.id}
            title={method.name || "Metode baru"}
            action={
              <div className="flex items-center gap-1.5">
                <button type="button" aria-label="Naikkan urutan" className="btn btn-ghost px-2.5 py-1 text-xs" onClick={() => move(index, -1)}>↑</button>
                <button type="button" aria-label="Turunkan urutan" className="btn btn-ghost px-2.5 py-1 text-xs" onClick={() => move(index, 1)}>↓</button>
                <button type="button" className="text-xs font-semibold text-rose-600 hover:underline" onClick={() => remove(index)}>
                  Hapus
                </button>
              </div>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Nama metode" value={method.name} onChange={(name) => patch(index, { name })} placeholder="BCA / DANA / QRIS" />

              <div>
                <span className="mb-1.5 block text-xs font-semibold">Jenis</span>
                <div className="flex gap-2">
                  {(["qris", "transfer"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={method.type === type}
                      className={`rounded-full border-2 px-4 py-2 text-xs font-bold transition-colors ${
                        method.type === type
                          ? "border-tosca bg-tosca text-white"
                          : "border-line bg-white text-muted hover:border-tosca"
                      }`}
                      onClick={() =>
                        patch(index, {
                          type,
                          accountLabel: type === "qris" ? "QRIS" : "Nomor Tujuan",
                        })
                      }
                    >
                      {type === "qris" ? "QRIS" : "Transfer / E-Wallet"}
                    </button>
                  ))}
                </div>
              </div>

              <TextField
                label="Label yang tampil ke pembeli"
                value={method.accountLabel}
                onChange={(accountLabel) => patch(index, { accountLabel })}
                hint="Contoh: 'Kode Pembayaran Alfamart' untuk kode retail."
              />
              <TextField
                label={method.type === "qris" ? "Nama pemilik (opsional)" : "Nama pemilik rekening"}
                value={method.accountName}
                onChange={(accountName) => patch(index, { accountName })}
              />
              {method.type === "transfer" && (
                <TextField
                  label="Nomor rekening / e-wallet / kode"
                  value={method.accountNumber}
                  onChange={(accountNumber) => patch(index, { accountNumber })}
                  className="sm:col-span-2"
                />
              )}

              {method.type === "qris" && (
                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="Gambar QRIS"
                    value={method.qrImage}
                    onChange={(qrImage) => patch(index, { qrImage })}
                    hint="PNG/JPG/WebP maksimal 2 MB. Upload ke Cloudinary, atau tempel URL."
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold">
                  Instruksi pembayaran (satu per baris — kosongkan untuk default)
                </span>
                <textarea
                  className={`${inputClass} resize-y`}
                  rows={4}
                  value={method.instructions.join("\n")}
                  onChange={(event) =>
                    patch(index, {
                      instructions: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-line pt-3">
              <Toggle
                label="Tampil di halaman pembayaran"
                checked={method.isActive}
                onChange={(isActive) => patch(index, { isActive })}
              />
              {!isPaymentMethodReady({ ...method, sortOrder: 0 }) && (
                <Badge tone="wait">belum lengkap — tidak akan tampil</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-ink bg-white p-3.5 shadow-hard">
        <button type="button" className="btn btn-orange" disabled={pending} onClick={save}>
          {pending ? "Menyimpan…" : "Simpan Metode Pembayaran"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={add}>
          + Tambah Metode
        </button>
      </div>
    </div>
  );
}
