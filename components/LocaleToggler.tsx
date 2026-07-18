"use client";

import { useLocale } from "@/components/LocaleProvider";

export function LocaleToggler() {
  const { locale, setLocale } = useLocale();

  function toggle() {
    setLocale(locale === "fa" ? "en" : "fa");
  }

  return (
    <button
      type="button"
      className="icon-toggle locale-toggle"
      onClick={toggle}
      aria-label={locale === "fa" ? "English" : "فارسی"}
      title={locale === "fa" ? "EN" : "FA"}
    >
      {locale === "fa" ? "EN" : "FA"}
    </button>
  );
}
