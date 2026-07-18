"use client";

import { useMemo, useState } from "react";
import { LocaleToggler } from "@/components/LocaleToggler";
import { ThemeToggler } from "@/components/ThemeToggler";
import { MovieCard } from "@/components/MovieCard";
import { useLocale } from "@/components/LocaleProvider";
import { AgeStep } from "@/components/wizard/AgeStep";
import { CityStep } from "@/components/wizard/CityStep";
import { CompanyStep } from "@/components/wizard/CompanyStep";
import { CountryStep } from "@/components/wizard/CountryStep";
import { GenderStep } from "@/components/wizard/GenderStep";
import { LocationModeStep } from "@/components/wizard/LocationModeStep";
import { MoodStep } from "@/components/wizard/MoodStep";
import { StoryStep } from "@/components/wizard/StoryStep";
import { WatchTimeStep } from "@/components/wizard/WatchTimeStep";
import type {
  Company,
  Gender,
  Mood,
  RecommendResponse,
  SuggestedMovie,
  WatchTime,
  WizardData,
} from "@/lib/types";

const INITIAL_DATA: WizardData = {
  gender: null,
  age: null,
  locationMode: "manual",
  country: "",
  city: "",
  latitude: null,
  longitude: null,
  locationLabel: "",
  mood: null,
  story: "",
  watchTime: null,
  company: null,
};

type Step =
  | "gender"
  | "age"
  | "locationMode"
  | "country"
  | "city"
  | "mood"
  | "story"
  | "watchTime"
  | "company"
  | "results";

type Direction = "forward" | "back";

function buildStepPath(data: WizardData): Step[] {
  const path: Step[] = ["gender", "age", "locationMode"];
  if (data.locationMode === "manual") {
    path.push("country", "city");
  }
  path.push("mood", "story", "watchTime", "company");
  return path;
}

export function Wizard() {
  const { t, dir } = useLocale();
  const [step, setStep] = useState<Step>("gender");
  const [direction, setDirection] = useState<Direction>("forward");
  const [animKey, setAnimKey] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [movies, setMovies] = useState<SuggestedMovie[]>([]);
  const [movieIndex, setMovieIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const path = useMemo(() => buildStepPath(data), [data]);
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
    const nextPath = buildStepPath(nextData);
    const idx = nextPath.indexOf(from);
    const next = nextPath[idx + 1];
    if (next) goTo(next, "forward");
  }

  function goBack() {
    if (step === "results" || pathIndex <= 0) return;
    goTo(path[pathIndex - 1], "back");
  }

  async function submitRecommendations() {
    if (
      !data.gender ||
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
          mood: data.mood,
          story: data.story,
          watchTime: data.watchTime,
          company: data.company,
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
    setError(null);
    setDirection("back");
    setAnimKey((k) => k + 1);
    setStep("gender");
  }

  const slideClass =
    direction === "forward" ? "slide-forward" : "slide-back";

  const showPrev = step !== "results" && pathIndex > 0;
  const ageValid = data.age !== null && data.age >= 1 && data.age <= 120;
  const showAgeNext = step === "age";
  const showStoryActions = step === "story";
  const showFinish = step === "company";
  const showNav =
    step !== "results" &&
    (showPrev || showAgeNext || showStoryActions || showFinish);

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

      <main className="wizard-main">
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

            {step === "locationMode" ? (
              <LocationModeStep
                data={data}
                onChange={patchData}
                onManual={() =>
                  goNext("locationMode", { locationMode: "manual" })
                }
                onLocated={() =>
                  goNext("locationMode", { locationMode: "current" })
                }
              />
            ) : null}

            {step === "country" ? (
              <CountryStep
                country={data.country}
                onSelect={(country) =>
                  goNext("country", { country, city: "" })
                }
              />
            ) : null}

            {step === "city" ? (
              <CityStep
                country={data.country}
                city={data.city}
                onSelect={(city) => goNext("city", { city })}
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
            <MovieCard
              movie={movies[movieIndex]}
              index={movieIndex}
              total={movies.length}
              onNext={() =>
                setMovieIndex((i) => Math.min(i + 1, movies.length - 1))
              }
              onRestart={restart}
            />
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
                    onClick={() => goNext("story")}
                  >
                    {t.continue}
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

              {showFinish ? (
                <button
                  type="button"
                  className="primary-btn"
                  disabled={!data.company || loading}
                  onClick={submitRecommendations}
                >
                  {loading ? t.findingFilms : t.finish}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {error ? <p className="error-banner">{error}</p> : null}
      </main>
    </div>
  );
}
