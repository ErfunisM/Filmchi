"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { WizardData } from "@/lib/types";

interface StoryStepProps {
  data: WizardData;
  onChange: (story: string) => void;
}

export function StoryStep({ data, onChange }: StoryStepProps) {
  const { t } = useLocale();

  return (
    <section className="wizard-step">
      <h2 className="step-title">{t.anythingElse}</h2>
      <p className="step-sub">{t.anythingElseSub}</p>

      <label className="field-group">
        <span className="field-label">{t.yourStory}</span>
        <textarea
          className="text-input story-input"
          rows={5}
          maxLength={600}
          placeholder={t.storyPlaceholder}
          value={data.story}
          autoFocus
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="char-count">{data.story.length}/600</span>
      </label>
    </section>
  );
}
