"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Um observador único para a página toda, em vez de um por elemento.
 * Cada bloco é revelado uma vez e imediatamente deixa de ser observado —
 * animação que se repete ao rolar para cima e para baixo cansa rápido.
 */
let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-visible", "true");
        observer?.unobserve(entry.target);
      }
    },
    {
      // Exige que o bloco entre um pouco na tela antes de revelar, para
      // a animação não acontecer na borda inferior, fora do olhar.
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.05,
    },
  );

  return observer;
}

/**
 * Liga um elemento ao observador e devolve a função que o desliga.
 * Exportado porque a máscara de linha usa o mesmo observador: dois
 * observadores fariam o mesmo trabalho duas vezes por rolagem.
 */
export function observarRevelacao(element: Element): () => void {
  const instance = getObserver();
  instance.observe(element);
  return () => instance.unobserve(element);
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Atraso em ms — para escalonar itens de uma mesma lista. */
  delay?: number;
  /** Mantém o elemento semântico correto — o wrapper não deve virar
      sempre uma div e apagar a estrutura do documento. */
  as?: "div" | "li" | "aside";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Se o elemento já está visível na carga (acima da dobra), o
    // observador dispara na primeira checagem e revela sem espera.
    return observarRevelacao(element);
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
