import { NextResponse } from "next/server";
import { NaraRouterError, suggestMovies } from "@/lib/nararouter";
import { enrichMovies } from "@/lib/tmdb";
import type {
  Company,
  Gender,
  Mood,
  RecommendRequest,
  WatchTime,
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
  "adventurous",
  "nostalgic",
];
const WATCH_TIMES: WatchTime[] = ["morning", "afternoon", "night"];
const COMPANIES: Company[] = [
  "alone",
  "family",
  "friends",
  "partner",
  "colleagues",
];

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
    mood: data.mood,
    story: typeof data.story === "string" ? data.story : "",
    watchTime: data.watchTime,
    company: data.company,
  };
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = parseBody(json);
    const movies = await suggestMovies(payload);
    const enriched = await enrichMovies(movies);

    return NextResponse.json({ movies: enriched });
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
