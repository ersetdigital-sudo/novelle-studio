import { BoltIcon, CardIcon, ShieldCheckIcon } from "@/lib/icons";
import type { TextItem } from "@/lib/types";
import { Reveal } from "@/components/ui/Reveal";

const ICONS = [BoltIcon, ShieldCheckIcon, CardIcon];

export function WhyUs({
  header,
  items,
}: {
  header: { kicker: string; title: string };
  items: readonly TextItem[];
}) {
  return (
    <div className="why">
      <div className="blob -top-22.5 right-[-60px] h-65 w-65 bg-tosca opacity-25" aria-hidden="true" />
      <div className="sec-head relative z-2">
        <p className="kicker">{header.kicker}</p>
        <h2>{header.title}</h2>
      </div>
      <ul className="relative z-2 grid gap-4.5 min-[800px]:grid-cols-3 min-[800px]:gap-5.5">
        {items.map((item, index) => {
          const Icon = ICONS[index % ICONS.length]!;
          return (
            <li key={item.title}>
              <Reveal delay={index * 0.08} className="h-full">
                <div className="why-card h-full">
                  <div className="ic" aria-hidden="true">
                    <Icon />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
