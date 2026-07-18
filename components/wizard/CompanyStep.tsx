"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { Company, WizardData } from "@/lib/types";

interface CompanyStepProps {
  data: WizardData;
  onSelect: (company: Company) => void;
  loading: boolean;
}

export function CompanyStep({ data, onSelect, loading }: CompanyStepProps) {
  const { t } = useLocale();

  const companies: { value: Company; label: string }[] = [
    { value: "alone", label: t.alone },
    { value: "family", label: t.family },
    { value: "friends", label: t.friends },
    { value: "partner", label: t.partner },
    { value: "colleagues", label: t.colleagues },
  ];

  return (
    <section className="wizard-step">
      <h2 className="step-title">{t.watchingWith}</h2>
      <p className="step-sub">{t.whenWithWhomSub}</p>
      <div className="option-grid">
        {companies.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`option-chip ${data.company === item.value ? "active" : ""}`}
            onClick={() => onSelect(item.value)}
            disabled={loading}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
