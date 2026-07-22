"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { Mood, WizardData } from "@/lib/types";

interface MoodStepProps {
  data: WizardData;
  onSelect: (mood: Mood) => void;
}

export function MoodStep({ data, onSelect }: MoodStepProps) {
  const { t } = useLocale();

  const moods: { value: Mood; emoji: string; label: string }[] = [
    { value: "happy", emoji: "😄", label: t.happy },
    { value: "sad", emoji: "😢", label: t.sad },
    { value: "romantic", emoji: "🥰", label: t.romantic },
    { value: "thrill", emoji: "😱", label: t.thrill },
    { value: "chill", emoji: "😌", label: t.chill },
  ];

  return (
    <section className="wizard-step">
      <h2 className="step-title">{t.howFeeling}</h2>
      <p className="step-sub">{t.howFeelingSub}</p>
      <div className="mood-grid">
        {moods.map((mood) => (
          <button
            key={mood.value}
            type="button"
            className={`mood-btn ${data.mood === mood.value ? "active" : ""}`}
            onClick={() => onSelect(mood.value)}
            aria-pressed={data.mood === mood.value}
          >
            <span className="mood-emoji" aria-hidden>
              {mood.emoji}
            </span>
            <span className="mood-label">{mood.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
