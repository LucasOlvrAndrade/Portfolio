import type { ReactNode } from "react";

import { MaskLine } from "./MaskLine";
import { Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  /** Rótulo pequeno acima do título, em monoespaçada. */
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: SectionProps) {
  const headingId = `${id}-titulo`;

  return (
    /*
      Sem borda superior e sem movimento próprio. As seções são partes
      do mesmo plano, não painéis empilhados: qualquer `transform` aqui
      as descolaria umas das outras, e é exatamente essa separação que
      fazia a página parecer um monte de cartões em vez de uma peça só.

      O que anima dentro da seção é a chegada de cada bloco, sem
      deslocar a seção em relação à vizinha. Aparecer não é o mesmo que
      se mover em relação ao vizinho.
    */
    <section
      id={id}
      aria-labelledby={headingId}
      className="page-section py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {eyebrow}
            </p>
          </Reveal>

          {/*
            O título tem máscara própria, e não o fade do bloco: ele é o
            que a pessoa procura ao chegar na seção, e chegar é
            justamente o que a máscara mostra.
          */}
          <MaskLine
            as="h2"
            id={headingId}
            delay={60}
            className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl"
          >
            {title}
          </MaskLine>

          {description && (
            <Reveal delay={140}>
              <p className="mt-4 text-base leading-relaxed text-muted">
                {description}
              </p>
            </Reveal>
          )}
        </div>

        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
