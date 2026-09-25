import type { Testimonial } from "@/lib/types";
import { Reveal } from "@/components/ui/Reveal";

function stars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

export function Testimonials({ items }: { items: readonly Testimonial[] }) {
  return (
    <div className="grid gap-4 min-[800px]:grid-cols-3">
      {items.map((testimonial, index) => (
        <Reveal key={`${testimonial.name}-${index}`} delay={index * 0.07} className="h-full">
          <figure className="testi h-full">
            <div className="stars" aria-label={`Rating ${testimonial.rating} dari 5`}>
              {stars(testimonial.rating)}
            </div>
            <blockquote>
              <p>“{testimonial.quote}”</p>
            </blockquote>
            <figcaption className="who">
              <span className="avatar" style={{ background: testimonial.color }} aria-hidden="true">
                {testimonial.initial}
              </span>
              <span className="who-meta">
                <b>{testimonial.name}</b>
                <span>{testimonial.role}</span>
              </span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
