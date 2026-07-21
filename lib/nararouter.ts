import type { AiMovie, CandidateWatchedMovie, RecommendRequest } from "./types";

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

  const storyHint = data.story?.trim();
  const hasSpecificRequest = storyHint && storyHint.length > 5;

  return `You are a movie recommendation expert. Suggest between 1 and 5 movies based on this viewer profile.

Viewer profile:
- Gender: ${data.gender}
- Age: ${data.age}
- Location: ${location}
- Current mood: ${data.mood}
- Mood/story details: ${storyHint || "none provided"}
- Preferred watch time: ${data.watchTime}
- Watching with: ${data.company}${seenSection}

Rules:
- Prefer movies with IMDb rating of 7.0 or higher. If the request is very specific (e.g. a particular actor, director, or niche genre), you may include movies with IMDb rating as low as 6.5 — but only if they genuinely fit.
- Prefer well-known, widely available films
- Match the mood, company, time of day, and the story/theme details closely
- If the viewer requests a specific actor, director, or theme: prioritize those over generic suggestions
- Return ONLY valid JSON, no markdown, no commentary
- Return as many movies as you can (up to 5). If you can only find 1-4 strong matches, return those — do NOT pad the list with irrelevant movies just to reach 5
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
Between 1 and 5 movies in the array. Quality over quantity.${hasSpecificRequest ? "\n\nIMPORTANT: The viewer has a specific request in the story details. Honor it strictly." : ""}`;
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
    // Accept 6.5+ to handle niche/actor-specific requests; quality still maintained
    .filter((movie) => movie.imdbRating >= 6.5)
    .slice(0, 5);

  if (normalized.length < 1) {
    throw new Error("NaraRouter returned no valid movies");
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

function buildFilterPrompt(
  data: RecommendRequest,
  candidates: CandidateWatchedMovie[],
): string {
  const location =
    data.locationLabel ||
    [data.city, data.country].filter(Boolean).join(", ") ||
    "unspecified";

  const formattedCandidates = candidates
    .map((c, i) => {
      const yearStr = c.year ? ` (${c.year})` : "";
      const genreStr =
        c.genres && c.genres.length > 0
          ? `\n   TMDB Genres: ${c.genres.join(", ")}`
          : "";
      const desc = c.overview || c.overviewFa || c.reason || "";
      const descStr = desc ? `\n   Description: ${desc.slice(0, 200)}` : "";
      return `${i + 1}. Title: "${c.title}"${yearStr}${genreStr}${descStr}`;
    })
    .join("\n\n");

  const storyText = data.story?.trim();

  return `You are a strict movie genre and content filter.

User Request & Profile:
- Gender: ${data.gender}
- Age: ${data.age} years old
- Location: ${location}
- Selected Mood: ${data.mood}
- Story / User Desired Theme: ${storyText || "Not specified"}
- Watch Time: ${data.watchTime}
- Company: ${data.company}

Your Task:
Filter the candidate movies below (which the user previously marked as watched). Return ONLY candidate movies that strictly match ALL of the following criteria.
Each candidate includes its REAL genres from TMDB — use them as the primary signal.

STRICT FILTERING RULES:

1. GENRE & MOOD COMPATIBILITY IS MANDATORY (use TMDB Genres as the primary signal):
   - Mood 'thrill' OR story mentions horror/scary/thriller/slasher/monster/zombie:
     * INCLUDE: Horror, Thriller, Mystery genres ONLY.
     * STRICTLY EXCLUDE: Animation, Family, Comedy, Music genres. Any movie tagged "Animation" or "Family" is automatically excluded.
   - Mood 'happy' OR story mentions comedy/fun/feel-good:
     * INCLUDE: Comedy, Family, Animation (lighthearted).
     * EXCLUDE: Horror, Thriller, dark Drama.
   - Mood 'romantic':
     * INCLUDE: Romance genre. Can include Drama if romantic.
     * EXCLUDE: Horror, pure Action without romance.
   - Mood 'sad':
     * INCLUDE: Drama (emotional/tragic).
     * EXCLUDE: Comedy, Animation, upbeat Family films.
   - Mood 'adventurous':
     * INCLUDE: Adventure, Action, Science Fiction, Fantasy.
   - Mood 'chill':
     * INCLUDE: Comedy, Drama, Family, Music, Documentary.
     * EXCLUDE: Horror, intense Thriller.
   - Mood 'nostalgic':
     * Include films that match the nostalgic feeling for this viewer's age group.
   - Additionally, if 'Story / User Desired Theme' mentions a specific genre (e.g. sci-fi, anime, war, historical), candidates MUST have a matching TMDB genre. Non-matching genres are excluded.

2. AGE APPROPRIATENESS IS MANDATORY:
   - Age < 6 (toddler): ONLY G-rated family animation. EXCLUDE all adult, PG-13, R-rated, scary, or violent content.
   - Age 6–11 (kids): ONLY kids/family-friendly (G, PG). EXCLUDE mature, scary, or adult content.
   - Age ≥ 18: Do NOT include toddler/preschool cartoons unless the user explicitly asked for kids animated films.

3. BE EXTREMELY SELECTIVE:
   - For each candidate ask: "Given this user's current mood (${data.mood}), age (${data.age}), and desired theme, would they genuinely want to re-watch this movie right now?" If doubtful, EXCLUDE it.
   - If NONE of the candidates match all rules, return an empty array.

Candidate Movies:
${formattedCandidates}

Return ONLY valid JSON, no markdown, no commentary:
{ "titles": ["Matching Title 1"] }`;
}

export async function filterRelevantWatched(
  data: RecommendRequest,
  candidates: CandidateWatchedMovie[],
): Promise<string[]> {
  if (candidates.length === 0) return [];

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
          { role: "user", content: buildFilterPrompt(data, candidates) },
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
        candidates.some((c) => c.title.toLowerCase() === t.toLowerCase()),
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
