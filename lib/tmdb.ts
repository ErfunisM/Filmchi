import type { AiMovie, SuggestedMovie } from "./types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w780";

interface TmdbSearchResult {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  overview?: string;
  vote_average?: number;
}

interface TmdbSearchResponse {
  results?: TmdbSearchResult[];
}

interface TmdbMovieDetails {
  runtime?: number | null;
}

function scoreMatch(candidate: TmdbSearchResult, movie: AiMovie): number {
  const candidateYear = candidate.release_date
    ? Number(candidate.release_date.slice(0, 4))
    : null;
  let score = 0;

  if (candidateYear === movie.year) score += 10;
  else if (candidateYear && Math.abs(candidateYear - movie.year) <= 1) score += 5;

  if (candidate.poster_path) score += 2;
  if ((candidate.vote_average ?? 0) > 0) score += 1;

  return score;
}

async function searchMovie(
  movie: AiMovie,
  apiKey: string,
  language: string,
): Promise<TmdbSearchResult | null> {
  const url = new URL(`${TMDB_BASE}/search/movie`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", movie.title);
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("year", String(movie.year));
  url.searchParams.set("language", language);

  const response = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as TmdbSearchResponse;
  const results = data.results ?? [];
  if (results.length === 0) {
    // Retry without year constraint
    const fallbackUrl = new URL(`${TMDB_BASE}/search/movie`);
    fallbackUrl.searchParams.set("api_key", apiKey);
    fallbackUrl.searchParams.set("query", movie.title);
    fallbackUrl.searchParams.set("include_adult", "false");
    fallbackUrl.searchParams.set("language", language);

    const fallbackResponse = await fetch(fallbackUrl.toString(), {
      next: { revalidate: 3600 },
    });
    if (!fallbackResponse.ok) return null;
    const fallbackData = (await fallbackResponse.json()) as TmdbSearchResponse;
    const fallbackResults = fallbackData.results ?? [];
    if (fallbackResults.length === 0) return null;
    return [...fallbackResults].sort(
      (a, b) => scoreMatch(b, movie) - scoreMatch(a, movie),
    )[0];
  }

  return [...results].sort(
    (a, b) => scoreMatch(b, movie) - scoreMatch(a, movie),
  )[0];
}

async function fetchRuntime(
  tmdbId: number,
  apiKey: string,
): Promise<number | null> {
  const url = new URL(`${TMDB_BASE}/movie/${tmdbId}`);
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!response.ok) return null;

  const data = (await response.json()) as TmdbMovieDetails;
  return typeof data.runtime === "number" && data.runtime > 0
    ? data.runtime
    : null;
}

export async function enrichMovies(
  movies: AiMovie[],
  locale: "en" | "fa" = "en",
): Promise<SuggestedMovie[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured");
  }

  // locale param kept for future use (e.g. reason language via nararouter)
  void locale;

  const enriched = await Promise.all(
    movies.map(async (movie) => {
      try {
        // Always fetch English for poster + base data
        const enMatch = await searchMovie(movie, apiKey, "en-US");

        if (!enMatch) {
          return {
            ...movie,
            tmdbId: null,
            posterUrl: null,
            overview: null,
            overviewFa: null,
            runtime: null,
            voteAverage: null,
          } satisfies SuggestedMovie;
        }

        // Fetch Persian overview and runtime in parallel
        const [faMatch, runtime] = await Promise.all([
          searchMovie(movie, apiKey, "fa-IR"),
          fetchRuntime(enMatch.id, apiKey),
        ]);
        const overviewFa = faMatch?.overview || null;

        return {
          ...movie,
          tmdbId: enMatch.id,
          posterUrl: enMatch.poster_path
            ? `${TMDB_IMAGE_BASE}${enMatch.poster_path}`
            : null,
          overview: enMatch.overview || null,
          overviewFa,
          runtime,
          voteAverage:
            typeof enMatch.vote_average === "number" ? enMatch.vote_average : null,
        } satisfies SuggestedMovie;
      } catch {
        return {
          ...movie,
          tmdbId: null,
          posterUrl: null,
          overview: null,
          overviewFa: null,
          runtime: null,
          voteAverage: null,
        } satisfies SuggestedMovie;
      }
    }),
  );

  return enriched;
}
