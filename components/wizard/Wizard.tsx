"use client";

import { useMemo, useState } from "react";
import { LocaleToggler } from "@/components/LocaleToggler";
import { ThemeToggler } from "@/components/ThemeToggler";
import { MovieCard } from "@/components/MovieCard";
import { useLocale } from "@/components/LocaleProvider";
import { AgeStep } from "@/components/wizard/AgeStep";
import { AgeWarningModal } from "@/components/wizard/AgeWarningModal";
import { CompanyStep } from "@/components/wizard/CompanyStep";
import { GenderStep } from "@/components/wizard/GenderStep";
import { LocationStep } from "@/components/wizard/LocationStep";
import { MoodStep } from "@/components/wizard/MoodStep";
import { StoryStep } from "@/components/wizard/StoryStep";
import { WatchTimeStep } from "@/components/wizard/WatchTimeStep";
import { WeatherStep } from "@/components/wizard/WeatherStep";
import { isAgeInappropriate } from "@/lib/ageCheck";
import { getWatchedMovies, getWatchedTitles } from "@/lib/watchedMovies";
import type {
  Company,
  Gender,
  Mood,
  RecommendResponse,
  SuggestedMovie,
  WatchTime,
  Weather,
  WizardData,
} from "@/lib/types";

const INITIAL_DATA: WizardData = {
  gender: null,
  age: null,
  country: "",
  city: "",
  latitude: null,
  longitude: null,
  locationLabel: "",
  weather: null,
  mood: null,
  story: "",
  watchTime: null,
  company: null,
};

type Step =
  | "gender"
  | "age"
  | "location"
  | "weather"
  | "watchTime"
  | "company"
  | "mood"
  | "story"
  | "results";

type Direction = "forward" | "back";

function buildStepPath(): Step[] {
  return ["gender", "age", "location", "weather", "watchTime", "company", "mood", "story"];
}

