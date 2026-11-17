import { Link, useParams } from "react-router-dom";
import { SHOWS } from "../data/shows";
import Testimonials from "../components/Testimonials";
import MediaGallery from "../components/MediaGallery";
import ContactCta from "../components/ContactCta";
import { ChevronLeftIcon, WhatsAppIcon } from "../components/Icons";
import { whatsappLink } from "../data/site";
import NotFoundPage from "./NotFoundPage";

export default function ShowPage() {
  const { showId } = useParams<{ showId: string }>();
  const show = SHOWS.find((s) => s.id === showId);

  if (!show) {
    return <NotFoundPage />;
  }

  const otherShows = SHOWS.filter((s) => s.id !== show.id);

  return (
    <div className="show-page" style={{ "--accent": show.accent, "--accent-soft": show.accentSoft } as React.CSSProperties}>
      <section className="show-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="פירורי לחם">
            <Link to="/">בית</Link>
            <ChevronLeftIcon size={14} />
            <span aria-current="page">{show.title}</span>
          </nav>
          <h1>{show.title}</h1>
          <p className="show-tagline">{show.tagline}</p>
          <a
            className="btn btn-whatsapp btn-lg"
            href={whatsappLink(
              `שלום, אשמח לשמוע פרטים על ההצגה "${show.title}"`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={22} />
            לפרטים והזמנת המופע
          </a>
        </div>
      </section>

      <section className="show-about">
        <div className="container show-about-grid">
          <div className="show-description">
            <h2 className="section-title">על המופע</h2>
            {show.description.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <aside className="show-audience">
            <h3>מתאים במיוחד ל:</h3>
            <ul>
              {show.audience.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <MediaGallery
        showTitle={show.title}
        flyers={show.flyers}
        videos={show.videos}
      />

      <Testimonials items={show.testimonials} title="חוות דעת מהקהל" />

      <ContactCta
        message={`שלום, אשמח לשמוע פרטים על ההצגה "${show.title}"`}
      />

      <section className="more-shows">
        <div className="container">
          <h2 className="section-title">מופעים נוספים</h2>
          <div className="more-shows-grid">
            {otherShows.map((s) => (
              <Link
                key={s.id}
                to={s.path}
                className="show-card"
                style={{ "--accent": s.accent, "--accent-soft": s.accentSoft } as React.CSSProperties}
              >
                <div className="show-card-media">
                  <img
                    src={s.flyers[0]}
                    alt={`פרוספקט – ${s.title}`}
                    loading="lazy"
                  />
                </div>
                <div className="show-card-body">
                  <h3>{s.title}</h3>
                  <p>{s.cardTagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
