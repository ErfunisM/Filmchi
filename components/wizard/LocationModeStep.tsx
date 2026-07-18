"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { LocationMode, WizardData } from "@/lib/types";

const LOCATING_TOKEN = "__LOCATING__";

interface LocationModeStepProps {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
  onManual: () => void;
  onLocated: () => void;
}

export function LocationModeStep({
  data,
  onChange,
  onManual,
  onLocated,
}: LocationModeStepProps) {
  const { t } = useLocale();

  function pickManual() {
    onChange({
      locationMode: "manual" satisfies LocationMode,
      locationLabel: "",
      latitude: null,
      longitude: null,
    });
    onManual();
  }

  function pickCurrent() {
    if (!navigator.geolocation) {
      alert(t.geoNotSupported);
      return;
    }

    onChange({
      locationMode: "current",
      locationLabel: LOCATING_TOKEN,
      country: "",
      city: "",
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: "application/json" } },
          );
          if (!response.ok) throw new Error("Reverse geocode failed");
          const json = (await response.json()) as {
            address?: {
              city?: string;
              town?: string;
              village?: string;
              state?: string;
              country?: string;
            };
            display_name?: string;
          };
          const city =
            json.address?.city ||
            json.address?.town ||
            json.address?.village ||
            json.address?.state ||
            "";
          const country = json.address?.country || "";
          const label =
            [city, country].filter(Boolean).join(", ") ||
            json.display_name ||
            `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

          onChange({
            locationMode: "current",
            latitude,
            longitude,
            city,
            country,
            locationLabel: label,
          });
          onLocated();
        } catch {
          onChange({
            locationMode: "current",
            latitude,
            longitude,
            locationLabel: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
          });
          onLocated();
        }
      },
      () => {
        onChange({
          locationMode: "manual",
          locationLabel: "",
          latitude: null,
          longitude: null,
        });
        alert(t.geoDenied);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  const locating = data.locationLabel === LOCATING_TOKEN;

  return (
    <section className="wizard-step">
      <h2 className="step-title">{t.location}</h2>
      <p className="step-sub">{t.locationSub}</p>
      <div className="option-grid">
        <button
          type="button"
          className={`option-chip ${data.locationMode === "manual" && !locating ? "active" : ""}`}
          onClick={pickManual}
        >
          {t.countryAndCity}
        </button>
        <button
          type="button"
          className={`option-chip ${data.locationMode === "current" || locating ? "active" : ""}`}
          onClick={pickCurrent}
          disabled={locating}
        >
          {locating ? t.locating : t.useCurrentLocation}
        </button>
      </div>
    </section>
  );
}

export { LOCATING_TOKEN };
