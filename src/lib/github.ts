import "server-only";

import { siteConfig } from "@/config/site";
import type {
  FetchError,
  GitHubRepo,
  GitHubUser,
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
      message:
        "Limite de requisições da API do GitHub atingido. Os projetos voltam a aparecer em instantes.",
      resetAt: reset ? Number(reset) : undefined,
    };
  }

  if (response.status === 404) {
    return {
      kind: "not_found",
      message: "Recurso não encontrado na API do GitHub.",
    };
  }

  return {
    kind: "unknown",
    message: `A API do GitHub respondeu ${response.status}.`,
  };
}

async function request<T>(
  path: string,
  accept?: string,
): Promise<Result<T>> {
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
    return {
      ok: false,
      error: {
        kind: "network",
        message: "Não foi possível alcançar a API do GitHub.",
      },
    };
  }
}

export async function getProfile(): Promise<Result<GitHubUser>> {
  return request<GitHubUser>(`/users/${siteConfig.githubUser}`);
}

/** README do repositório de perfil (`user/user`), se existir. */
export async function getProfileReadme(): Promise<Result<string>> {
  const user = siteConfig.githubUser;
  return request<string>(
    `/repos/${user}/${user}/readme`,
    "application/vnd.github.raw",
  );
}

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

/** Lista de linguagens presentes, para alimentar o filtro. */
export function collectLanguages(repos: Repo[]): string[] {
  const languages = new Set<string>();
  for (const repo of repos) {
    if (repo.language) languages.add(repo.language);
  }
  return [...languages].sort((a, b) => a.localeCompare(b));
}
