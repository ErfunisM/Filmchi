"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { Weather, WizardData } from "@/lib/types";

interface WeatherStepProps {
  data: WizardData;
  onSelect: (weather: Weather) => void;
}

export function WeatherStep({ data, onSelect }: WeatherStepProps) {
  const { t } = useLocale();

  const weathers: { value: Weather; emoji: string; label: string }[] = [
    { value: "sunny", emoji: "☀️", label: t.sunny },
    { value: "cloudy", emoji: "☁️", label: t.cloudy },
    { value: "rainy", emoji: "🌧️", label: t.rainy },
    { value: "snowy", emoji: "❄️", label: t.snowy },
  ];

  return (
    <section className="wizard-step">
      <h2 className="step-title">{t.weather}</h2>
      <p className="step-sub">{t.weatherSub}</p>
      <div className="mood-grid">
        {weathers.map((weather) => (
          <button
            key={weather.value}
            type="button"
            className={`mood-btn ${data.weather === weather.value ? "active" : ""}`}
            onClick={() => onSelect(weather.value)}
            aria-pressed={data.weather === weather.value}
          >
            <span className="mood-emoji" aria-hidden>
              {weather.emoji}
            </span>
            <span className="mood-label">{weather.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
