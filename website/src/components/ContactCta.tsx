import { SITE, whatsappLink } from "../data/site";
import { FacebookIcon, MailIcon, PhoneIcon, WhatsAppIcon } from "./Icons";

export default function ContactCta({
  message = "שלום הודיה, אשמח לשמוע פרטים על המופעים של תיאטרון התנערי",
  title = "לפרטים והזמנות",
}: {
  message?: string;
  title?: string;
}) {
  return (
    <section className="contact-cta">
      <div className="container">
        <div className="contact-card">
          <h2 className="section-title">{title}</h2>
          <p>
            דברו עם {SITE.contactName} – נשמח להגיע אליכן לכל אירוע, קהילה,
            סמינריון או ערב נשים.
          </p>
          <div className="contact-actions">
            <a
              className="btn btn-whatsapp btn-lg"
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon size={22} />
              {SITE.phoneDisplay} · שלחו וואטסאפ
            </a>
            <a className="btn btn-outline btn-lg" href={`mailto:${SITE.email}`}>
              <MailIcon size={20} />
              {SITE.email}
            </a>
            <a
              className="btn btn-outline btn-lg"
              href={SITE.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookIcon size={20} />
              הפייסבוק שלנו
            </a>
          </div>
          <p className="contact-phone-line">
            <PhoneIcon size={18} /> או חייגו:{" "}
            <a href="tel:+972546588573">{SITE.phoneDisplay}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
