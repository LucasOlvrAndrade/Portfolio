import { Suspense, ViewTransition } from "react";

import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Projects, ProjectsFallback } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { LegacyHashRedirect } from "@/components/ui/LegacyHashRedirect";
import { getI18n } from "@/i18n";
import { legacyHashTargets } from "@/i18n/routes";
import { getProfile, getProfileReadme } from "@/lib/github";
import { parseProfileReadme } from "@/lib/readme";

/**
 * A página é pré-renderizada e revalidada de hora em hora (ISR).
 * A API do GitHub é consultada ~1x/hora no total, não 1x por visitante.
 */
export const revalidate = 3600;

export default async function Home() {
  const { locale, copy } = await getI18n();

  // Perfil e README são independentes — buscados em paralelo.
  const [profileResult, readmeResult] = await Promise.all([
    getProfile(),
    getProfileReadme(locale),
  ]);

  const profile = profileResult.ok ? profileResult.data : null;

  // Sem repositório de perfil (404), a seção "Sobre" cai na bio.
  const readme = readmeResult.ok ? readmeResult.data : null;
  const sections = readme ? parseProfileReadme(readme.markdown) : [];

  return (
    /*
      O envelope direcional continua aqui, e não no layout: layouts
      persistem entre navegações, então `enter` e `exit` nunca disparam
      lá. Ele serve à ida e à volta da página de um projeto — a lista
      voltou a morar nesta página, e o morph do card para o cabeçalho
      depende de existir dos dois lados.
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
        {/* Quem chegar por um link antigo (`/#projetos`) segue daqui. */}
        <LegacyHashRedirect targets={legacyHashTargets()} />

        {/*
          As camadas de trás, irmãs do palco e não ancestrais dele:
          precisam ficar ATRÁS do conteúdo, e um pai não pode se
          posicionar atrás do próprio filho. Decorativas e inertes para
          a tecnologia assistiva.

          São duas, e não uma, porque parallax entre dois planos apenas
          — fundo e conteúdo — dá uma leitura de profundidade rasa. Com
          a malha atrás do halo, e o halo atrás do texto, são três
          distâncias distintas.
        */}
        <div className="cine-backdrop" aria-hidden="true">
          <div className="cine-grid" />
          <div className="cine-glow" />
        </div>

        {/*
          Tudo o que se lê vive aqui dentro, em um plano só — Hero
          incluído. É este bloco que sobe inteiro enquanto o fundo fica
          para trás.
        */}
        <div className="cine-stage">
          <Hero profile={profile} />

          <About
            sections={sections}
            bio={profile?.bio ?? null}
            // Sem README nenhum não há o que avisar: o aviso é sobre
            // idioma, não sobre ausência de conteúdo.
            localized={readme?.localized ?? true}
          />

          {/* Os repositórios são buscados à parte para que o restante da
              página apareça na hora e o skeleton cubra só esta seção. */}
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

          <Skills />
          <Contact />
        </div>
      </div>
    </ViewTransition>
  );
}
