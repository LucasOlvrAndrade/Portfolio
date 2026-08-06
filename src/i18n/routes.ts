import {
  defaultLocale,
  isLocale,
  locales,
  localeMeta,
  type Locale,
} from "./config";

/**
 * As seções que deixaram de ser âncora e viraram rota.
 *
 * Três nomes distintos convivem aqui, e vale separá-los:
 *
 * - a CHAVE (`about`) identifica a seção no código e no dicionário;
 * - a PASTA (`sobre`) é o diretório real em `app/[lang]/`;
 * - o SLUG (`about` em inglês, `sobre` em português) é a URL pública.
 *
 * Há uma árvore de rotas só, nomeada em português, porque o português é
 * o idioma padrão. O slug em inglês chega até ela por reescrita no
 * `proxy`, sem duplicar arquivo nenhum.
 *
 * A ordem aqui é a ordem da navegação.
 */
export const sectionKeys = [
  "about",
  "projects",
  "skills",
  "contact",
] as const;

export type SectionKey = (typeof sectionKeys)[number];

/** Diretório real da rota, sempre em português. */
const folders: Record<SectionKey, string> = {
  about: "sobre",
  projects: "projetos",
  skills: "tecnologias",
  contact: "contato",
};

/** URL pública de cada seção, por idioma. */
const slugs: Record<Locale, Record<SectionKey, string>> = {
  pt: {
    about: "sobre",
    projects: "projetos",
    skills: "tecnologias",
    contact: "contato",
  },
  en: {
    about: "about",
    projects: "projects",
    skills: "skills",
    contact: "contact",
  },
};

export function folderFor(key: SectionKey): string {
  return folders[key];
}

export function slugFor(locale: Locale, key: SectionKey): string {
  return slugs[locale][key];
}

/** URL pública de uma seção: `/en/about`. */
export function sectionPath(locale: Locale, key: SectionKey): string {
  return `/${locale}/${slugs[locale][key]}`;
}

/** URL pública da home do idioma. */
export function homePath(locale: Locale): string {
  return `/${locale}`;
}

/** URL da listagem de projetos, ou de um projeto específico. */
export function projectPath(locale: Locale, name?: string): string {
  const base = sectionPath(locale, "projects");
  return name ? `${base}/${name}` : base;
}

/** A seção a que um slug público corresponde, ou `null`. */
export function keyForSlug(locale: Locale, slug: string): SectionKey | null {
  const table = slugs[locale];
  for (const key of sectionKeys) {
    if (table[key] === slug) return key;
  }
  return null;
}

/** A seção a que uma pasta corresponde, ou `null`. */
export function keyForFolder(folder: string): SectionKey | null {
  for (const key of sectionKeys) {
    if (folders[key] === folder) return key;
  }
  return null;
}

/**
 * O mesmo lugar, no outro idioma.
 *
 * Trocar só o prefixo não basta desde que os slugs passaram a ser
 * traduzidos: `/pt/sobre` precisa virar `/en/about`, e não `/en/sobre`
 * — que existe, mas só para redirecionar de volta. O que segue depois
 * da seção (o nome de um projeto) atravessa intacto.
 */
export function translatePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return homePath(target);

  const source = isLocale(segments[0]) ? segments[0] : defaultLocale;
  const rest = isLocale(segments[0]) ? segments.slice(1) : segments;
  if (rest.length === 0) return homePath(target);

  const [segment, ...tail] = rest;
  const key = keyForSlug(source, segment) ?? keyForFolder(segment);
  const translated = key ? slugFor(target, key) : segment;

  return ["", target, translated, ...tail].join("/");
}

/**
 * Âncora antiga → rota nova.
 *
 * O site era uma página só, com `#sobre`, `#projetos` e companhia. Esses
 * links já foram compartilhados e precisam continuar chegando a algum
 * lugar — e o servidor NÃO pode ajudar: o fragmento da URL nunca entra
 * no pedido HTTP, então nenhum `redirect` do `next.config` o enxerga.
 * A tradução tem que acontecer no cliente, na home.
 *
 * O mapa aceita as âncoras dos dois idiomas e o nome das pastas, porque
 * todos já apareceram em links públicos em algum momento.
 */
export function legacyHashTargets(locale: Locale): Record<string, string> {
  const targets: Record<string, string> = {};

  for (const key of sectionKeys) {
    const destination = sectionPath(locale, key);
    targets[folders[key]] = destination;
    for (const other of locales) {
      targets[slugs[other][key]] = destination;
    }
  }

  return targets;
}

/**
 * Mapa de idioma → URL para o `hreflang` de uma seção. Cada idioma
 * aponta para o próprio slug, e não para o nome da pasta.
 */
export function sectionAlternates(
  origin: string,
  key: SectionKey,
): Record<string, string> {
  return Object.fromEntries(
    locales.map((locale) => [
      localeMeta[locale].html,
      `${origin}${sectionPath(locale, key)}`,
    ]),
  );
}
