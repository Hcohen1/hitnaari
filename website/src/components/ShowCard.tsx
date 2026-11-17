import { Link } from "react-router-dom";
import type { ShowData } from "../data/shows";
import { ChevronLeftIcon } from "./Icons";

export default function ShowCard({ show }: { show: ShowData }) {
  return (
    <Link
      to={show.path}
      className="show-card"
      style={{ "--accent": show.accent, "--accent-soft": show.accentSoft } as React.CSSProperties}
    >
      <div className="show-card-media">
        <img src={show.flyers[0]} alt={`פרוספקט – ${show.title}`} loading="lazy" />
      </div>
      <div className="show-card-body">
        <h3>{show.title}</h3>
        <p>{show.cardTagline}</p>
        <span className="show-card-link">
          לעמוד המופע
          <ChevronLeftIcon size={18} />
        </span>
      </div>
    </Link>
  );
}
