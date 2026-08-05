import { Section } from "@/components/ui/Section";
import { ErrorState } from "@/components/ui/ErrorState";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProjectExplorer } from "@/components/ui/ProjectExplorer";
import { RepoSkeletonGrid } from "@/components/ui/RepoSkeleton";
import { siteConfig } from "@/config/site";
import { collectLanguages, getRepos } from "@/lib/github";

const EYEBROW = "Projetos";
const TITLE = "O que eu venho construindo";
const DESCRIPTION =
  "Carregado direto da API do GitHub — sempre atualizado, sem edição manual. Forks e repositórios arquivados ficam de fora.";

/** Exibido enquanto a busca na API não resolve (via Suspense). */
export function ProjectsFallback() {
  return (
    <Section
      id="projetos"
      eyebrow={EYEBROW}
      title={TITLE}
      description={DESCRIPTION}
    >
      <RepoSkeletonGrid />
    </Section>
  );
}

export async function Projects() {
  const repos = await getRepos();

  return (
    <Section
      id="projetos"
      eyebrow={EYEBROW}
      title={TITLE}
      description={DESCRIPTION}
    >
      {!repos.ok ? (
        <ErrorState error={repos.error} />
      ) : repos.data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Nenhum repositório público para exibir ainda.{" "}
          <a
            href={`https://github.com/${siteConfig.githubUser}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4"
          >
            Ver perfil no GitHub
          </a>
        </p>
      ) : (
        <>
          <ProjectExplorer
            repos={repos.data}
            languages={collectLanguages(repos.data)}
          />

          <div className="mt-14 flex justify-center">
            <GradientButton asChild variant="brand">
              <a
                href={`https://github.com/${siteConfig.githubUser}?tab=repositories`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver todos no GitHub
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            </GradientButton>
          </div>
        </>
      )}
    </Section>
  );
}
