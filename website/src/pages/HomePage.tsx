import { Link } from "react-router-dom";
import { SHOWS } from "../data/shows";
import { SITE, whatsappLink, WHATSAPP_DEFAULT_MSG } from "../data/site";
import ShowCard from "../components/ShowCard";
import Testimonials from "../components/Testimonials";
import ContactCta from "../components/ContactCta";
import { FacebookIcon, TheaterMasksIcon, WhatsAppIcon } from "../components/Icons";

const HIGHLIGHTS = [
  { quote: SHOWS[0].testimonials[2].quote, author: SHOWS[0].testimonials[2].author },
  { quote: SHOWS[1].testimonials[0].quote, author: SHOWS[1].testimonials[0].author },
  { quote: SHOWS[2].testimonials[0].quote, author: SHOWS[2].testimonials[0].author },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-pattern" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="hero-badge">
            <TheaterMasksIcon size={18} />
            תיאטרון נשים
          </div>
          <h1>{SITE.name}</h1>
          <p className="hero-tagline">{SITE.tagline}</p>
          <p className="hero-quote">
            "לצאת מהאולם עם דמעות – אבל של צחוק – ועם חיוך גדול על החיים"
          </p>
          <div className="hero-actions">
            <a
              className="btn btn-whatsapp btn-lg"
              href={whatsappLink(WHATSAPP_DEFAULT_MSG)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon size={22} />
              לפרטים והזמנות
            </a>
            <a className="btn btn-gold btn-lg" href="#shows">
              למופעים שלנו
            </a>
          </div>
        </div>
      </section>

      <section className="shows-section" id="shows">
        <div className="container">
          <h2 className="section-title">המופעים שלנו</h2>
          <p className="section-subtitle">
            ברפרטואר התיאטרון שלושה מופעים איכותיים – אחד מהם בטוח מתאים לאירוע
            שלכן
          </p>
          <div className="shows-grid">
            {SHOWS.map((s) => (
              <ShowCard key={s.id} show={s} />
            ))}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container about-grid">
          <div className="about-text">
            <h2 className="section-title">קצת על התיאטרון</h2>
            <p>
              {SITE.name} הוא תיאטרון נשים ישראלי שמביא את הבמה אליכן – עד אליכן.
              ההצגות שלנו מצחיקות, מרגשות ונוגעות בדיוק בנקודות הכי אמיתיות של
              החיים: זוגיות, אמהות, נעורים ועבודת המידות – והכל בקריצה, בהומור
              וברמת משחק גבוהה.
            </p>
            <p>
              השחקניות שלנו כובשות את הקהל מדי ערב, והקהל חוזר הביתה עם חיוך
              גדול והרבה נקודות למחשבה. מזמינות אתכן להצטרף לחוויה!
            </p>
            <div className="about-actions">
              <a
                className="btn btn-outline"
                href={SITE.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon size={20} />
                עקבו אחרינו בפייסבוק
              </a>
            </div>
          </div>
          <div className="about-gallery">
            <img
              src="/media/flyers/general/2.webp"
              alt="הקהל של תיאטרון התנערי"
              loading="lazy"
            />
            <img
              src="/media/flyers/general/1.webp"
              alt="לוח הופעות של תיאטרון התנערי"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <Testimonials items={HIGHLIGHTS} title="מה אומרים עלינו" />

      <section className="shows-links-section">
        <div className="container">
          <h2 className="section-title">רוצות להכיר כל מופע לעומק?</h2>
          <div className="shows-links">
            {SHOWS.map((s) => (
              <Link
                key={s.id}
                to={s.path}
                className="show-link-chip"
                style={
                  {
                    "--accent": s.accent,
                    "--accent-soft": s.accentSoft,
                  } as React.CSSProperties
                }
              >
                {s.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
