import { NextResponse } from "next/server";
import { NaraRouterError, suggestMovies, filterRelevantWatched } from "@/lib/nararouter";
import { enrichMovies } from "@/lib/tmdb";
import type {
  CandidateWatchedMovie,
  Company,
  Gender,
  Mood,
  RecommendRequest,
  WatchTime,
  Weather,
} from "@/lib/types";

const GENDERS: Gender[] = [
  "female",
  "male",
  "non-binary",
  "prefer-not-to-say",
];
const MOODS: Mood[] = [
  "happy",
  "sad",
  "romantic",
  "thrill",
  "chill",
];
const WATCH_TIMES: WatchTime[] = ["morning", "afternoon", "night"];
const COMPANIES: Company[] = [
  "alone",
  "family",
  "friends",
  "partner",
];
const WEATHERS: Weather[] = ["sunny", "cloudy", "rainy", "snowy"];

function isOneOf<T extends string>(value: unknown, list: T[]): value is T {
  return typeof value === "string" && list.includes(value as T);
}

function parseBody(body: unknown): RecommendRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const data = body as Record<string, unknown>;

  if (!isOneOf(data.gender, GENDERS)) throw new Error("Invalid gender");
  if (
    typeof data.age !== "number" ||
    !Number.isFinite(data.age) ||
    data.age < 1 ||
    data.age > 120
  ) {
    throw new Error("Age must be a number between 1 and 120");
  }
  if (!isOneOf(data.mood, MOODS)) throw new Error("Invalid mood");
  if (data.weather && !isOneOf(data.weather, WEATHERS)) throw new Error("Invalid weather");
  if (!isOneOf(data.watchTime, WATCH_TIMES)) {
    throw new Error("Invalid watch time");
  }
  if (!isOneOf(data.company, COMPANIES)) throw new Error("Invalid company");

  const country =
    typeof data.country === "string" ? data.country.trim() : undefined;
  const city = typeof data.city === "string" ? data.city.trim() : undefined;
  const locationLabel =
    typeof data.locationLabel === "string"
      ? data.locationLabel.trim()
      : undefined;

  if (!locationLabel && !(country && city)) {
    throw new Error("Location is required");
  }

  return {
    gender: data.gender,
    age: data.age,
    country,
    city,
    locationLabel,
    latitude: typeof data.latitude === "number" ? data.latitude : null,
    longitude: typeof data.longitude === "number" ? data.longitude : null,
    weather: (data.weather && isOneOf(data.weather, WEATHERS)) ? data.weather : "sunny",
    mood: data.mood,
    story: typeof data.story === "string" ? data.story : "",
    watchTime: data.watchTime,
    company: data.company,
    locale: data.locale === "fa" ? "fa" : "en",
    seenTitles: Array.isArray(data.seenTitles)
      ? (data.seenTitles as unknown[])
          .filter((t): t is string => typeof t === "string")
          .slice(0, 50)
      : [],
  };
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = parseBody(json);

    const rawWatched = Array.isArray(
      (json as Record<string, unknown>).watchedMoviesData,
    )
      ? ((json as Record<string, unknown>).watchedMoviesData as Record<
          string,
          unknown
        >[])
      : [];

    const candidateWatched: CandidateWatchedMovie[] = rawWatched
      .filter(
        (w): w is Record<string, unknown> =>
          Boolean(w && typeof w === "object" && typeof w.title === "string"),
      )
      .map((w) => ({
        title: String(w.title).trim(),
        year: typeof w.year === "number" ? w.year : undefined,
        overview: typeof w.overview === "string" ? w.overview : null,
        overviewFa: typeof w.overviewFa === "string" ? w.overviewFa : null,
        reason: typeof w.reason === "string" ? w.reason : undefined,
        genres: Array.isArray(w.genres)
          ? (w.genres as unknown[]).filter((g): g is string => typeof g === "string")
          : [],
      }));

    // Run suggest + watched-filter in parallel
    const [movies, relevantTitles] = await Promise.all([
      suggestMovies(payload),
      filterRelevantWatched(payload, candidateWatched),
    ]);

    const enriched = await enrichMovies(movies, payload.locale);

    // Build relevantWatched from rawWatched matched by title
    const relevantWatched = relevantTitles
      .map((title) =>
        rawWatched.find(
          (w) =>
            typeof w.title === "string" &&
            w.title.toLowerCase() === title.toLowerCase(),
        ),
      )
      .filter((w): w is Record<string, unknown> => w !== undefined)
      .map((w) => ({
        title: String(w.title ?? ""),
        year: Number(w.year ?? 0),
        imdbRating: Number(w.imdbRating ?? 0),
        reason: String(w.reason ?? ""),
        tmdbId: null,
        posterUrl: typeof w.posterUrl === "string" ? w.posterUrl : null,
        overview: typeof w.overview === "string" ? w.overview : null,
        overviewFa: typeof w.overviewFa === "string" ? w.overviewFa : null,
        runtime: typeof w.runtime === "number" ? w.runtime : null,
        voteAverage: null,
        genres: Array.isArray(w.genres)
          ? (w.genres as unknown[]).filter((g): g is string => typeof g === "string")
          : [],
      }));

    return NextResponse.json({ movies: enriched, relevantWatched });
  } catch (error) {
    if (error instanceof NaraRouterError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to get recommendations";
    const status =
      message.startsWith("Invalid") ||
      message.includes("required") ||
      message.startsWith("Age must")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
