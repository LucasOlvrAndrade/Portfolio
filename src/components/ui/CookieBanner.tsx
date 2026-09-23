"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  saveConsent,
  subscribeConsent,
  subscribeOpenRequest,
  type Consent,
} from "@/lib/consent";

type Props = {
  copy: {
    title: string;
    text: string;
    learnMore: string;
    reject: string;
    accept: string;
  };
  privacyHref: string;
};

/**
 * Pergunta antes de qualquer cookie de estatística existir.
 *
 * Recusar e Aceitar têm o mesmo peso visual de propósito: a ANPD não aceita
 * banner em que recusar é um link cinza escondido. E não há "OK" nem
 * "continuar navegando é aceitar": sem clique, o GA e o Clarity não carregam.
 */
export function CookieBanner({ copy, privacyHref }: Props) {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );
  const [reopened, setReopened] = useState(false);

  useEffect(() => subscribeOpenRequest(() => setReopened(true)), []);

  if (consent === null) return null;
  if (consent !== "unset" && !reopened) return null;

  const choose = (value: Consent) => {
    setReopened(false);
    saveConsent(value);
  };

  const button =
    "min-h-11 flex-1 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent";

  return (
    <section
      role="region"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-xl border border-border bg-surface p-5 text-text shadow-lg"
    >
      <h2 id="cookie-banner-title" className="text-base font-semibold">
        {copy.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {copy.text}{" "}
        <a href={privacyHref} className="text-accent underline underline-offset-4">
          {copy.learnMore}
        </a>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("denied")} className={button}>
          {copy.reject}
        </button>
        <button type="button" onClick={() => choose("granted")} className={button}>
          {copy.accept}
        </button>
      </div>
    </section>
  );
}
