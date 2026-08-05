import { languageColor } from "@/lib/languages";

export function LanguageDot({ language }: { language: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span
        aria-hidden="true"
        className="size-2.5 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/15"
        style={{ backgroundColor: languageColor(language) }}
      />
      {language}
    </span>
  );
}
