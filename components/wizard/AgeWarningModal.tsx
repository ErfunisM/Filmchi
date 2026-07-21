"use client";

import { useLocale } from "@/components/LocaleProvider";

interface AgeWarningModalProps {
  onContinue: () => void;
  onGoBack: () => void;
}

export function AgeWarningModal({ onContinue, onGoBack }: AgeWarningModalProps) {
  const { t, dir } = useLocale();

  return (
    <div className="age-modal-overlay" dir={dir}>
      <div className="age-modal-card">
        <div className="age-modal-icon-wrap">
          <svg
            className="age-modal-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <p className="age-modal-text">{t.ageWarningText}</p>
        <div className="age-modal-actions">
          <button
            type="button"
            className="age-modal-btn age-modal-btn--home ghost-btn"
            onClick={onGoBack}
          >
            {t.ageWarningGoBack}
          </button>
          <button
            type="button"
            className="age-modal-btn primary-btn"
            onClick={onContinue}
          >
            {t.ageWarningContinue}
          </button>
        </div>
      </div>
    </div>
  );
}
