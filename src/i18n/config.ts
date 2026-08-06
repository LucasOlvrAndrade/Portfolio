/**
 * Identidade dos idiomas — sem dependência de servidor.
 *
 * Este arquivo é importado pelo `proxy.ts`, por componentes de servidor e
 * por componentes cliente. Por isso não traz `server-only` nem
 * `next/root-params`: qualquer um dos dois quebraria o bundle do cliente.
 */

export const locales = ["pt", "en"] as const;

export type Locale = (typeof locales)[number];

/**
 * Idioma servido quando o navegador não pede nada que saibamos atender.
 *
 * O tipo é o literal `"pt"`, não `Locale`: é o que faz `locale !==
 * defaultLocale` estreitar o tipo para os demais idiomas, e permite
 * indexar tabelas que só existem para tradução (como as descrições dos
 * repositórios, que o português não precisa).
 */
export const defaultLocale = "pt" satisfies Locale;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Metadados por idioma.
 *
 * `html` e `intl` são diferentes de propósito: o atributo `lang` do
 * documento aceita a tag de idioma sem região (`en`), mas `Intl` precisa
 * da região para escolher formato de data — `en` sozinho cai no padrão
 * do runtime, que no servidor da Vercel não é necessariamente o dos EUA.
 */
export const localeMeta = {
  pt: {
    /** Rótulo curto, exibido no botão de troca. */
    short: "PT",
    /** Nome do idioma no próprio idioma — convenção de seletores de idioma. */
    label: "Português",
    html: "pt-BR",
    intl: "pt-BR",
    og: "pt_BR",
  },
  en: {
    short: "EN",
    label: "English",
    html: "en",
    intl: "en-US",
    og: "en_US",
  },
} as const satisfies Record<Locale, unknown>;

/**
 * Substitui `{chave}` pelos valores dados.
 *
 * Os dicionários guardam só strings — nada de funções. É o que permite
 * passar um pedaço do dicionário como prop para um componente cliente:
 * função não atravessa a fronteira servidor/cliente, string atravessa.
 */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
