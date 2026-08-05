"use client";

import { useMemo, useState } from "react";

import { RepoCard } from "./RepoCard";
import { GlowCard } from "./spotlight-card";
import { Reveal } from "./Reveal";
import { languageColor } from "@/lib/languages";
import type { Repo } from "@/lib/types";

type SortKey = "recent" | "stars" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "stars", label: "Mais estrelas" },
  { value: "name", label: "Nome (A–Z)" },
];

const ALL = "__all__";

export function ProjectExplorer({
  repos,
  languages,
}: {
  repos: Repo[];
  languages: string[];
}) {
  const [language, setLanguage] = useState<string>(ALL);
  const [sort, setSort] = useState<SortKey>("recent");

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
          return a.name.localeCompare(b.name, "pt-BR");
        default:
          return Date.parse(b.pushedAt) - Date.parse(a.pushedAt);
      }
    });
  }, [repos, language, sort]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {languages.length > 0 && (
          <div
            role="group"
            aria-label="Filtrar por linguagem"
            className="flex flex-wrap gap-2"
          >
            <FilterChip
              active={language === ALL}
              onClick={() => setLanguage(ALL)}
            >
              Todos
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
            Ordenar
          </label>
          <select
            id="ordenar"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text transition-colors hover:border-accent"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Nenhum projeto em {language}.{" "}
          <button
            type="button"
            onClick={() => setLanguage(ALL)}
            className="text-accent underline underline-offset-4"
          >
            Ver todos
          </button>
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {visible.map((repo, index) => (
            <Reveal
              key={repo.id}
              className={`h-full ${repo.featured ? "sm:col-span-2" : ""}`}
              // Escalonamento sutil, limitado para não atrasar demais
              // os últimos cards em listas grandes.
              delay={Math.min(index, 6) * 60}
            >
              <GlowCard customSize className="h-full" glowColor="brand">
                <RepoCard repo={repo} />
              </GlowCard>
            </Reveal>
          ))}
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {visible.length} projeto{visible.length === 1 ? "" : "s"} exibido
        {visible.length === 1 ? "" : "s"}.
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
