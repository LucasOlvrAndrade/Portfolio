import { Section } from "@/components/ui/Section";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProjectExplorer } from "@/components/ui/ProjectExplorer";
import { RepoSkeletonGrid } from "@/components/ui/RepoSkeleton";
import { siteConfig } from "@/config/site";
import { getI18n, type Copy } from "@/i18n";
import { projectPath } from "@/i18n/routes";
import { collectLanguages, getRepos, localize } from "@/lib/github";

type ProjectsCopy = Copy["sections"]["projects"];

/**
 * Exibido enquanto a busca na API não resolve (via Suspense).
 *
 * Recebe o texto por prop em vez de buscá-lo: um `fallback` de Suspense
 * não pode suspender, e um componente `async` aqui suspenderia.
 */
export function ProjectsFallback({
  section,
  loading,
}: {
  section: ProjectsCopy;
  loading: string;
}) {
  return (
    <Section
      id="projects"
      eyebrow={section.eyebrow}
      title={section.title}
      description={section.description}
    >
      <RepoSkeletonGrid label={loading} />
    </Section>
  );
}

export async function Projects() {
  const { locale, copy, intl } = await getI18n();
  const section = copy.sections.projects;

  const repos = await getRepos();

  return (
    <Section
      id="projects"
      eyebrow={section.eyebrow}
      title={section.title}
      description={section.description}
    >
      {!repos.ok ? (
        <ErrorState error={repos.error} copy={copy.errors} intl={intl} />
      ) : repos.data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          {section.empty}{" "}
          <a
            href={`https://github.com/${siteConfig.githubUser}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4"
          >
            {section.viewProfile}
          </a>
        </p>
      ) : (
        <ProjectExplorer
          // A descrição em inglês é trocada aqui, no servidor: `RepoCard`
          // vive dentro de um componente cliente e não alcança o
          // `siteConfig` do servidor nem o módulo da API.
          repos={localize(repos.data, locale)}
          languages={collectLanguages(repos.data)}
          copy={copy.explorer}
          card={copy.card}
          intl={intl}
          projectPath={projectPath(locale)}
        />
      )}
    </Section>
  );
}
