import "server-only";

import { siteConfig } from "@/config/site";
import { defaultLocale, type Locale } from "@/i18n/config";
import type {
  FetchError,
  GitHubRepo,
  GitHubUser,
  Readme,
  Repo,
  Result,
} from "./types";

const API = "https://api.github.com";

/**
 * Uma hora. As respostas ficam em cache no servidor e a API do GitHub
 * é chamada ~1x/hora no total, e não 1x por visitante.
 */
const REVALIDATE_SECONDS = 3600;

/**
 * O token é lido apenas aqui, no servidor. O arquivo é marcado com
 * `server-only`: se algum componente cliente importar este módulo por
 * engano, o build falha em vez de vazar o segredo para o bundle.
 */
function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function classifyResponse(response: Response): FetchError {
  const remaining = response.headers.get("x-ratelimit-remaining");
  const reset = response.headers.get("x-ratelimit-reset");

  if (
    (response.status === 403 || response.status === 429) &&
    remaining === "0"
  ) {
    return {
      kind: "rate_limit",
      resetAt: reset ? Number(reset) : undefined,
    };
  }

  if (response.status === 404) {
    return { kind: "not_found" };
  }

  return { kind: "unknown", status: response.status };
}

async function request<T>(path: string, accept?: string): Promise<Result<T>> {
  try {
    const headers = buildHeaders() as Record<string, string>;
    if (accept) headers.Accept = accept;

    const response = await fetch(`${API}${path}`, {
      headers,
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return { ok: false, error: classifyResponse(response) };
    }

    const data = accept?.includes("raw")
      ? ((await response.text()) as T)
      : ((await response.json()) as T);

    return { ok: true, data };
  } catch {
    // Falha de rede/DNS: a página ainda renderiza, apenas sem os dados.
    return { ok: false, error: { kind: "network" } };
  }
}

const RAW = "application/vnd.github.raw";

/**
 * README de um repositório no idioma pedido.
 *
 * A convenção é `README.<locale>.md` ao lado do `README.md`. O idioma
 * padrão usa o endpoint `/readme`, que acha o arquivo seja qual for o
 * nome e a pasta. Quando o traduzido não existe — o caso comum hoje —
 * devolve o original com `localized: false`, e a página avisa o leitor.
 */
async function fetchReadme(
  repo: string,
  locale: Locale,
): Promise<Result<Readme>> {
  const user = siteConfig.githubUser;

  if (locale !== defaultLocale) {
    const translated = await request<string>(
      `/repos/${user}/${repo}/contents/README.${locale}.md`,
      RAW,
    );

    if (translated.ok) {
      return { ok: true, data: { markdown: translated.data, localized: true } };
    }
    // 404 aqui é o esperado, não um problema: segue para o original.
  }

  const original = await request<string>(`/repos/${user}/${repo}/readme`, RAW);
  if (!original.ok) return original;

  return {
    ok: true,
    data: { markdown: original.data, localized: locale === defaultLocale },
  };
}

export async function getProfile(): Promise<Result<GitHubUser>> {
  return request<GitHubUser>(`/users/${siteConfig.githubUser}`);
}

/** README do repositório de perfil (`user/user`), se existir. */
export async function getProfileReadme(
  locale: Locale,
): Promise<Result<Readme>> {
  return fetchReadme(siteConfig.githubUser, locale);
}

/** README de um repositório, em Markdown cru. */
export async function getRepoReadme(
  name: string,
  locale: Locale,
): Promise<Result<Readme>> {
  return fetchReadme(name, locale);
}

/**
 * A listagem NÃO recebe idioma de propósito: é a mesma resposta da API
 * para os dois, e uma busca só serve as duas rotas estáticas. Quem troca
 * a descrição é `localize`, depois, sem custo de rede.
 */
export async function getRepos(): Promise<Result<Repo[]>> {
  const result = await request<GitHubRepo[]>(
    `/users/${siteConfig.githubUser}/repos?per_page=100&sort=updated`,
  );

  if (!result.ok) return result;

  const hidden = new Set<string>(
    siteConfig.hidden.map((name) => name.toLowerCase()),
  );
  const featured = new Set<string>(
    siteConfig.featured.map((name) => name.toLowerCase()),
  );

  const repos = result.data
    .filter((repo) => !repo.fork && !repo.archived)
    .filter((repo) => !hidden.has(repo.name.toLowerCase()))
    .map<Repo>((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      // `homepage` pode vir como string vazia, o que não é um link válido.
      homepage: repo.homepage?.trim() ? repo.homepage.trim() : null,
      pushedAt: repo.pushed_at,
      topics: repo.topics ?? [],
      featured: featured.has(repo.name.toLowerCase()),
    }))
    .sort((a, b) => {
      // Destacados primeiro; dentro de cada grupo, mais recentes primeiro.
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return Date.parse(b.pushedAt) - Date.parse(a.pushedAt);
    });

  return { ok: true, data: repos };
}

/**
 * Troca a descrição pela versão do idioma, quando existe uma em
 * `siteConfig.descriptions`.
 *
 * O GitHub guarda uma única descrição por repositório. Esta é a única
 * forma de a vitrine em inglês não exibir texto em português — e o
 * motivo de a substituição acontecer aqui, e não no card: `RepoCard` é
 * renderizado dentro de um componente cliente e não pode importar este
 * módulo, que é `server-only`.
 */
export function localize(repos: Repo[], locale: Locale): Repo[] {
  const overrides: Record<string, string> | undefined =
    locale === defaultLocale ? undefined : siteConfig.descriptions[locale];

  if (!overrides) return repos;

  return repos.map((repo) =>
    overrides[repo.name]
      ? { ...repo, description: overrides[repo.name] }
      : repo,
  );
}

/**
 * Um repositório específico, já normalizado. Usado pela página de
 * detalhe; devolve `not_found` para repositórios ocultos, forks e
 * arquivados, para que a rota não exponha o que a listagem esconde.
 */
export async function getRepo(
  name: string,
  locale: Locale,
): Promise<Result<Repo>> {
  const repos = await getRepos();
  if (!repos.ok) return repos;

  const repo = localize(repos.data, locale).find(
    (item) => item.name.toLowerCase() === name.toLowerCase(),
  );

  if (!repo) {
    return { ok: false, error: { kind: "not_found" } };
  }

  return { ok: true, data: repo };
}

/** Bytes por linguagem — alimenta a barra de composição do projeto. */
export async function getRepoLanguages(
  name: string,
): Promise<Result<Record<string, number>>> {
  return request<Record<string, number>>(
    `/repos/${siteConfig.githubUser}/${name}/languages`,
  );
}

/** Lista de linguagens presentes, para alimentar o filtro. */
export function collectLanguages(repos: Repo[]): string[] {
  const languages = new Set<string>();
  for (const repo of repos) {
    if (repo.language) languages.add(repo.language);
  }
  return [...languages].sort((a, b) => a.localeCompare(b));
}
