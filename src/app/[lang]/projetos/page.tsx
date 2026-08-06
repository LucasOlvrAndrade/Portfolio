import { Suspense, ViewTransition } from "react";
import { notFound } from "next/navigation";

import { Projects, ProjectsFallback } from "@/components/sections/Projects";
import { getI18n } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { sectionMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projetos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return sectionMetadata(lang, "projects");
}

export default async function ProjectsPage() {
  const { copy } = await getI18n();

  return (
    /*
      O envelope direcional emparelha com o da página de detalhe: é ele
      que dá sentido de "avançando" ao abrir um projeto e de "voltando"
      ao sair. O morph do card para o cabeçalho depende disto existir dos
      dois lados.
    */
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
      <div>
        {/* Os repositórios são buscados à parte para que o cabeçalho da
            página apareça na hora e o skeleton cubra só a lista. */}
        <Suspense
          fallback={
            <ProjectsFallback
              section={copy.sections.projects}
              loading={copy.explorer.loading}
            />
          }
        >
          <Projects />
        </Suspense>
      </div>
    </ViewTransition>
  );
}
