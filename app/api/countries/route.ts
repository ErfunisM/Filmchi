import { NextResponse } from "next/server";

interface CountriesDevItem {
  name: string;
  alpha2Code: string;
  translations?: Record<string, string>;
}

export interface CountryItem {
  code: string;
  en: string;
  fa: string;
}

export async function GET() {
  try {
    const response = await fetch("https://countries.dev/countries", {
      next: { revalidate: 86400 }, // cache for 24 hours
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch countries" }, { status: 502 });
    }

    const raw = (await response.json()) as CountriesDevItem[];

    const NAME_OVERRIDES: Record<string, { en: string; fa: string }> = {
      GB: { en: "United Kingdom", fa: "بریتانیا" },
    };

    const countries: CountryItem[] = raw
      .filter((c) => c.name && c.alpha2Code)
      .map((c) => {
        const override = NAME_OVERRIDES[c.alpha2Code];
        return {
          code: c.alpha2Code,
          en: override?.en ?? c.name,
          fa: override?.fa ?? c.translations?.fa ?? c.name,
        };
      })
      .sort((a, b) => a.en.localeCompare(b.en));

    return NextResponse.json({ countries });
  } catch {
    return NextResponse.json({ error: "Failed to fetch countries" }, { status: 500 });
  }
}
