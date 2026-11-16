import { Suspense, ViewTransition } from "react";

import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Projects, ProjectsFallback } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Skills } from "@/components/sections/Skills";
import { LegacyHashRedirect } from "@/components/ui/LegacyHashRedirect";
import { LogoScene } from "@/components/ui/LogoScene";
import { siteConfig } from "@/config/site";
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
          A camada de trás, irmã do palco e não ancestral dele: precisa
          ficar ATRÁS do conteúdo, e um pai não pode se posicionar atrás
          do próprio filho. Decorativa e inerte para a tecnologia
          assistiva.

          Hoje é só o halo, que sobe mais devagar que o texto. A marca em
          estrelas, que já morou aqui, passou para a abertura logo abaixo.
        */}
        <div className="cine-backdrop" aria-hidden="true">
          <div className="cine-glow" />
        </div>

        {/*
          A abertura: a marca, com volume, e mais nada. Sem título, sem
          cargo, sem botão — a rolagem é que leva às informações.

          A seção tem duas telas de altura e o palco dentro dela fica
          fixo: rolar não sai da cena, avança a cena. É o que dá o
          percurso longo, em vez de uma animação que toca e acaba.

          Fora do palco de conteúdo de propósito: isto não é seção, é
          abertura. Nada aqui é lido por leitor de tela, e quem navega
          por teclado ou por leitor cai direto no conteúdo, sem duas
          telas vazias no caminho.
        */}
        <div className="intro" aria-hidden="true">
          <div className="intro-palco">
            <LogoScene />
            {/*
              A assinatura: nome e cargo, pequenos, no canto da primeira
              tela. Sem ela, quem chegava por um link via só a marca e
              precisava rolar duas telas para saber de quem era o site.
              Discreta de propósito, para a cena continuar sendo a
              abertura; some no primeiro palmo de rolagem, como o traço.
              Fica sob o `aria-hidden` da abertura porque o leitor de tela
              já recebe o nome no h1 do Hero.
            */}
            <p className="intro-assinatura">
              <span className="text-text">{profile?.name ?? "Lucas Andrade"}</span>
              <span>{siteConfig.role[locale]}</span>
            </p>
            <div className="scroll-hint">
              <span />
            </div>
          </div>
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

          <Services />
          <Skills />
          <Contact />
        </div>
      </div>
    </ViewTransition>
  );
}
