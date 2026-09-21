import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { locales, localeMeta } from "@/i18n/config";

/**
 * Uma URL por idioma. As rotas /sobre, /projetos, /servicos etc. são
 * redirecionamentos para âncoras da mesma página, então não entram: sitemap
 * lista páginas, e página aqui é uma só, em dois idiomas. O `alternates`
 * diz ao buscador que /pt e /en são a mesma coisa em línguas diferentes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [localeMeta[l].html, `${siteConfig.url}/${l}`]));
  return locales.map((l) => ({
    url: `${siteConfig.url}/${l}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: l === "pt" ? 1 : 0.8,
    alternates: { languages },
  }));
}
