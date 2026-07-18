"use client";

import { useLocale } from "@/components/LocaleProvider";
import { COUNTRY_LIST } from "@/lib/countries";

interface CountryStepProps {
  country: string;
  onSelect: (country: string) => void;
}

export function CountryStep({ country, onSelect }: CountryStepProps) {
  const { t } = useLocale();

  return (
    <section className="wizard-step">
      <h2 className="step-title">{t.country}</h2>
      <p className="step-sub">{t.countrySub}</p>
      <div className="city-grid scroll-options" role="listbox" aria-label={t.country}>
        {COUNTRY_LIST.map((item) => {
          const selected = country === item;
          return (
            <button
              key={item}
              type="button"
              role="option"
              aria-selected={selected}
              className={`option-chip ${selected ? "active" : ""}`}
              onClick={() => onSelect(item)}
            >
              {t.countries[item] || item}
            </button>
          );
        })}
      </div>
    </section>
  );
}
