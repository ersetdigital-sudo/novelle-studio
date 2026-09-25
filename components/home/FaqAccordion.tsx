"use client";

import { useState } from "react";

import type { Faq } from "@/lib/types";

export function FaqAccordion({ items }: { items: readonly Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto flex max-w-[780px] flex-col gap-3">
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={faq.question} className="faq" data-open={isOpen}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={`faq-ans-${index}`}
              >
                {faq.question}
                <span className="plus" aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div className="ans" id={`faq-ans-${index}`} role="region">
              {faq.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
