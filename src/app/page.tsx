import { Suspense, ViewTransition } from "react";

import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Projects, ProjectsFallback } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { getProfile, getProfileReadme } from "@/lib/github";
import { parseProfileReadme } from "@/lib/readme";

/**
 * A página é pré-renderizada e revalidada de hora em hora (ISR).
 * A API do GitHub é consultada ~1x/hora no total, não 1x por visitante.
 */
export const revalidate = 3600;

export default async function Home() {
  // Perfil e README são independentes — buscados em paralelo.
  const [profileResult, readmeResult] = await Promise.all([
    getProfile(),
    getProfileReadme(),
  ]);

  const profile = profileResult.ok ? profileResult.data : null;

  // Sem repositório de perfil (404), a seção "Sobre" cai na bio.
  const sections = readmeResult.ok
    ? parseProfileReadme(readmeResult.data)
    : [];

  return (
    /*
      O envelope direcional fica na página, não no layout: layouts
      persistem entre navegações, então `enter` e `exit` nunca disparam
      lá. `default: "none"` evita que a navegação do navegador (botão
      voltar) e as revelações de Suspense produzam deslize lateral.
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
        <Hero profile={profile} />
        <About sections={sections} bio={profile?.bio ?? null} />

        {/* Os repositórios são buscados à parte para que o restante da
            página apareça na hora e o skeleton cubra só esta seção. */}
        <Suspense fallback={<ProjectsFallback />}>
          <Projects />
        </Suspense>

        <Skills />
        <Contact />
      </div>
    </ViewTransition>
  );
}
