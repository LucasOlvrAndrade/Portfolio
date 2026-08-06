/** Formas da API do GitHub, reduzidas aos campos que o site consome. */

export type GitHubUser = {
  login: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  avatar_url: string;
  twitter_username: string | null;
  html_url: string;
  public_repos: number;
};

export type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  homepage: string | null;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  topics?: string[];
};

/** Repositório já normalizado para a UI. */
export type Repo = {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  homepage: string | null;
  pushedAt: string;
  topics: string[];
  featured: boolean;
};

/**
 * README já resolvido para um idioma.
 *
 * `localized` distingue "este é o README em inglês" de "não existe um, e
 * isto aqui é o português". A página usa a diferença para avisar o
 * leitor, em vez de servir outro idioma sem explicação.
 */
export type Readme = {
  markdown: string;
  localized: boolean;
};

/**
 * Erros são valores, não exceções — assim a página sempre renderiza
 * um estado, nunca uma tela quebrada.
 *
 * O erro carrega o que aconteceu, não como contá-lo: a frase é montada
 * na camada de UI, a partir do dicionário do idioma da rota. Guardar a
 * mensagem aqui obrigaria a camada de dados a conhecer o idioma.
 */
export type FetchErrorKind = "rate_limit" | "not_found" | "network" | "unknown";

export type FetchError = {
  kind: FetchErrorKind;
  /** Código HTTP, quando houve resposta. Só usado em `unknown`. */
  status?: number;
  /** Epoch em segundos em que o rate limit é restaurado. */
  resetAt?: number;
};

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: FetchError };
