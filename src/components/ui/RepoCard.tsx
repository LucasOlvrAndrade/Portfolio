import { ViewTransition } from "react";
import Link from "next/link";

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
    /*
      Mesmo `name` do cabeçalho em /projetos/[nome]: o navegador
      reconhece o card e o cabeçalho como o MESMO objeto e anima de um
      para o outro. É o que comunica "mesma coisa, indo mais fundo" em
      vez de "uma tela sumiu, outra apareceu".
    */
    <ViewTransition name={`repo-${repo.id}`} share="morph" default="none">
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

      {/*
        O card inteiro leva para a página do projeto — não mais direto ao
        GitHub. Os links externos vivem lá, o que também elimina o
        aninhamento de elementos interativos que existia aqui.
      */}
      <h3 className="text-base font-medium tracking-tight text-text">
        <Link
          href={`/projetos/${repo.name}`}
          transitionTypes={["nav-forward"]}
          className="after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
        >
          {humanize(repo.name)}
        </Link>
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
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-accent"
            />
            Publicado
          </span>
        )}
        </div>
      </article>
    </ViewTransition>
  );
}
