import type { Metadata } from "next";

import { site } from "@/data/site";
import { getCategoryOverview } from "@/lib/store/catalog";
import { getContentSnapshot } from "@/lib/store/content";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { Hero } from "@/components/home/Hero";
import { Promos } from "@/components/home/Promos";
import { Steps } from "@/components/home/Steps";
import { Testimonials } from "@/components/home/Testimonials";
import { WhyUs } from "@/components/home/WhyUs";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: { absolute: `${site.name} — ${site.tagline}` },
  description: site.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [{ content }, { overview }] = await Promise.all([
    getContentSnapshot(),
    getCategoryOverview(),
  ]);

  const visible = overview.filter((item) => item.isActive);

  /** Structured data: FAQ + daftar layanan (membantu rich result & mesin AI). */
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kategori layanan Novelle Studio",
    itemListElement: visible.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: category.name,
      description: category.short,
      url: `${site.url}/produk/${category.slug}`,
    })),
  };

  return (
    <main>
      <Hero content={content.hero} />

      <section className="sec" id="kategori">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <p className="kicker">Layanan Kami</p>
              <h2>Delapan kategori, satu tempat</h2>
              <p>
                Pilih salah satu kotak di bawah untuk mulai transaksi. Tanpa login, tanpa
                aplikasi tambahan.
              </p>
            </div>
          </Reveal>
          <CategoryGrid categories={visible} />
        </div>
      </section>

      <section className="sec" id="kenapa">
        <div className="wrap">
          <WhyUs header={content.why} items={content.why.items} />
        </div>
      </section>

      <section className="sec" id="cara">
        <div className="wrap">
          <Reveal>
            <div className="sec-head sec-head-center">
              <p className="kicker">{content.steps.kicker}</p>
              <h2>{content.steps.title}</h2>
              <p>{content.steps.subtitle}</p>
            </div>
          </Reveal>
          <Steps items={content.steps.items} />
        </div>
      </section>

      <section className="sec" id="promo">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <p className="kicker">{content.promos.kicker}</p>
              <h2>{content.promos.title}</h2>
            </div>
          </Reveal>
          <Promos items={content.promos.items} />
        </div>
      </section>

      <section className="sec" id="testimoni">
        <div className="wrap">
          <Reveal>
            <div className="sec-head sec-head-center">
              <p className="kicker">{content.testimonials.kicker}</p>
              <h2>{content.testimonials.title}</h2>
            </div>
          </Reveal>
          <Testimonials items={content.testimonials.items} />
        </div>
      </section>

      <section className="sec" id="faq">
        <div className="wrap">
          <Reveal>
            <div className="sec-head sec-head-center">
              <p className="kicker">{content.faqs.kicker}</p>
              <h2>{content.faqs.title}</h2>
            </div>
          </Reveal>
          <FaqAccordion items={content.faqs.items} />
        </div>
      </section>

      <JsonLd data={faqSchema} />
      <JsonLd data={servicesSchema} />
    </main>
  );
}
