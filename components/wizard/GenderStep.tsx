"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { Gender, WizardData } from "@/lib/types";

interface GenderStepProps {
  data: WizardData;
  onSelect: (gender: Gender) => void;
}

export function GenderStep({ data, onSelect }: GenderStepProps) {
  const { t } = useLocale();

  const genders: { value: Gender; label: string }[] = [
    { value: "female", label: t.female },
    { value: "male", label: t.male },
    { value: "non-binary", label: t.nonBinary },
    { value: "prefer-not-to-say", label: t.preferNotToSay },
  ];

  return (
    <section className="wizard-step">
      <h2 className="step-title">{t.gender}</h2>
      <p className="step-sub">{t.genderSub}</p>
      <div className="option-grid" role="radiogroup" aria-label={t.gender}>
        {genders.map((item) => {
          const selected = data.gender === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`option-chip ${selected ? "active" : ""}`}
              onClick={() => onSelect(item.value)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
