"use client";

import { openConsentPreferences } from "@/lib/consent";

/** Reabre o banner: retirar o aceite tem que ser tão fácil quanto dar. */
export function CookiePreferencesButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={openConsentPreferences}
      className="text-accent underline-offset-4 hover:underline"
    >
      {label}
    </button>
  );
}
