import Image from "next/image";
import type { CSSProperties } from "react";

import type { Locale } from "@/i18n/config";

type Screen = { src: string; pt: string; en: string };

/**
 * Vitrine animada: um celular que passa pelas telas do produto, com a
 * legenda trocando junto. Só CSS: cada tela e cada legenda têm a mesma
 * animação de opacidade com um atraso escalonado (`--i`), então ficam
 * sincronizadas sem JavaScript nem estado. Quem pediu menos movimento vê
 * a primeira tela parada (ver `.showcase` no globals.css).
 */
export function PhoneShowcase({ screens, locale, alt }: { screens: readonly Screen[]; locale: Locale; alt: string }) {
  return (
    <figure className="showcase mx-auto w-full max-w-[220px]" style={{ "--n": screens.length } as CSSProperties}>
      <div className="relative aspect-[390/780] overflow-hidden rounded-[2rem] border-[6px] border-text bg-bg shadow-xl">
        {/* Entalhe do celular, só desenho. */}
        <div aria-hidden className="absolute left-1/2 top-1.5 z-10 h-3 w-14 -translate-x-1/2 rounded-full bg-text" />
        {screens.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt={i === 0 ? alt : ""}
            width={390}
            height={780}
            sizes="220px"
            priority={i === 0}
            className="showcase-slide absolute inset-0 h-full w-full object-cover object-top"
            style={{ "--i": i } as CSSProperties}
          />
        ))}
      </div>
      <figcaption className="relative mt-3 h-10 text-center text-xs leading-snug text-muted">
        {screens.map((s, i) => (
          <span key={s.src} className="showcase-slide absolute inset-x-0 top-0" style={{ "--i": i } as CSSProperties}>
            {s[locale]}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
