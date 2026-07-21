import type { Mood, SuggestedMovie } from "./types";

// Explicit genres that require warning for age <= 15
const EXPLICIT_INAPPROPRIATE_GENRES = ["horror", "erotic"];

// Mature genres inappropriate for young children (< 14) unless tagged as Animation/Family
const MATURE_GENRES = ["thriller", "crime", "war"];

// Strict keywords for explicit horror, slasher, or extreme content
const EXPLICIT_HORROR_KEYWORDS = [
  "ترسناک",
  "وحشتناک",
  "اسلشر",
  "کشتار",
  "خونین",
  "شکنجه",
  "صحنه دار",
  "جن زدگی",
  "slasher",
  "gore",
  "splatter",
  "torture",
  "nsfw",
  "erotic",
  "horror movie",
  "scary horror",
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ك/g, "ک")
    .replace(/ي/g, "ی")
    .replace(/‌/g, " ")
    .trim();
}

/**
 * Determines whether any of the recommended movies contain content
 * that is conceptually inappropriate for viewers aged 15 or below.
 */
export function isAgeInappropriate(
  age: number | null,
  movies: SuggestedMovie[] = [],
  story: string = "",
  mood?: Mood | null,
): boolean {
  // Only applicable to viewers aged 15 and below
  if (age === null || age > 15) {
    return false;
  }

  // If movies list is available, evaluate actual movie genres & metadata
  if (movies && movies.length > 0) {
    const hasInappropriateMovie = movies.some((movie) => {
      const lowerGenres = (movie.genres || []).map((g) => g.toLowerCase().trim());

      const isFamilyOrAnimation = lowerGenres.some(
        (g) => g === "family" || g === "animation" || g === "children",
      );

      const isExplicitHorror = lowerGenres.some((g) =>
        EXPLICIT_INAPPROPRIATE_GENRES.includes(g),
      );

      // Animation & Family films are safe UNLESS explicitly tagged as Horror
      if (isFamilyOrAnimation && !isExplicitHorror) {
        return false;
      }

      if (isExplicitHorror) {
        return true;
      }

      // Check mature genres (Thriller, Crime, War) for young kids (< 14) when not Family/Animation
      const isMature = lowerGenres.some((g) => MATURE_GENRES.includes(g));
      if (isMature && age < 14) {
        return true;
      }

      // Check title and recommendation reason strictly for explicit horror keywords
      const textToSearch = normalizeText(
        [movie.title, movie.reason].filter(Boolean).join(" "),
      );

      return EXPLICIT_HORROR_KEYWORDS.some((kw) => textToSearch.includes(kw));
    });

    return hasInappropriateMovie;
  }

  // Fallback if movies array is empty: check story description for explicit horror keywords
  const normalizedStory = normalizeText(story || "");
  return EXPLICIT_HORROR_KEYWORDS.some((kw) => normalizedStory.includes(kw));
}
