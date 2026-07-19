"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { CountryItem } from "@/app/api/countries/route";
import type { WizardData } from "@/lib/types";

// Fallback list shown before API loads (alpha2 codes)
const DEFAULT_CODES = ["IR", "US", "GB", "TR", "DE", "FR", "AE", "IN", "CA"];

interface LocationStepProps {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
  onDone: () => void;
}

export function LocationStep({ data, onChange, onDone }: LocationStepProps) {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState("");
  const [allCountries, setAllCountries] = useState<CountryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((json: { countries?: CountryItem[] }) => {
        if (json.countries) setAllCountries(json.countries);
      })
      .catch(() => {/* keep empty, fallback labels will show */})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  function getLabel(c: CountryItem) {
    return locale === "fa" ? c.fa : c.en;
  }

  const defaultCountries = allCountries.filter((c) =>
    DEFAULT_CODES.includes(c.code),
  ).sort((a, b) => DEFAULT_CODES.indexOf(a.code) - DEFAULT_CODES.indexOf(b.code));

  const filteredCountries = query.trim()
    ? allCountries.filter(
        (c) =>
          c.en.toLowerCase().includes(query.toLowerCase()) ||
          c.fa.includes(query),
      )
    : defaultCountries;

  function selectCountry(c: CountryItem) {
    onChange({ country: c.en, city: "", locationLabel: c.en });
    onDone();
  }

  return (
    <section className="wizard-step">
      <h2 className="step-title">{t.country}</h2>
      <p className="step-sub">{t.locationSearchSub}</p>

      <div className="location-search-wrap">
        <input
          ref={inputRef}
          type="text"
          className="text-input location-search-input"
          placeholder={t.searchCountry}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          disabled={loading}
        />

        <div
          className="city-grid scroll-options location-country-list"
          role="listbox"
          aria-label={t.country}
        >
          {loading ? (
            <p className="location-no-result">{t.locating}</p>
          ) : filteredCountries.length > 0 ? (
            filteredCountries.map((item) => (
              <button
                key={item.code}
                type="button"
                role="option"
                aria-selected={data.country === item.en}
                className={`option-chip ${data.country === item.en ? "active" : ""}`}
                onClick={() => selectCountry(item)}
              >
                {getLabel(item)}
              </button>
            ))
          ) : (
            <p className="location-no-result">{t.noCountryFound}</p>
          )}
        </div>
      </div>
    </section>
  );
}
