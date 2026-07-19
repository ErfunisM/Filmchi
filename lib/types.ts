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

export type LocationMode = "manual" | "current";

export interface WizardData {
  gender: Gender | null;
  age: number | null;
  locationMode: LocationMode;
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
}

export interface RecommendResponse {
  movies: SuggestedMovie[];
}
