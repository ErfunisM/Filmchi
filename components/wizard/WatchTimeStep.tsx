"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { WatchTime, WizardData } from "@/lib/types";

interface WatchTimeStepProps {
  data: WizardData;
  onSelect: (watchTime: WatchTime) => void;
}

export function WatchTimeStep({ data, onSelect }: WatchTimeStepProps) {
  const { t } = useLocale();

  const watchTimes: { value: WatchTime; label: string; hint: string }[] = [
    { value: "morning", label: t.morning, hint: t.morningHint },
    { value: "afternoon", label: t.afternoon, hint: t.afternoonHint },
    { value: "night", label: t.night, hint: t.nightHint },
  ];

  return (
    <section className="wizard-step">
      <h2 className="step-title">{t.watchTime}</h2>
      <p className="step-sub">{t.whenWithWhomSub}</p>
      <div className="option-grid three">
        {watchTimes.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`option-card ${data.watchTime === item.value ? "active" : ""}`}
            onClick={() => onSelect(item.value)}
          >
            <strong>{item.label}</strong>
            <span>{item.hint}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
