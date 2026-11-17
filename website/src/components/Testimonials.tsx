import type { Testimonial } from "../data/shows";

export default function Testimonials({
  items,
  title = "מה אומרים עלינו",
}: {
  items: Testimonial[];
  title?: string;
}) {
  return (
    <section className="testimonials-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <div className="testimonials-grid">
          {items.map((t, i) => (
            <figure className="testimonial-card" key={i}>
              <blockquote>"{t.quote}"</blockquote>
              <figcaption>– {t.author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
