import type { TextItem } from "@/lib/types";
import { Reveal } from "@/components/ui/Reveal";

export function Steps({ items }: { items: readonly TextItem[] }) {
  return (
    <ol className="grid gap-4.5 min-[800px]:grid-cols-3 min-[800px]:gap-6">
      {items.map((step, index) => (
        <li key={step.title}>
          <Reveal delay={index * 0.08} className="h-full">
            <div className="step h-full">
              <b className="num" aria-hidden="true">
                {index + 1}
              </b>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
