"use client";

import { createContext, useContext, type ReactNode } from "react";

import { getNominalItems as pickItems } from "@/lib/catalog";
import { rupiah } from "@/lib/format";
import type { NominalItem, PaymentMethod, ResolvedCategory } from "@/lib/types";

interface CatalogContextValue {
  categories: ResolvedCategory[];
  paymentMethods: PaymentMethod[];
  /** Harga & admin dihitung dari kategori server, bukan dari browser. */
  itemsFor: (category: ResolvedCategory, provider: string | null) => readonly NominalItem[];
  formatPrice: (value: number) => string;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({
  categories,
  paymentMethods,
  children,
}: {
  categories: ResolvedCategory[];
  paymentMethods: PaymentMethod[];
  children: ReactNode;
}) {
  return (
    <CatalogContext.Provider
      value={{
        categories,
        paymentMethods,
        itemsFor: pickItems,
        formatPrice: rupiah,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog harus dipakai di dalam CatalogProvider");
  }
  return context;
}
