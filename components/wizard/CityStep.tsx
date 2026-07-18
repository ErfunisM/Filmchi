"use client";

import { useLocale } from "@/components/LocaleProvider";
import { COUNTRIES_WITH_CITIES } from "@/lib/countries";

interface CityStepProps {
  country: string;
  city: string;
  onSelect: (city: string) => void;
}

export function CityStep({ country, city, onSelect }: CityStepProps) {
  const { t } = useLocale();
  const cities = COUNTRIES_WITH_CITIES[country] ?? [];

  return (
    <section className="wizard-step">
      <h2 className="step-title">{t.city}</h2>
      <p className="step-sub">{t.citySub}</p>
      <div className="city-grid scroll-options" role="listbox" aria-label={t.city}>
        {cities.map((item) => {
          const selected = city === item;
          return (
            <button
              key={item}
              type="button"
              role="option"
              aria-selected={selected}
              className={`option-chip ${selected ? "active" : ""}`}
              onClick={() => onSelect(item)}
            >
              {item}
            </button>
          );
        })}
      </div>
    </section>
  );
}
