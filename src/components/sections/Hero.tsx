import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { getI18n } from "@/i18n";
import { fill } from "@/i18n/config";
import { sectionPath } from "@/i18n/routes";
import type { GitHubUser } from "@/lib/types";

/** `profile` pode ser null se a API falhar — o Hero continua renderizando. */
export async function Hero({ profile }: { profile: GitHubUser | null }) {
  const { locale, copy } = await getI18n();

  const work = siteConfig.work;
  const name = profile?.name ?? "Lucas Andrade";
  const location = profile?.location;
  const company = profile?.company;

  return (
    <section className="mx-auto max-w-5xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-28">
      <div className="flex flex-col-reverse items-start gap-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          {/*
            Cargo + empregador. O logo vai sobre uma placa branca: em tema
            claro ela se apoia na borda; em tema escuro salta do fundo e
            sustenta o contraste do cinza da marca, sem alterar as cores
            originais do logotipo.
          */}
          <div className="animate-fade-up flex flex-wrap items-center gap-x-3 gap-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {work.position[locale]}
            </p>

            <span aria-hidden className="text-border">
              /
            </span>

            <a
              href={work.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={fill(copy.hero.companyLink, {
                company: work.company,
              })}
              className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-white py-1.5 pl-3 pr-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--brand-green)] hover:shadow-md"
              style={
                {
                  "--brand-green": work.brand.green,
                } as React.CSSProperties
              }
            >
              <Image
                src={work.logo}
                alt={fill(copy.hero.companyLogoAlt, { company: work.company })}
                width={work.logoWidth}
                height={work.logoHeight}
                priority
                className="h-5 w-auto"
              />
              {/* Barra tricolor da marca, ecoando o logo e marcando o link. */}
              <span
                aria-hidden
                className="h-5 w-1 shrink-0 rounded-full"
                style={{
                  background: `linear-gradient(180deg, ${work.brand.green} 0 33%, ${work.brand.ink} 33% 66%, ${work.brand.amber} 66% 100%)`,
                }}
              />
            </a>
          </div>

          <h1 className="animate-fade-up delay-75 mt-4 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-text sm:text-6xl">
            {name}
          </h1>

          <p className="animate-fade-up delay-150 mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">
            {copy.hero.tagline}
          </p>

          {(location || company) && (
            <p className="animate-fade-up delay-150 mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted">
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3.5"
                    aria-hidden="true"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {location}
                </span>
              )}
              {company && (
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3.5"
                    aria-hidden="true"
                  >
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
                  </svg>
                  {company}
                </span>
              )}
            </p>
          )}

          <div className="animate-fade-up delay-225 mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={sectionPath(locale, "projects")}
              transitionTypes={["nav-forward"]}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-accent-hover"
            >
              {copy.hero.viewProjects}
            </Link>
            <Link
              href={sectionPath(locale, "contact")}
              transitionTypes={["nav-forward"]}
              className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
            >
              {copy.hero.getInTouch}
            </Link>
          </div>
        </div>

        {profile?.avatar_url && (
          <div className="animate-fade-in shrink-0">
            <Image
              src={profile.avatar_url}
              alt={fill(copy.hero.avatarAlt, { name })}
              width={132}
              height={132}
              priority
              className="size-24 rounded-2xl border border-border object-cover sm:size-33"
            />
          </div>
        )}
      </div>
    </section>
  );
}
