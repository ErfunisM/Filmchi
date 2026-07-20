import type { AiMovie, RecommendRequest } from "./types";

const NARAROUTER_URL = "https://router.bynara.id/v1/chat/completions";

function buildPrompt(data: RecommendRequest): string {
  const location =
    data.locationLabel ||
    [data.city, data.country].filter(Boolean).join(", ") ||
    "unspecified";

  const isFarsi = data.locale === "fa";

  const reasonInstruction = isFarsi
    ? 'یک جمله کوتاه به زبان فارسی که توضیح می‌دهد چرا این فیلم مناسب است'
    : "One short sentence in English explaining why this fits";

  const seenSection =
    data.seenTitles && data.seenTitles.length > 0
      ? `\n- Movies already seen (DO NOT suggest these): ${data.seenTitles.join(", ")}`
      : "";

  return `You are a movie recommendation expert. Suggest exactly 5 movies based on this viewer profile.

Viewer profile:
- Gender: ${data.gender}
- Age: ${data.age}
- Location: ${location}
- Current mood: ${data.mood}
- Mood/story details: ${data.story?.trim() || "none provided"}
- Preferred watch time: ${data.watchTime}
- Watching with: ${data.company}${seenSection}

Rules:
- Only suggest movies with IMDb rating of 7.0 or higher
- Prefer well-known, widely available films
- Match the mood, company, and time of day
- Return ONLY valid JSON, no markdown, no commentary
- The "reason" field must be: ${reasonInstruction}
- Schema:
{
  "movies": [
    {
      "title": "Movie Title",
      "year": 2010,
      "imdbRating": 8.1,
      "reason": "..."
    }
  ]
}
Exactly 5 movies in the array.`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in NaraRouter response");
    return JSON.parse(match[0]);
  }
}

function normalizeMovies(payload: unknown): AiMovie[] {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid NaraRouter payload");
  }

  const movies = (payload as { movies?: unknown }).movies;
  if (!Array.isArray(movies)) {
    throw new Error("NaraRouter response missing movies array");
  }

  const normalized = movies
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const movie = item as Record<string, unknown>;
      const title = String(movie.title ?? "").trim();
      const year = Number(movie.year);
      const imdbRating = Number(movie.imdbRating ?? movie.imdb_rating);
      const reason = String(movie.reason ?? "").trim();

      if (!title || !Number.isFinite(year) || !Number.isFinite(imdbRating)) {
        return null;
      }

      return {
        title,
        year: Math.round(year),
        imdbRating,
        reason: reason || "A strong match for your mood.",
      } satisfies AiMovie;
    })
    .filter((movie): movie is AiMovie => movie !== null)
    .filter((movie) => movie.imdbRating >= 7)
    .slice(0, 5);

  if (normalized.length < 5) {
    throw new Error("NaraRouter returned fewer than 5 valid movies");
  }

  return normalized;
}

export class NaraRouterError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "NaraRouterError";
    this.status = status;
  }
}

function mapHttpError(status: number, errorText: string): NaraRouterError {
  const lower = errorText.toLowerCase();

  let apiMessage = "";
  try {
    const parsed = JSON.parse(errorText) as {
      error?: { message?: string; type?: string };
      message?: string;
    };
    apiMessage =
      parsed.error?.message || parsed.message || errorText.slice(0, 300);
  } catch {
    apiMessage = errorText.slice(0, 300);
  }

  if (lower.includes("telegram_required") || lower.includes("bind your telegram")) {
    return new NaraRouterError(
      "NaraRouter requires linking Telegram. Open router.bynara.id/settings, bind Telegram, then try again.",
      403,
    );
  }

  if (
    status === 402 ||
    lower.includes("insufficient") ||
    lower.includes("quota") ||
    lower.includes("credits")
  ) {
    return new NaraRouterError(
      "NaraRouter credits/quota exhausted. Check your plan at router.naraya.ai.",
      402,
    );
  }

  if (status === 401) {
    return new NaraRouterError(
      "NaraRouter API key is invalid. Check NARAROUTER_API_KEY in .env.local.",
      401,
    );
  }

  if (status === 403) {
    return new NaraRouterError(
      apiMessage || "NaraRouter denied this request (403).",
      403,
    );
  }

  if (status === 429) {
    return new NaraRouterError(
      "NaraRouter rate limit hit. Wait a moment and try again.",
      429,
    );
  }

  return new NaraRouterError(
    apiMessage || `NaraRouter request failed (${status}).`,
    status >= 400 && status < 600 ? status : 502,
  );
}

function buildFilterPrompt(data: RecommendRequest, candidateTitles: string[]): string {
  const location =
    data.locationLabel ||
    [data.city, data.country].filter(Boolean).join(", ") ||
    "unspecified";

  return `You are a movie expert. A viewer with this profile:
- Gender: ${data.gender}
- Age: ${data.age}
- Location: ${location}
- Current mood: ${data.mood}
- Mood/story details: ${data.story?.trim() || "none provided"}
- Watch time: ${data.watchTime}
- Watching with: ${data.company}

From this list of movies they have already watched, pick ONLY the ones that are a good match for their current profile. Return an empty array if none match.

Candidate titles: ${candidateTitles.join(", ")}

Return ONLY valid JSON, no markdown, no commentary:
{ "titles": ["Title One", "Title Two"] }`;
}

export async function filterRelevantWatched(
  data: RecommendRequest,
  candidateTitles: string[],
): Promise<string[]> {
  if (candidateTitles.length === 0) return [];

  const apiKey = process.env.NARAROUTER_API_KEY;
  const model = process.env.NARAROUTER_MODEL || "tencent-hy3";
  if (!apiKey) return [];

  try {
    const response = await fetch(NARAROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a movie expert. Always respond with valid JSON only.",
          },
          { role: "user", content: buildFilterPrompt(data, candidateTitles) },
        ],
      }),
    });

    if (!response.ok) return [];

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return [];

    const parsed = extractJson(content) as { titles?: unknown };
    if (!Array.isArray(parsed.titles)) return [];

    return parsed.titles
      .filter((t): t is string => typeof t === "string")
      .filter((t) =>
        candidateTitles.some((c) => c.toLowerCase() === t.toLowerCase()),
      );
  } catch {
    return [];
  }
}

export async function suggestMovies(data: RecommendRequest): Promise<AiMovie[]> {
  const apiKey = process.env.NARAROUTER_API_KEY;
  // Free-tier friendly default that currently answers on NaraRouter
  const model = process.env.NARAROUTER_MODEL || "tencent-hy3";

  if (!apiKey) {
    throw new NaraRouterError("NARAROUTER_API_KEY is not configured", 500);
  }

  const run = async (): Promise<AiMovie[]> => {
    const response = await fetch(NARAROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You recommend movies. Always respond with valid JSON only. Do not wrap the JSON in markdown.",
          },
          { role: "user", content: buildPrompt(data) },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw mapHttpError(response.status, errorText);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty NaraRouter response");
    }

    return normalizeMovies(extractJson(content));
  };

  try {
    return await run();
  } catch (firstError) {
    if (firstError instanceof NaraRouterError && firstError.status < 500) {
      throw firstError;
    }

    try {
      return await run();
    } catch {
      throw firstError;
    }
  }
}
