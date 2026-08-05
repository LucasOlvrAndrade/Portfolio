import { LanguageDot } from "./LanguageDot";
import type { Repo } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Transforma "Calculadora-java" em "Calculadora java" para leitura. */
function humanize(name: string): string {
  return name.replace(/[-_]/g, " ");
}

export function RepoCard({ repo }: { repo: Repo }) {
  const updatedAt = new Date(repo.pushedAt);
  // Quando a API não detecta linguagem, o primeiro topic serve de rótulo.
  const fallbackTag = repo.language ? null : repo.topics[0];

  return (
    <article
      className={`group relative flex h-full flex-col rounded-xl border bg-surface p-6 transition-colors hover:border-accent/60 ${
        repo.featured ? "border-accent/40" : "border-border"
      }`}
    >
      {repo.featured && (
        <span className="mb-3 w-fit rounded-full bg-accent-subtle px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
          Destaque
        </span>
      )}

      <h3 className="text-base font-medium tracking-tight text-text">
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
        >
          {humanize(repo.name)}
        </a>
      </h3>

      {repo.description && (
        <p className="mt-2.5 text-pretty text-sm leading-relaxed text-muted">
          {repo.description}
        </p>
      )}

      {/* `mt-auto` empurra os metadados para o rodapé, alinhando os cards. */}
      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {repo.language && <LanguageDot language={repo.language} />}

          {fallbackTag && (
            <span className="font-mono text-xs text-muted">{fallbackTag}</span>
          )}

          {/* Estrelas e forks só aparecem quando existem — evita uma
              fileira de zeros em contas novas. */}
          {repo.stars > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-3.5"
                aria-hidden="true"
              >
                <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2Z" />
              </svg>
              <span className="sr-only">Estrelas: </span>
              {repo.stars}
            </span>
          )}

          {repo.forks > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-3.5"
                aria-hidden="true"
              >
                <circle cx="12" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="6" r="3" />
                <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9M12 12v3" />
              </svg>
              <span className="sr-only">Forks: </span>
              {repo.forks}
            </span>
          )}

          <time
            dateTime={repo.pushedAt}
            className="text-xs text-muted"
            title={`Último commit em ${updatedAt.toLocaleDateString("pt-BR")}`}
          >
            {dateFormatter.format(updatedAt)}
          </time>
        </div>

        {repo.homepage && (
          // z-10 mantém este link clicável por cima da área do card.
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent underline-offset-4 hover:underline"
          >
            Ver projeto no ar
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-3.5"
              aria-hidden="true"
            >
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
            <span className="sr-only">({humanize(repo.name)})</span>
          </a>
        )}
      </div>
    </article>
  );
}
