import { Link } from "react-router-dom";
import { SHOWS } from "../data/shows";
import { SITE, whatsappLink } from "../data/site";
import {
  FacebookIcon,
  MailIcon,
  PhoneIcon,
  TheaterMasksIcon,
} from "./Icons";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="footer-brand">
            <span className="brand-icon">
              <TheaterMasksIcon size={24} />
            </span>
            <span className="footer-brand-text">
              <strong>{SITE.name}</strong>
              <small>{SITE.tagline}</small>
            </span>
          </div>
          <p className="footer-about">
            תיאטרון נשים ישראלי שמביא אליכן הצגות מצחיקות, מרגשות ומעוררות
            השראה – עד אליכן, בכל הארץ.
          </p>
          <a
            className="footer-social"
            href={SITE.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="עמוד הפייסבוק של התיאטרון"
          >
            <FacebookIcon size={20} />
            עקבו אחרינו בפייסבוק
          </a>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">המופעים שלנו</h3>
          <ul className="footer-links">
            {SHOWS.map((s) => (
              <li key={s.id}>
                <Link to={s.path}>{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">יצירת קשר</h3>
          <ul className="footer-contact">
            <li>
              <a
                href={whatsappLink(
                  "שלום, אשמח לשמוע פרטים על המופעים של תיאטרון התנערי"
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PhoneIcon size={18} />
                {SITE.contactName}: {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`}>
                <MailIcon size={18} />
                {SITE.email}
              </a>
            </li>
          </ul>
          <p className="footer-note">לפרטים והזמנות – דברו איתנו!</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          © {new Date().getFullYear()} {SITE.name} · כל הזכויות שמורות
        </div>
      </div>
    </footer>
  );
}
