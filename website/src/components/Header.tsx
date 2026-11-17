import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { SHOWS } from "../data/shows";
import { SITE, whatsappLink, WHATSAPP_DEFAULT_MSG } from "../data/site";
import { TheaterMasksIcon, WhatsAppIcon } from "./Icons";

export default function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "בית", end: true },
    ...SHOWS.map((s) => ({ to: s.path, label: s.navTitle, end: false })),
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-icon">
            <TheaterMasksIcon size={26} />
          </span>
          <span className="brand-text">
            <span className="brand-name">{SITE.name}</span>
            <span className="brand-sub">תיאטרון נשים</span>
          </span>
        </Link>

        <button
          className={`nav-toggle ${open ? "open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="תפריט ניווט"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`main-nav ${open ? "open" : ""}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {l.label}
            </NavLink>
          ))}
          <a
            className="btn btn-whatsapp header-cta"
            href={whatsappLink(WHATSAPP_DEFAULT_MSG)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={18} />
            להזמנות
          </a>
        </nav>
      </div>
    </header>
  );
}
