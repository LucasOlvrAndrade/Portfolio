"use client";

import { useMemo, useState } from "react";

import { RepoCard, type CardCopy } from "./RepoCard";
import { Reveal } from "./Reveal";
import { fill } from "@/i18n/config";
import { languageColor } from "@/lib/languages";
import type { Repo } from "@/lib/types";

type SortKey = "recent" | "stars" | "name";

type ExplorerCopy = {
  filterByLanguage: string;
  all: string;
  sortLabel: string;
  sortRecent: string;
  sortStars: string;
  sortName: string;
  emptyForLanguage: string;
  viewAll: string;
  countOne: string;
  countMany: string;
  loading: string;
};

const ALL = "__all__";

export function ProjectExplorer({
  repos,
  languages,
  copy,
  card,
  intl,
  projectPath,
}: {
  repos: Repo[];
  languages: string[];
  copy: ExplorerCopy;
  card: CardCopy;
  /** Tag de idioma para datas e ordenação alfabética. */
  intl: string;
  /** Prefixo da rota de detalhe, já com o idioma: `/pt/projetos`. */
  projectPath: string;
}) {
  const [language, setLanguage] = useState<string>(ALL);
  const [sort, setSort] = useState<SortKey>("recent");

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "recent", label: copy.sortRecent },
    { value: "stars", label: copy.sortStars },
    { value: "name", label: copy.sortName },
  ];

  const visible = useMemo(() => {
    const filtered =
      language === ALL
        ? repos
        : repos.filter((repo) => repo.language === language);

    return [...filtered].sort((a, b) => {
      // Destaques ficam sempre no topo, qualquer que seja a ordenação.
      if (a.featured !== b.featured) return a.featured ? -1 : 1;

      switch (sort) {
        case "stars":
          return b.stars - a.stars || Date.parse(b.pushedAt) - Date.parse(a.pushedAt);
        case "name":
          return a.name.localeCompare(b.name, intl);
        default:
          return Date.parse(b.pushedAt) - Date.parse(a.pushedAt);
      }
    });
  }, [repos, language, sort, intl]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {languages.length > 0 && (
          <div
            role="group"
            aria-label={copy.filterByLanguage}
            className="flex flex-wrap gap-2"
          >
            <FilterChip
              active={language === ALL}
              onClick={() => setLanguage(ALL)}
            >
              {copy.all}
              <span className="ml-1.5 text-[10px] opacity-60">
                {repos.length}
              </span>
            </FilterChip>

            {languages.map((item) => (
              <FilterChip
                key={item}
                active={language === item}
                onClick={() => setLanguage(item)}
              >
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full"
                  style={{ backgroundColor: languageColor(item) }}
                />
                {item}
              </FilterChip>
            ))}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <label htmlFor="ordenar" className="text-xs text-muted">
            {copy.sortLabel}
          </label>
          <select
            id="ordenar"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text transition-colors hover:border-accent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          {fill(copy.emptyForLanguage, { language })}{" "}
          <button
            type="button"
            onClick={() => setLanguage(ALL)}
            className="text-accent underline underline-offset-4"
          >
            {copy.viewAll}
          </button>
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {visible.map((repo, index) => (
            <Reveal
              key={repo.id}
              // Todos os cards com a mesma largura. O destaque continua
              // marcado pela borda de acento e pelo selo, e pela posição:
              // destacados vêm sempre primeiro na ordenação.
              className="h-full"
              // Escalonamento sutil, limitado para não atrasar demais
              // os últimos cards em listas grandes.
              delay={Math.min(index, 6) * 60}
            >
              <RepoCard
                repo={repo}
                copy={card}
                intl={intl}
                projectPath={projectPath}
              />
            </Reveal>
          ))}
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {fill(visible.length === 1 ? copy.countOne : copy.countMany, {
          count: visible.length,
        })}
      </p>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
        active
          ? "border-accent bg-accent-subtle text-accent"
          : "border-border bg-surface text-muted hover:border-accent/50 hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
