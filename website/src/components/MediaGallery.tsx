import { useCallback, useEffect, useState } from "react";
import type { VideoItem } from "../data/shows";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./Icons";

function Lightbox({
  images,
  index,
  onClose,
  onMove,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onMove: (delta: number) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onMove(-1);
      if (e.key === "ArrowRight") onMove(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onMove]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="סגירה">
        <CloseIcon size={28} />
      </button>
      <button
        className="lightbox-nav prev"
        onClick={(e) => {
          e.stopPropagation();
          onMove(-1);
        }}
        aria-label="תמונה קודמת"
      >
        <ChevronRightIcon size={32} />
      </button>
      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="lightbox-nav next"
        onClick={(e) => {
          e.stopPropagation();
          onMove(1);
        }}
        aria-label="תמונה הבאה"
      >
        <ChevronLeftIcon size={32} />
      </button>
      <div className="lightbox-counter">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}

export default function MediaGallery({
  showTitle,
  flyers,
  videos,
}: {
  showTitle: string;
  flyers: string[];
  videos: VideoItem[];
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const move = useCallback(
    (delta: number) => {
      setLightboxIndex((cur) =>
        cur === null ? cur : (cur + delta + flyers.length) % flyers.length
      );
    },
    [flyers.length]
  );

  return (
    <section className="media-section">
      <div className="container">
        <h2 className="section-title">הפרוספקטים</h2>
        <div className="flyers-grid">
          {flyers.map((src, i) => (
            <button
              key={src}
              className="flyer-thumb"
              onClick={() => setLightboxIndex(i)}
              aria-label={`פתיחת פרוספקט ${i + 1} – ${showTitle}`}
            >
              <img src={src} alt={`פרוספקט ${i + 1} – ${showTitle}`} loading="lazy" />
            </button>
          ))}
        </div>

        {videos.length > 0 && (
          <>
            <h2 className="section-title">קטעים מהמופע</h2>
            <div className="videos-grid">
              {videos.map((v) => (
                <figure className="video-card" key={v.src}>
                  <video controls preload="metadata" poster={v.poster}>
                    <source src={v.src} type="video/mp4" />
                  </video>
                  {v.label && <figcaption>{v.label}</figcaption>}
                </figure>
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={flyers}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onMove={move}
        />
      )}
    </section>
  );
}
