"use client";

import Image from "next/image";
import { useLocale } from "@/components/LocaleProvider";
import { formatMessage } from "@/lib/i18n/dictionaries";
import type { SuggestedMovie } from "@/lib/types";

interface MovieCardProps {
  movie: SuggestedMovie;
  index: number;
  total: number;
  onNext: () => void;
  onRestart: () => void;
}

export function MovieCard({
  movie,
  index,
  total,
  onNext,
  onRestart,
}: MovieCardProps) {
  const { t, locale } = useLocale();
  const isLast = index >= total - 1;

  // Pick the right overview based on current locale; fall back to English if Persian is unavailable
  const overview =
    locale === "fa" ? (movie.overviewFa || movie.overview) : movie.overview;

  return (
    <section className="movie-reveal">
      <div className="movie-poster-wrap">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={formatMessage(t.moviePosterAlt, { title: movie.title })}
            fill
            className="movie-poster"
            sizes="(max-width: 768px) 100vw, 480px"
            priority
          />
        ) : (
          <div className="poster-fallback">
            <span>{movie.title}</span>
          </div>
        )}
        <div className="poster-veil" />
      </div>

      <div className="movie-copy">
        <p className="movie-count">
          {formatMessage(t.suggestionOf, {
            current: index + 1,
            total,
          })}
        </p>
        <h2 className="movie-title" dir="ltr">{movie.title}</h2>
        <p className="movie-meta" dir="ltr">
          {movie.imdbRating ? <span>IMDb {movie.imdbRating.toFixed(1)}</span> : null}
          <span>{movie.imdbRating ? " · " : ""}{movie.year}</span>
          {movie.runtime ? <span> · {movie.runtime} min</span> : null}
        </p>
        {overview ? (
          <p className="movie-overview">{overview}</p>
        ) : null}

        <div className="step-actions">
          <button type="button" className="ghost-btn" onClick={onRestart}>
            {t.startOver}
          </button>
          {!isLast ? (
            <button type="button" className="primary-btn" onClick={onNext}>
              {t.nextMovie}
            </button>
          ) : (
            <button type="button" className="primary-btn" onClick={onRestart}>
              {t.findNewPicks}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
