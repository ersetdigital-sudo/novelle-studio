"use client";

import { createContext, useContext, type ReactNode } from "react";

interface ContactContextValue {
  whatsapp: string;
  phoneDisplay: string;
  email: string;
}

const ContactContext = createContext<ContactContextValue | null>(null);

/** Kontak CS dari admin (`content.settings`) — dipasang sekali di root layout. */
export function ContactProvider({
  contact,
  children,
}: {
  contact: ContactContextValue;
  children: ReactNode;
}) {
  return <ContactContext.Provider value={contact}>{children}</ContactContext.Provider>;
}

export function useContact(): ContactContextValue {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error("useContact harus dipakai di dalam ContactProvider");
  }
  return context;
}
