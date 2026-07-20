import type { SuggestedMovie } from "./types";

const STORAGE_KEY = "filmchi-watched";

export interface WatchedMovie {
  title: string;
  year: number;
  imdbRating: number;
  posterUrl: string | null;
  overview: string | null;
  overviewFa: string | null;
  runtime: number | null;
  reason: string;
  savedAt: number; // timestamp
}

export function getWatchedMovies(): WatchedMovie[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WatchedMovie[];
  } catch {
    return [];
  }
}

export function addWatchedMovie(movie: SuggestedMovie): void {
  if (typeof window === "undefined") return;
  const existing = getWatchedMovies();
  // Avoid duplicates by title (case-insensitive)
  const alreadyExists = existing.some(
    (m) => m.title.toLowerCase() === movie.title.toLowerCase(),
  );
  if (alreadyExists) return;

  const entry: WatchedMovie = {
    title: movie.title,
    year: movie.year,
    imdbRating: movie.imdbRating,
    posterUrl: movie.posterUrl,
    overview: movie.overview,
    overviewFa: movie.overviewFa,
    runtime: movie.runtime,
    reason: movie.reason,
    savedAt: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing]));
}

export function removeWatchedMovie(title: string): void {
  if (typeof window === "undefined") return;
  const existing = getWatchedMovies();
  const filtered = existing.filter(
    (m) => m.title.toLowerCase() !== title.toLowerCase(),
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function isWatched(title: string): boolean {
  return getWatchedMovies().some(
    (m) => m.title.toLowerCase() === title.toLowerCase(),
  );
}

export function getWatchedTitles(): string[] {
  return getWatchedMovies().map((m) => m.title);
}
