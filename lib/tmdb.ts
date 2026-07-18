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
): Promise<TmdbSearchResult | null> {
  const url = new URL(`${TMDB_BASE}/search/movie`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", movie.title);
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("year", String(movie.year));

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

export async function enrichMovies(
  movies: AiMovie[],
): Promise<SuggestedMovie[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured");
  }

  const enriched = await Promise.all(
    movies.map(async (movie) => {
      try {
        const match = await searchMovie(movie, apiKey);
        if (!match) {
          return {
            ...movie,
            tmdbId: null,
            posterUrl: null,
            overview: null,
            voteAverage: null,
          } satisfies SuggestedMovie;
        }

        return {
          ...movie,
          tmdbId: match.id,
          posterUrl: match.poster_path
            ? `${TMDB_IMAGE_BASE}${match.poster_path}`
            : null,
          overview: match.overview || null,
          voteAverage:
            typeof match.vote_average === "number" ? match.vote_average : null,
        } satisfies SuggestedMovie;
      } catch {
        return {
          ...movie,
          tmdbId: null,
          posterUrl: null,
          overview: null,
          voteAverage: null,
        } satisfies SuggestedMovie;
      }
    }),
  );

  return enriched;
}
