import type { RecommendRequest, AiMovie } from "@/lib/types";
import { NaraRouterError } from "@/lib/nararouter";

const NARAROUTER_URL = "https://router.bynara.id/v1/chat/completions";

/**
 * Extract JSON from AI response
 */
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

/**
 * Normalize AI response to AiMovie format
 */
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
    .filter((movie) => movie.imdbRating >= 6.5)
    .slice(0, 5);

  if (normalized.length < 1) {
    throw new Error("NaraRouter returned no valid movies");
  }

  return normalized;
}

/**
 * Map HTTP errors to NaraRouterError
 */
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

/**
 * Weight configuration for different factors in recommendation algorithm
 * These weights determine how much each factor influences the final recommendation
 */
interface AlgorithmWeights {
  mood: number;
  age: number;
  company: number;
  watchTime: number;
  weather: number;
  location: number;
  story: number;
}

/**
 * Contextual rules that connect different factors together
 * These rules create logical connections between user's answers
 */
interface ContextualRule {
  condition: (data: RecommendRequest) => boolean;
  adjustment: {
    factor: keyof AlgorithmWeights;
    multiplier: number;
  };
}

/**
 * Recommendation Algorithm Component
 * 
 * This component implements a multi-stage algorithm that:
 * 1. Analyzes user's answers in context of each other
 * 2. Applies contextual rules to connect different factors
 * 3. Weights recommendations based on user profile
 * 4. Enhances AI prompt with algorithmic insights
 * 
 * The algorithm processes the 8 wizard questions as an interconnected system:
 * - Gender → Age appropriateness filtering
 * - Age → Content maturity level
 * - Location → Cultural preferences
 * - Weather → Mood enhancement
 * - Watch Time → Energy level matching
 * - Company → Genre appropriateness
 * - Mood → Primary recommendation driver
 * - Story → Specific theme/actor overrides
 */
export class RecommendationAlgorithm {
  private static readonly DEFAULT_WEIGHTS: AlgorithmWeights = {
    mood: 1.5,          // Primary driver - highest weight
    age: 1.2,           // Content appropriateness
    company: 1.1,       // Social context
    watchTime: 1.0,     // Energy level
    weather: 0.8,       // Atmospheric influence
    location: 0.7,      // Cultural context
    story: 2.0,         // Specific requests - highest override
  };

  private static readonly CONTEXTUAL_RULES: ContextualRule[] = [
    // Rule 1: Weather enhances mood
    {
      condition: (data) => data.weather === "rainy" && data.mood === "sad",
      adjustment: { factor: "mood", multiplier: 1.3 },
    },
    {
      condition: (data) => data.weather === "sunny" && data.mood === "happy",
      adjustment: { factor: "mood", multiplier: 1.2 },
    },
    {
      condition: (data) => data.weather === "snowy" && (data.mood === "romantic" || data.mood === "chill"),
      adjustment: { factor: "mood", multiplier: 1.25 },
    },

    // Rule 2: Company affects genre appropriateness
    {
      condition: (data) => data.company === "family" && data.age < 18,
      adjustment: { factor: "age", multiplier: 1.5 },
    },
    {
      condition: (data) => data.company === "partner" && data.mood === "romantic",
      adjustment: { factor: "mood", multiplier: 1.4 },
    },
    {
      condition: (data) => data.company === "alone" && data.mood === "thrill",
      adjustment: { factor: "mood", multiplier: 1.3 },
    },

    // Rule 3: Watch time affects energy level
    {
      condition: (data) => data.watchTime === "night" && data.mood === "thrill",
      adjustment: { factor: "mood", multiplier: 1.2 },
    },
    {
      condition: (data) => data.watchTime === "morning" && data.mood === "happy",
      adjustment: { factor: "mood", multiplier: 1.15 },
    },

    // Rule 4: Age affects mood appropriateness
    {
      condition: (data) => data.age < 13 && data.mood === "thrill",
      adjustment: { factor: "age", multiplier: 2.0 },
    },
    {
      condition: (data) => data.age >= 18 && data.mood === "chill",
      adjustment: { factor: "mood", multiplier: 1.1 },
    },
  ];

  /**
   * Calculate dynamic weights based on contextual rules
   * This connects different user answers together
   */
  private static calculateWeights(data: RecommendRequest): AlgorithmWeights {
    const weights = { ...this.DEFAULT_WEIGHTS };

    for (const rule of this.CONTEXTUAL_RULES) {
      if (rule.condition(data)) {
        weights[rule.adjustment.factor] *= rule.adjustment.multiplier;
      }
    }

    return weights;
  }

  /**
   * Generate algorithmic insights to enhance AI prompt
   * This provides context about how factors interact
   */
  private static generateInsights(data: RecommendRequest, weights: AlgorithmWeights): string {
    const insights: string[] = [];

    // Mood-Weather connection
    if (weights.mood > this.DEFAULT_WEIGHTS.mood * 1.2) {
      insights.push(`Weather (${data.weather}) significantly enhances the ${data.mood} mood`);
    }

    // Company-Age connection
    if (weights.age > this.DEFAULT_WEIGHTS.age * 1.3) {
      insights.push(`Watching with ${data.company} requires strict age-appropriate content for ${data.age}-year-old`);
    }

    // Company-Mood connection
    if (data.company === "partner" && data.mood === "romantic") {
      insights.push("Partner-focused romantic viewing experience");
    }

    // Watch Time-Mood connection
    if (data.watchTime === "night" && data.mood === "thrill") {
      insights.push("Late-night thriller atmosphere");
    }

    // Story override
    if (data.story && data.story.length > 10) {
      insights.push("User has specific thematic requirements that should override general preferences");
    }

    return insights.length > 0 ? insights.join(". ") + "." : "Standard recommendation flow.";
  }

  /**
   * Build enhanced prompt with algorithmic insights
   */
  private static buildEnhancedPrompt(data: RecommendRequest, insights: string): string {
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
- Weather: ${data.weather}
- Preferred watch time: ${data.watchTime}
- Watching with: ${data.company}
- Mood/story details: ${storyHint || "none provided"}${seenSection}

Algorithmic insights:
${insights}

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

  /**
   * Main algorithm execution
   *
   * This method:
   * 1. Calculates contextual weights based on interconnected answers
   * 2. Generates algorithmic insights about factor relationships
   * 3. Enhances the AI prompt with these insights
   * 4. Returns recommendations from the enhanced prompt
   */
  static async execute(data: RecommendRequest): Promise<AiMovie[]> {
    const apiKey = process.env.NARAROUTER_API_KEY;
    const model = process.env.NARAROUTER_MODEL || "tencent-hy3";

    if (!apiKey) {
      throw new NaraRouterError("NARAROUTER_API_KEY is not configured", 500);
    }

    // Step 1: Calculate dynamic weights based on contextual rules
    const weights = this.calculateWeights(data);

    // Step 2: Generate algorithmic insights
    const insights = this.generateInsights(data, weights);

    // Step 3: Build enhanced prompt with algorithmic insights
    const enhancedPrompt = this.buildEnhancedPrompt(data, insights);

    // Step 4: Call AI with enhanced prompt
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
            { role: "user", content: enhancedPrompt },
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

  /**
   * Get the calculated weights for debugging/analysis
   */
  static getWeights(data: RecommendRequest): AlgorithmWeights {
    return this.calculateWeights(data);
  }

  /**
   * Get the insights for debugging/analysis
   */
  static getInsights(data: RecommendRequest): string {
    const weights = this.calculateWeights(data);
    return this.generateInsights(data, weights);
  }
}
