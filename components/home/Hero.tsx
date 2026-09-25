import Link from "next/link";

import type { SiteContent } from "@/lib/types";
import { HeroIllustration } from "@/components/home/HeroIllustration";
import { Reveal } from "@/components/ui/Reveal";

export function Hero({ content }: { content: SiteContent["hero"] }) {
  return (
    <section className="hero relative overflow-hidden pt-11 pb-15 min-[960px]:pt-17.5 min-[960px]:pb-22.5">
      <div className="blob -top-22.5 -left-27.5 h-80 w-80 bg-tosca-soft" aria-hidden="true" />
      <div className="blob right-[-60px] -bottom-17.5 h-55 w-55 bg-orange-soft" aria-hidden="true" />
      <div className="sq top-22.5 right-[22%] h-6.5 w-6.5 rotate-[22deg] bg-orange opacity-85" aria-hidden="true" />
      <div className="sq bottom-30 left-[8%] h-4 w-4 -rotate-15 bg-tosca" aria-hidden="true" />

      <div className="wrap relative z-2 grid items-center gap-8.5 min-[960px]:grid-cols-[1fr_1.05fr] min-[960px]:gap-7.5">
        <Reveal immediate>
          <p className="pill">{content.badge}</p>
          <h1>
            {content.title} <em>{content.accent}</em>
            {content.titleSuffix}
          </h1>
          <p className="mt-4 mb-6.5 max-w-120 text-[17px] text-muted">{content.lead}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/#kategori" className="btn btn-orange">
              {content.primaryCta}
            </Link>
            <Link href="/#cara" className="btn btn-ghost">
              {content.secondaryCta}
            </Link>
          </div>
          <dl className="hero-stats mt-8.5 flex flex-wrap gap-6.5">
            {content.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal immediate delay={0.12}>
          <HeroIllustration className="h-auto w-full" />
        </Reveal>
      </div>
    </section>
  );
}
