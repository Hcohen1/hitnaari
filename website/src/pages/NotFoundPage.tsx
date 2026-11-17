import { Link } from "react-router-dom";
import { SHOWS } from "../data/shows";

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <div className="container">
        <h1>404</h1>
        <p>אופס! הדף שחיפשתן לא נמצא.</p>
        <div className="not-found-links">
          <Link className="btn btn-gold" to="/">
            חזרה לדף הבית
          </Link>
          {SHOWS.map((s) => (
            <Link className="btn btn-outline" key={s.id} to={s.path}>
              {s.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
