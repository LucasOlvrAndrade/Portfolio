import { ViewTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { LanguageBar } from "@/components/ui/LanguageBar";
import { TranslationNotice } from "@/components/ui/TranslationNotice";
import { siteConfig } from "@/config/site";
import { getCopyFor, getI18n } from "@/i18n";
import { fill, isLocale, locales, localeMeta } from "@/i18n/config";
import { projectPath } from "@/i18n/routes";
import {
  getRepo,
  getRepoLanguages,
  getRepoReadme,
  getRepos,
} from "@/lib/github";
import { parseProfileReadme } from "@/lib/readme";

export const revalidate = 3600;

/**
 * Só existem rotas para os repositórios que a listagem mostra.
 *
 * `lang` não aparece aqui: quem o enumera é o `generateStaticParams` do
 * layout raiz, e o Next combina os dois — cada repositório ganha uma
 * rota por idioma.
 */
export async function generateStaticParams() {
  const repos = await getRepos();
  if (!repos.ok) return [];
  return repos.data.map((repo) => ({ nome: repo.name }));
}

function humanize(name: string): string {
  return name.replace(/[-_]/g, " ");
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projetos/[nome]">): Promise<Metadata> {
  const { lang, nome } = await params;
  if (!isLocale(lang)) notFound();

  const copy = getCopyFor(lang);
  const result = await getRepo(nome, lang);

  if (!result.ok) return { title: copy.project.notFound };

  const repo = result.data;
  const title = humanize(repo.name);
  const description =
    repo.description ??
    fill(copy.project.fallbackDescription, {
      name: title,
      user: siteConfig.githubUser,
    });

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}${projectPath(lang, repo.name)}`,
      languages: Object.fromEntries(
        locales.map((locale) => [
          localeMeta[locale].html,
          `${siteConfig.url}${projectPath(locale, repo.name)}`,
        ]),
      ),
    },
    openGraph: { title, description, type: "article" },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/[lang]/projetos/[nome]">) {
  const { nome } = await params;
  const { locale, copy, intl } = await getI18n();

  const repoResult = await getRepo(nome, locale);
  if (!repoResult.ok) notFound();

  const repo = repoResult.data;

  // README e linguagens são independentes — buscados em paralelo.
  const [readmeResult, languagesResult] = await Promise.all([
    getRepoReadme(repo.name, locale),
    getRepoLanguages(repo.name),
  ]);

  const readme = readmeResult.ok ? readmeResult.data : null;
  const sections = readme ? parseProfileReadme(readme.markdown) : [];

  const languages = languagesResult.ok ? languagesResult.data : {};
  const updatedAt = new Date(repo.pushedAt);

  const dateFormatter = new Intl.DateTimeFormat(intl, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      default="none"
    >
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-14 sm:pt-20">
        <Link
          href={projectPath(locale)}
          transitionTypes={["nav-back"]}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-accent"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-3.5"
            aria-hidden="true"
          >
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
          {copy.project.back}
        </Link>

        {/*
          Mesmo `name` do card na listagem: o navegador entende que é o
          mesmo objeto e faz o card crescer até virar este cabeçalho, em
          vez de uma tela sumir e outra aparecer.
        */}
        <ViewTransition name={`repo-${repo.id}`} share="morph" default="none">
          <header className="mt-8 rounded-xl border border-border bg-surface p-7 sm:p-8">
            {repo.featured && (
              <span className="mb-4 inline-block rounded-full bg-accent-subtle px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
                {copy.card.featured}
              </span>
            )}

            <h1 className="text-balance text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              {humanize(repo.name)}
            </h1>

            {repo.description && (
              <p className="mt-4 text-pretty text-base leading-relaxed text-muted">
                {repo.description}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-accent-hover"
              >
                {copy.project.codeOnGitHub}
              </a>

              {repo.homepage && (
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
                >
                  {copy.project.viewLive}
                </a>
              )}
            </div>
          </header>
        </ViewTransition>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-border py-7 sm:grid-cols-4">
          <Fact label={copy.project.lastCommit}>
            <time dateTime={repo.pushedAt}>
              {dateFormatter.format(updatedAt)}
            </time>
          </Fact>
          <Fact label={copy.project.language}>{repo.language ?? "—"}</Fact>
          <Fact label={copy.project.stars}>{repo.stars}</Fact>
          <Fact label={copy.project.forks}>{repo.forks}</Fact>
        </dl>

        {Object.keys(languages).length > 0 && (
          <section className="mt-12">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {copy.project.composition}
            </h2>
            <div className="mt-5">
              <LanguageBar
                bytes={languages}
                label={copy.project.composition}
              />
            </div>
          </section>
        )}

        <section className="mt-14">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {copy.project.about}
          </h2>

          {sections.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-border p-7 text-sm text-muted">
              {copy.project.noReadme}{" "}
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-4"
              >
                {copy.project.seeCode}
              </a>
            </p>
          ) : (
            <>
              {readme && !readme.localized && (
                <TranslationNotice className="mt-6">
                  {copy.project.readmeNotTranslated}
                </TranslationNotice>
              )}

              {/* `lang` marca o bloco que ficou no idioma de origem, para
                  o leitor de tela trocar de voz. O aviso acima fica fora
                  dele, para ser lido na voz da página. */}
              <div
                lang={readme?.localized === false ? "pt-BR" : undefined}
                className="mt-6 space-y-9"
              >
                {sections.map((section, index) => (
                  <div key={section.heading}>
                    {/* O primeiro título costuma repetir o nome do projeto,
                        que já está no cabeçalho acima. */}
                    {index > 0 && (
                      <h3 className="mb-3 text-base font-medium tracking-tight text-text">
                        {section.heading}
                      </h3>
                    )}

                    {section.paragraphs.length > 0 && (
                      <div className="space-y-4">
                        {section.paragraphs.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-pretty text-base leading-relaxed text-muted"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}

                    {section.bullets.length > 0 && (
                      <ul className="mt-4 space-y-2.5">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex gap-3 text-sm leading-snug text-muted"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-1.5 size-1 shrink-0 rounded-full bg-accent"
                            />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </article>
    </ViewTransition>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-text">{children}</dd>
    </div>
  );
}
