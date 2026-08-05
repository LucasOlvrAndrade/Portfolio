import { Section } from "@/components/ui/Section";
import { ErrorState } from "@/components/ui/ErrorState";
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
        <ProjectExplorer
          repos={repos.data}
          languages={collectLanguages(repos.data)}
        />
      )}
    </Section>
  );
}
