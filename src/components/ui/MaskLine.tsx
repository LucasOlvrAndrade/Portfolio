"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { observarRevelacao } from "./Reveal";

/**
 * Título que sobe de dentro da própria caixa quando chega à tela.
 *
 * Existe para os títulos, e só para eles. Um fade pode ser trocado por
 * `opacity: 1` sem que nada se perca — ele apenas atrasa a leitura. A
 * máscara mostra o texto CHEGANDO a um lugar, e é isso que se lê como
 * página sendo montada na frente de quem olha.
 *
 * A caixa recebe a classe e o recorte; o texto vai num `<span>` dentro
 * dela, que é quem desliza. Envolver o título num wrapper por fora
 * funcionaria igual e custaria um nó a mais em cada seção.
 */
export function MaskLine({
  children,
  className = "",
  delay = 0,
  id,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  /** Atraso em ms, para escalonar títulos vizinhos. */
  delay?: number;
  /** Vai no elemento de título, não no `span` que desliza: é ele que
      rotula a seção via `aria-labelledby`. */
  id?: string;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return observarRevelacao(element);
  }, []);

  return (
    <Tag
      ref={ref as never}
      id={id}
      className={`mask-line ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      <span>{children}</span>
    </Tag>
  );
}
