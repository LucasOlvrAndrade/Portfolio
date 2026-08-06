import { lang } from "next/root-params";
import { notFound } from "next/navigation";

import { isLocale, localeMeta, type Locale } from "./config";
import { pt, type Dictionary } from "./dictionaries/pt";
import { en, type Translation } from "./dictionaries/en";

/**
 * O texto do site em um idioma.
 *
 * É `Translation<Dictionary>`, e não `Dictionary`: o `as const` do
 * arquivo português produz tipos literais, e o inglês não caberia neles.
 */
export type Copy = Translation<Dictionary>;

const dictionaries: Record<Locale, Copy> = { pt, en };

export function getCopyFor(locale: Locale): Copy {
  return dictionaries[locale];
}

/**
 * O idioma da rota atual.
 *
 * `lang` vem de `next/root-params` — como `[lang]` é o segmento acima do
 * layout raiz, qualquer componente de servidor pode lê-lo sem que ele
 * seja passado de prop em prop pela árvore. Componentes cliente não
 * conseguem: para eles, o pedaço de texto viaja como prop.
 *
 * Um idioma desconhecido em `/xx` vira 404, e não um erro de runtime.
 */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!value || !isLocale(value)) notFound();
  return value;
}

export async function getCopy(): Promise<Copy> {
  return getCopyFor(await getLocale());
}

/** Idioma e texto de uma vez — o par que quase todo componente precisa. */
export async function getI18n(): Promise<{
  locale: Locale;
  copy: Copy;
  /** Tag para `Intl`: formatação de data e `localeCompare`. */
  intl: string;
}> {
  const locale = await getLocale();
  return {
    locale,
    copy: getCopyFor(locale),
    intl: localeMeta[locale].intl,
  };
}
