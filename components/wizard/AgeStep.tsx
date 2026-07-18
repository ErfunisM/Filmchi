"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { WizardData } from "@/lib/types";

interface AgeStepProps {
  data: WizardData;
  onChange: (age: number | null) => void;
  onNext: () => void;
}

export function AgeStep({ data, onChange, onNext }: AgeStepProps) {
  const { t } = useLocale();
  const valid = data.age !== null && data.age >= 1 && data.age <= 120;

  return (
    <section className="wizard-step">
      <h2 className="step-title">{t.age}</h2>
      <p className="step-sub">{t.ageSub}</p>
      <div className="field-group">
        <input
          id="age"
          type="number"
          inputMode="numeric"
          min={1}
          max={120}
          className="text-input"
          placeholder={t.agePlaceholder}
          value={data.age ?? ""}
          autoFocus
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange(null);
              return;
            }
            const next = Number(raw);
            onChange(Number.isFinite(next) ? next : null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && valid) onNext();
          }}
        />
      </div>
    </section>
  );
}
