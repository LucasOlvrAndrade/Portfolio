import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { getCopyFor } from "@/i18n";
import type { Locale } from "@/i18n/config";
import {
  sectionAlternates,
  sectionPath,
  type SectionKey,
} from "@/i18n/routes";

/**
 * Metadados de uma seção que virou rota.
 *
 * Quatro páginas pediriam o mesmo bloco quatro vezes; o que muda entre
 * elas é só a chave. O `title` é curto de propósito — o `template` do
 * layout raiz acrescenta o nome.
 */
export function sectionMetadata(locale: Locale, key: SectionKey): Metadata {
  const section = getCopyFor(locale).sections[key];
  const url = `${siteConfig.url}${sectionPath(locale, key)}`;

  return {
    title: section.nav,
    description: section.metaDescription,
    alternates: {
      canonical: url,
      languages: sectionAlternates(siteConfig.url, key),
    },
    openGraph: {
      title: section.nav,
      description: section.metaDescription,
      url,
    },
  };
}
