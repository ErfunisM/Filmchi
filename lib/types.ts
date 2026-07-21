export type Gender = "female" | "male" | "non-binary" | "prefer-not-to-say";

export type Mood =
  | "happy"
  | "sad"
  | "romantic"
  | "thrill"
  | "chill"
  | "adventurous"
  | "nostalgic";

export type WatchTime = "morning" | "afternoon" | "night";

export type Company =
  | "alone"
  | "family"
  | "friends"
  | "partner"
  | "colleagues";

export interface WizardData {
  gender: Gender | null;
  age: number | null;
  country: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string;
  mood: Mood | null;
  story: string;
  watchTime: WatchTime | null;
  company: Company | null;
}

export interface RecommendRequest {
  gender: Gender;
  age: number;
  country?: string;
  city?: string;
  locationLabel?: string;
  latitude?: number | null;
  longitude?: number | null;
  mood: Mood;
  story?: string;
  watchTime: WatchTime;
  company: Company;
  locale?: "en" | "fa";
  seenTitles?: string[];
}

export interface AiMovie {
  title: string;
  year: number;
  imdbRating: number;
  reason: string;
}

export interface SuggestedMovie extends AiMovie {
  tmdbId: number | null;
  posterUrl: string | null;
  overview: string | null;
  overviewFa: string | null;
  runtime: number | null;
  voteAverage: number | null;
  genres: string[];
}

export interface CandidateWatchedMovie {
  title: string;
  year?: number;
  overview?: string | null;
  overviewFa?: string | null;
  reason?: string;
  genres?: string[];
}

export interface RecommendResponse {
  movies: SuggestedMovie[];
  relevantWatched: SuggestedMovie[];
}

