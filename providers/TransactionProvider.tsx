"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { formatCategoryLabel, getCategory, getNominalItems } from "@/lib/catalog";
import { createToken, createTransactionId, saveTransaction } from "@/lib/history";
import type { Category, NominalItem, TransactionState } from "@/lib/types";

const STORAGE_KEY = "novelle_tx_state_v1";

const EMPTY_STATE: TransactionState = {
  category: null,
  categoryData: null,
  provider: null,
  item: null,
  number: "",
  trxId: "",
  total: 0,
  admin: 0,
  paidAt: null,
  status: "wait",
  token: "",
};

/** Kategori dari snapshot (aman untuk kategori custom) dengan fallback ke data statis. */
function resolveCategory(state: TransactionState): Category | null {
  if (state.categoryData) return state.categoryData;
  return state.category ? getCategory(state.category) ?? null : null;
}

interface TransactionContextValue {
  state: TransactionState;
  /** true setelah state dibaca dari sessionStorage (hindari mismatch SSR). */
  hydrated: boolean;
  category: Category | null;
  items: readonly NominalItem[];
  /** Label panjang kategori + provider, contoh: "PLN — Token Prabayar". */
  label: string;
  selectCategory: (category: Category) => void;
  /** Isi snapshot kategori tanpa mereset input (dipakai setelah hydrate sessionStorage). */
  ensureCategory: (category: Category) => void;
  selectProvider: (provider: string) => void;
  selectItem: (item: NominalItem) => void;
  setNumber: (value: string) => void;
  /** Kunci pesanan: generate kode transaksi. Return false kalau data belum lengkap. */
  createOrder: () => boolean;
  /** Tandai pembayaran selesai + simpan ke riwayat perangkat. */
  finishPayment: () => void;
  reset: () => void;
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TransactionState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Simpan referensi state terbaru supaya callback tetap stabil.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Pulihkan state dari sessionStorage setelah mount (aman untuk refresh halaman).
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<TransactionState>;
        setState({ ...EMPTY_STATE, ...parsed });
      }
    } catch {
      // sessionStorage diblokir — mulai dari state kosong.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // abaikan
    }
  }, [state, hydrated]);

  const selectCategory = useCallback((category: Category) => {
    setState({
      ...EMPTY_STATE,
      category: category.slug,
      categoryData: category,
      provider: category.providers?.list[0] ?? null,
      admin: category.admin,
    });
  }, []);

  const ensureCategory = useCallback((category: Category) => {
    setState((prev) =>
      prev.category === category.slug && prev.categoryData
        ? prev
        : { ...prev, category: category.slug, categoryData: category },
    );
  }, []);

  const selectProvider = useCallback((provider: string) => {
    setState((prev) => ({ ...prev, provider, item: null, total: 0 }));
  }, []);

  const selectItem = useCallback((item: NominalItem) => {
    setState((prev) => ({
      ...prev,
      item,
      total: item.harga + prev.admin,
    }));
  }, []);

  const setNumber = useCallback((value: string) => {
    setState((prev) => ({ ...prev, number: value }));
  }, []);

  const createOrder = useCallback((): boolean => {
    const current = stateRef.current;
    const cat = resolveCategory(current);
    if (!cat || !current.item || current.number.length < cat.field.minLength) return false;
    setState((prev) => ({
      ...prev,
      trxId: prev.trxId || createTransactionId(),
      paidAt: null,
      status: "wait",
      token: "",
    }));
    return true;
  }, []);

  const finishPayment = useCallback((): void => {
    const current = stateRef.current;
    if (!current.item || !current.category) return;
    const category = resolveCategory(current);
    if (!category) return;

    const token = current.token || createToken(current.category);
    const paidAt = current.paidAt ?? new Date().toISOString();

    saveTransaction({
      id: current.trxId,
      produk: `${formatCategoryLabel(category, current.provider)} · ${current.item.nama}`,
      tujuanLabel: category.field.label,
      tujuan: current.number,
      total: current.total,
      token,
      waktu: paidAt,
      status: "ok",
    });

    setState((prev) => ({ ...prev, status: "ok", token, paidAt }));
  }, []);

  const reset = useCallback(() => setState(EMPTY_STATE), []);

  const value = useMemo<TransactionContextValue>(() => {
    const category = resolveCategory(state);
    return {
      state,
      hydrated,
      category: category ?? null,
      items: category ? getNominalItems(category, state.provider) : [],
      label: category ? formatCategoryLabel(category, state.provider) : "—",
      selectCategory,
      ensureCategory,
      selectProvider,
      selectItem,
      setNumber,
      createOrder,
      finishPayment,
      reset,
    };
  }, [
    state,
    hydrated,
    selectCategory,
    ensureCategory,
    selectProvider,
    selectItem,
    setNumber,
    createOrder,
    finishPayment,
    reset,
  ]);

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction(): TransactionContextValue {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransaction harus dipakai di dalam TransactionProvider");
  }
  return context;
}
