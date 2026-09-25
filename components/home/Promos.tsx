import type { Promo } from "@/lib/types";
import { Reveal } from "@/components/ui/Reveal";

const variantClass: Record<string, string> = {
  tosca: "promo-tosca",
  orange: "promo-orange",
  indigo: "promo-indigo",
};

export function Promos({ items }: { items: readonly Promo[] }) {
  return (
    <div className="grid gap-4 min-[760px]:grid-cols-[1.3fr_1fr_1fr]">
      {items.map((promo, index) => (
        <Reveal key={`${promo.code}-${index}`} delay={index * 0.06} className="h-full">
          <article className={`promo h-full ${variantClass[promo.variant] ?? "promo-tosca"}`}>
            <div className="ring" aria-hidden="true" />
            <span className="code">{promo.code}</span>
            <h3>{promo.title}</h3>
            <p>{promo.description}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