export function Wizard() {
  const { t, dir, locale } = useLocale();
  const [step, setStep] = useState<Step>("gender");
  const [direction, setDirection] = useState<Direction>("forward");
  const [animKey, setAnimKey] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [movies, setMovies] = useState<SuggestedMovie[]>([]);
  const [movieIndex, setMovieIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAgeWarning, setShowAgeWarning] = useState(false);

  // "new" = new picks tab, "watched" = previously watched tab
  const [resultsTab, setResultsTab] = useState<"new" | "watched">("new");
  // relevantWatched: only the watched films the AI confirmed match the current profile
  const [relevantWatched, setRelevantWatched] = useState<SuggestedMovie[]>([]);
  const [watchedIndex, setWatchedIndex] = useState(0);

  // No longer need to load full watched list on step change — API returns the filtered subset
  const watchedMovies = relevantWatched;

  const path = useMemo(() => buildStepPath(), []);
  const pathIndex = path.indexOf(step);
  const progress =
    step === "results"
      ? 100
      : ((Math.max(pathIndex, 0) + 1) / path.length) * 100;

  function patchData(patch: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function goTo(next: Step, dirMove: Direction) {
    setError(null);
    setDirection(dirMove);
    setAnimKey((k) => k + 1);
    setStep(next);
  }

  function goNext(from: Step, patch?: Partial<WizardData>) {
    const nextData = patch ? { ...data, ...patch } : data;
    if (patch) setData(nextData);
    const idx = path.indexOf(from);
    const next = path[idx + 1];
    if (next) goTo(next, "forward");
  }

  function goBack() {
    if (step === "results" || pathIndex <= 0) return;
    goTo(path[pathIndex - 1], "back");
  }

  async function submitRecommendations() {
    if (
      !data.gender ||
      !data.weather ||
      !data.mood ||
      !data.watchTime ||
      !data.company ||
      data.age === null
    ) {
      setError(t.completeRequired);
      return;
    }

    setLoading(true);
    setError(null);

    try {
    const currentWatched = getWatchedMovies();
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: data.gender,
          age: data.age,
          country: data.country || undefined,
          city: data.city || undefined,
          locationLabel: data.locationLabel || undefined,
          latitude: data.latitude,
          longitude: data.longitude,
          weather: data.weather,
          mood: data.mood,
          story: data.story,
          watchTime: data.watchTime,
          company: data.company,
          locale,
          seenTitles: currentWatched.map((w) => w.title),
          watchedMoviesData: currentWatched,
        }),
      });

      const json = (await response.json()) as RecommendResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error || t.recommendFailed);
      }

      if (!json.movies?.length) {
        throw new Error(t.recommendFailed);
      }

      setMovies(json.movies);
      setMovieIndex(0);
      setRelevantWatched(json.relevantWatched ?? []);
      setWatchedIndex(0);
      setResultsTab("new");
      
      // Check if movies are age-inappropriate
      if (isAgeInappropriate(data.age, json.movies, data.story, data.mood)) {
        setShowAgeWarning(true);
      }
      
      goTo("results", "forward");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.somethingWrong);
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setData(INITIAL_DATA);
    setMovies([]);
    setMovieIndex(0);
    setRelevantWatched([]);
    setWatchedIndex(0);
    setResultsTab("new");
    setError(null);
    setShowAgeWarning(false);
    setDirection("back");
    setAnimKey((k) => k + 1);
    setStep("gender");
  }

  // Called from MovieCard when user marks a film as watched in current session
  function handleMarkedWatched(movie: SuggestedMovie) {
    setRelevantWatched((prev) => {
      const exists = prev.some(
        (m) => m.title.toLowerCase() === movie.title.toLowerCase(),
      );
      if (exists) return prev;
      return [...prev, movie];
    });
  }

  const slideClass =
    direction === "forward" ? "slide-forward" : "slide-back";

  const showPrev = step !== "results" && pathIndex > 0;
  const ageValid = data.age !== null && data.age >= 1 && data.age <= 120;
  const showAgeNext = step === "age";
  const showStoryActions = step === "story";
  const showCompanyNext = step === "company";
  const showMoodNext = step === "mood";
  const showNav =
    step !== "results" &&
    (showPrev || showAgeNext || showStoryActions || showCompanyNext || showMoodNext);

  return (
    <div className="wizard-shell" data-dir={dir}>
      <header className="brand-header">
        <div className="brand-row">
          <p className="brand">Filmchi</p>
          <div className="header-controls">
            <ThemeToggler />
            <LocaleToggler />
          </div>
        </div>
        {step !== "results" ? (
          <div className="progress-track" aria-hidden>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        ) : null}
      </header>

      <main className={`wizard-main ${showAgeWarning ? "blurred-content" : ""}`}>
        {step !== "results" ? (
          <div
            key={`${step}-${animKey}`}
            className={`step-stage ${slideClass}`}
          >
            {step === "gender" ? (
              <GenderStep
                data={data}
                onSelect={(gender: Gender) => {
                  goNext("gender", { gender });
                }}
              />
            ) : null}

            {step === "age" ? (
              <AgeStep
                data={data}
                onChange={(age) => patchData({ age })}
                onNext={() => goNext("age")}
              />
            ) : null}

            {step === "location" ? (
              <LocationStep
                data={data}
                onChange={patchData}
                onDone={() => goNext("location")}
              />
            ) : null}

            {step === "weather" ? (
              <WeatherStep
                data={data}
                onSelect={(weather: Weather) => goNext("weather", { weather })}
              />
            ) : null}

            {step === "mood" ? (
              <MoodStep
                data={data}
                onSelect={(mood: Mood) => goNext("mood", { mood })}
              />
            ) : null}

            {step === "story" ? (
              <StoryStep
                data={data}
                onChange={(story) => patchData({ story })}
              />
            ) : null}

            {step === "watchTime" ? (
              <WatchTimeStep
                data={data}
                onSelect={(watchTime: WatchTime) =>
                  goNext("watchTime", { watchTime })
                }
              />
            ) : null}

            {step === "company" ? (
              <CompanyStep
                data={data}
                onSelect={(company: Company) => patchData({ company })}
                loading={loading}
              />
            ) : null}
          </div>
        ) : null}

        {step === "results" && movies[movieIndex] ? (
          <div key={`results-${animKey}`} className={`step-stage ${slideClass}`}>
            {/* Tab bar — only shown when there are watched movies */}
            {watchedMovies.length > 0 ? (
              <div className="results-tabs">
                <button
                  type="button"
                  className={`results-tab ${resultsTab === "new" ? "results-tab--active" : ""}`}
                  onClick={() => { setResultsTab("new"); setMovieIndex(0); }}
                >
                  {t.newResults}
                </button>
                <button
                  type="button"
                  className={`results-tab ${resultsTab === "watched" ? "results-tab--active" : ""}`}
                  onClick={() => { setResultsTab("watched"); setWatchedIndex(0); }}
                >
                  {t.watchedResults}
                </button>
              </div>
            ) : null}

            {resultsTab === "new" ? (
              <MovieCard
                movie={movies[movieIndex]}
                index={movieIndex}
                total={movies.length}
                onNext={() =>
                  setMovieIndex((i) => Math.min(i + 1, movies.length - 1))
                }
                onRestart={restart}
                onMarkedWatched={handleMarkedWatched}
              />
            ) : (
              <MovieCard
                movie={watchedMovies[watchedIndex] as unknown as SuggestedMovie}
                index={watchedIndex}
                total={watchedMovies.length}
                onNext={() =>
                  setWatchedIndex((i) => Math.min(i + 1, watchedMovies.length - 1))
                }
                onRestart={restart}
              />
            )}
          </div>
        ) : null}

        {showNav ? (
          <div className="wizard-nav">
            <div className="wizard-nav-start">
              {showPrev ? (
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={goBack}
                  disabled={loading}
                >
                  {t.back}
                </button>
              ) : (
                <span />
              )}
            </div>

            <div className="wizard-nav-end">
              {showStoryActions ? (
                <>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => goNext("story", { story: "" })}
                  >
                    {t.skip}
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={submitRecommendations}
                    disabled={loading}
                  >
                    {loading ? t.findingFilms : t.finish}
                  </button>
                </>
              ) : null}

              {showAgeNext ? (
                <button
                  type="button"
                  className="primary-btn"
                  disabled={!ageValid}
                  onClick={() => goNext("age")}
                >
                  {t.continue}
                </button>
              ) : null}

              {showCompanyNext ? (
                <button
                  type="button"
                  className="primary-btn"
                  disabled={!data.company}
                  onClick={() => goNext("company", { company: data.company })}
                >
                  {t.continue}
                </button>
              ) : null}

              {showMoodNext ? (
                <button
                  type="button"
                  className="primary-btn"
                  disabled={!data.mood}
                  onClick={() => goNext("mood", { mood: data.mood })}
                >
                  {t.continue}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {error ? <p className="error-banner">{error}</p> : null}
      </main>

      {showAgeWarning && (
        <AgeWarningModal
          onContinue={() => setShowAgeWarning(false)}
          onGoBack={restart}
        />
      )}
    </div>
  );
}
