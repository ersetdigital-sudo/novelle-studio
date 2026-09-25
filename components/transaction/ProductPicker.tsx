"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CategoryIcon } from "@/lib/icons";
import { rupiah } from "@/lib/format";
import type { ResolvedCategory } from "@/lib/types";
import { getNominalItems } from "@/lib/catalog";
import { useTransaction } from "@/providers/TransactionProvider";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FlowSteps } from "@/components/ui/FlowSteps";
import { NominalGrid } from "@/components/transaction/NominalGrid";
import { ProviderChips } from "@/components/transaction/ProviderChips";

export function ProductPicker({ category }: { category: ResolvedCategory }) {
  const router = useRouter();
  const { state, hydrated, selectCategory, ensureCategory, selectProvider, selectItem, setNumber, createOrder } =
    useTransaction();
  const [error, setError] = useState("");

  const items = getNominalItems(category, state.provider);

  // Kalau kategori yang dibuka berbeda dari state, reset pilihan.
  useEffect(() => {
    if (!hydrated) return;
    if (state.category !== category.slug) {
      selectCategory(category);
    } else if (!state.categoryData) {
      ensureCategory(category);
    }
  }, [hydrated, state.category, state.categoryData, category, selectCategory, ensureCategory]);

  const isNumberValid = state.number.length >= category.field.minLength;
  const canContinue = Boolean(state.item) && isNumberValid;

  function handleContinue() {
    if (!canContinue) {
      setError("Lengkapi nomor tujuan dan pilih nominal terlebih dahulu.");
      return;
    }
    if (createOrder()) {
      router.push("/checkout");
    }
  }

  return (
    <>
      <Breadcrumb items={[{ label: category.name }]} />
      <FlowSteps activeStep={1} />

      <div className="grid gap-5 min-[900px]:grid-cols-[1.6fr_1fr] min-[900px]:items-start">
        <div className="panel">
          <div className="panel-head flex items-center gap-3.5">
            <span className="ic" style={{ background: category.tint }}>
              <CategoryIcon slug={category.slug} icon={category.icon} />
            </span>
            <div>
              <h2>{category.name}</h2>
              <span>{category.short}</span>
            </div>
          </div>

          {category.providers && (
            <ProviderChips
              label={category.providers.label}
              providers={category.providers.list}
              active={state.provider}
              onSelect={(provider) => {
                selectProvider(provider);
                setError("");
              }}
            />
          )}

          <label className="label-fl" htmlFor="nomor-tujuan">
            {category.field.label}
          </label>
          <input
            id="nomor-tujuan"
            className="input"
            type={category.field.type}
            inputMode="numeric"
            autoComplete="off"
            placeholder={category.field.placeholder}
            value={state.number}
            onChange={(event) => {
              setNumber(event.target.value.trim());
              setError("");
            }}
          />
          <p className="hint">{category.field.hint}</p>
          {error && (
            <p className="err" role="alert">
              {error}
            </p>
          )}

          <div className="sep" />

          <p className="label-fl">{category.nomLabel}</p>
          <NominalGrid
            items={items}
            selected={state.item}
            onSelect={(item) => {
              selectItem(item);
              setError("");
            }}
          />

          <div className="mt-5 min-[900px]:hidden">
            <button
              type="button"
              className="btn btn-orange btn-block"
              disabled={!canContinue}
              onClick={handleContinue}
            >
              Lanjut ke Pembayaran
            </button>
            <p className="hint text-center">Tanpa login. Transaksi sebagai tamu.</p>
          </div>
        </div>

        <div className="min-[900px]:sticky min-[900px]:top-24">
          <div className="panel-soft">
            <h3 className="mb-3.5 text-[18px]">Ringkasan Sementara</h3>
            <div className="row">
              <span>Produk</span>
              <b>{state.item ? `${category.name} · ${state.item.nama}` : hydrated ? category.name : "—"}</b>
            </div>
            <div className="row">
              <span>{category.field.label}</span>
              <b>{state.number || "—"}</b>
            </div>
            <div className="row">
              <span>Harga</span>
              <b>{state.item ? rupiah(state.item.harga) : "—"}</b>
            </div>
            <div className="row">
              <span>Biaya Admin</span>
              <b>{category.admin ? rupiah(category.admin) : "Gratis"}</b>
            </div>
            <div className="row row-total">
              <span>Total Bayar</span>
              <b>{rupiah(state.total)}</b>
            </div>
            <div className="h-4" />
            <button
              type="button"
              className="btn btn-orange btn-block max-[900px]:hidden"
              disabled={!canContinue}
              onClick={handleContinue}
            >
              Lanjut ke Pembayaran
            </button>
            <p className="hint text-center">Tanpa login. Transaksi sebagai tamu.</p>
          </div>
        </div>
      </div>
    </>
  );
}
