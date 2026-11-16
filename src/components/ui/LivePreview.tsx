"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/*
  Preview ao vivo de um produto: o site de verdade, rodando, num cartão
  sem borda. Não é captura nem vídeo; é um iframe do endereço da demo em
  modo vitrine (`?vitrine=1`), em que a página passeia sozinha e as
  animações de rolagem dela acontecem de verdade aqui dentro.

  Era uma moldura de celular; saiu a pedido, no celular ficava um telefone
  dentro do telefone. Agora é um cartão de cantos redondos, sem borda, e o
  site aparece como se a janela fosse o próprio cartão.

  O iframe tem largura de DESKTOP (1280px) e é reduzido por
  `transform: scale` para caber no cartão: o que se vê é o herói inteiro da
  demo, título, quadro de hoje e o carimbo girando, como numa tela grande.
  A altura do iframe é a do cartão desfeita pela escala, para a janela do
  site coincidir com o que se vê. Medido por ResizeObserver porque CSS
  ainda não divide comprimentos com segurança. O fundo do cartão é o preto
  quente da demo, para não piscar claro enquanto o iframe carrega.

  Não recebe ponteiro: é uma vitrine, e a roda do mouse por cima dela deve
  rolar o portfólio, não a demo. Numa miniatura a 30% ninguém acerta um
  botão do site de dentro; por isso o cartão INTEIRO é um link que abre a
  demo em aba nova (`href`), e o site de verdade se usa lá.

  ── Quando NÃO há iframe ──

  O iframe é um site Next inteiro, com a vitrine passeando sozinha. Ele
  custa dados, bateria e CPU enquanto existir, e antes existia para
  sempre depois de montado, animando fora da tela. Agora:

  - Monta perto da tela e DESMONTA quando ela fica longe. Voltar recarrega
    a demo, e o cartão escuro cobre a espera como na primeira vez.
  - Celular e tablet (ponteiro grosso), movimento reduzido e economia de
    dados ficam no pôster, uma captura da demo. No celular a miniatura é
    pequena demais para a animação valer o site inteiro que ela carrega;
    com movimento reduzido, uma página que rola sozinha é justamente o
    que a pessoa pediu para não ver.
*/
const LARGURA = 1280;

/** Pode pagar pelo iframe? Decidido no cliente; o servidor manda o pôster. */
function iframeCabe(): boolean {
  const fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const economia =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData === true;
  return fino && !calmo && !economia;
}

export function LivePreview({
  src,
  href,
  title,
  label,
  poster,
  className = "",
}: {
  src: string;
  /** Para onde o cartão leva ao ser clicado: a demo, em aba nova. */
  href: string;
  title: string;
  label: string;
  /** Captura da demo, para quando o iframe não monta. */
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [medida, setMedida] = useState({ escala: 0, altura: 0 });
  /** `null` até o cliente decidir: até lá vale o pôster. */
  const [aoVivo, setAoVivo] = useState<boolean | null>(null);
  const [perto, setPerto] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sem pôster não há o que mostrar no lugar: o iframe vale sempre.
    const vivo = !poster || iframeCabe();
    setAoVivo(vivo);
    if (!vivo) return;

    const ro = new ResizeObserver(([e]) => {
      const escala = e.contentRect.width / LARGURA;
      setMedida({ escala, altura: Math.round(e.contentRect.height / escala) });
    });
    ro.observe(el);

    /*
      Uma margem só para entrar e sair: 300px antes da tela monta, e só
      desmonta depois de passar dos mesmos 300px do outro lado. Margens
      iguais bastam porque o cartão inteiro tem de cruzar a faixa entre
      um estado e outro, e isso não acontece no tremor de uma rolagem.
    */
    const io = new IntersectionObserver(
      ([e]) => {
        setPerto(e.isIntersecting);
        if (!e.isIntersecting) setPronto(false);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [poster]);

  const mostrarPoster = poster && aoVivo !== true;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`group mx-auto block w-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${className}`}
    >
      <div
        ref={ref}
        className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#171412] shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-[1.02]"
      >
        {mostrarPoster && (
          <Image
            src={poster}
            alt=""
            fill
            sizes="(min-width: 640px) 40vw, 100vw"
            className="object-cover object-top"
          />
        )}

        {aoVivo && perto && medida.escala > 0 && (
          <iframe
            src={src}
            title={title}
            tabIndex={-1}
            loading="lazy"
            scrolling="no"
            onLoad={() => setPronto(true)}
            className="pointer-events-none absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-700"
            style={{
              width: LARGURA,
              height: medida.altura,
              transform: `scale(${medida.escala})`,
              opacity: pronto ? 1 : 0,
            }}
          />
        )}
      </div>
    </a>
  );
}
