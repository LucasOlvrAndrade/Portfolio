"use client";

import { useEffect, useRef, useState } from "react";

/*
  Preview ao vivo de um produto: o site de verdade, rodando, dentro de uma
  moldura de celular. Não é captura nem vídeo; é um iframe do endereço da
  demo em modo vitrine (`?vitrine=1`), em que a página passeia sozinha e as
  animações de rolagem dela acontecem de verdade aqui dentro.

  O iframe tem a largura real de um celular (390px) e é reduzido por
  `transform: scale` para caber na moldura, então o site se desenha no
  layout móvel dele, não numa versão espremida. A escala é medida por
  ResizeObserver porque CSS ainda não divide comprimentos com segurança.

  Só monta quando se aproxima da tela (o iframe carrega um site inteiro) e
  não recebe ponteiro: é uma vitrine, e a roda do mouse por cima dela deve
  rolar o portfólio, não a demo. Para usar, tem o botão "Ver a demo".
*/
const LARGURA = 390;
const ALTURA = 844;

export function LivePreview({ src, title, className = "" }: { src: string; title: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0);
  const [perto, setPerto] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setEscala(e.contentRect.width / LARGURA));
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPerto(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div className={`mx-auto w-full ${className}`}>
      <div
        ref={ref}
        className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-2 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] ring-[6px] ring-text/90"
        style={{ aspectRatio: `${LARGURA} / ${ALTURA}` }}
      >
        {perto && escala > 0 && (
          <iframe
            src={src}
            title={title}
            tabIndex={-1}
            loading="lazy"
            onLoad={() => setPronto(true)}
            className="pointer-events-none absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-700"
            style={{ width: LARGURA, height: ALTURA, transform: `scale(${escala})`, opacity: pronto ? 1 : 0 }}
          />
        )}
      </div>
    </div>
  );
}
