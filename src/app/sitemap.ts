import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { locales, localeMeta } from "@/i18n/config";
import { sectionPath } from "@/i18n/routes";

/**
 * Uma URL por idioma. As rotas /sobre, /projetos, /servicos etc. são
 * redirecionamentos para âncoras da mesma página, então não entram: sitemap
 * lista páginas, e página aqui é uma só, em dois idiomas. O `alternates`
 * diz ao buscador que /pt e /en são a mesma coisa em línguas diferentes.
 *
 * A política de privacidade é a exceção: página própria, com URL própria.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [localeMeta[l].html, `${siteConfig.url}/${l}`]));
  const privacyLanguages = Object.fromEntries(
    locales.map((l) => [localeMeta[l].html, `${siteConfig.url}${sectionPath(l, "privacy")}`]),
  );
  return [
    ...locales.map((l) => ({
      url: `${siteConfig.url}/${l}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: l === "pt" ? 1 : 0.8,
      alternates: { languages },
    })),
    // Página de venda: a que existe para ser achada na busca.
    ...locales.map((l) => ({
      url: `${siteConfig.url}${sectionPath(l, "barbershop")}`,
      lastModified: new Date("2026-09-23"),
      changeFrequency: "monthly" as const,
      priority: l === "pt" ? 0.9 : 0.6,
      alternates: {
        languages: Object.fromEntries(
          locales.map((o) => [localeMeta[o].html, `${siteConfig.url}${sectionPath(o, "barbershop")}`]),
        ),
      },
    })),
    ...locales.map((l) => ({
      url: `${siteConfig.url}${sectionPath(l, "privacy")}`,
      lastModified: new Date("2026-09-23"),
      changeFrequency: "yearly" as const,
      priority: 0.2,
      alternates: { languages: privacyLanguages },
    })),
  ];
}
