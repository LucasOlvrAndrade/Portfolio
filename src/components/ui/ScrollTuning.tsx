"use client";

import { useEffect } from "react";

/**
 * Fração do caminho restante percorrida a cada quadro. Quanto menor,
 * mais longa a inércia. Acima de ~0.2 o amortecimento deixa de ser
 * perceptível; abaixo de ~0.06 a página começa a parecer que não
 * obedece.
 */
const LERP = 0.11;

/** Abaixo disto o resto do caminho não vale mais um quadro. */
const SETTLE_PX = 0.5;

/** Silêncio de rolagem que conta como "parou". */
const IDLE_MS = 140;

/** `deltaMode` 1 e 2 vêm em linhas e páginas, não em pixels. */
const LINE_PX = 16;
const PAGE_PX = 800;

function normalizeDelta(event: WheelEvent): number {
  if (event.deltaMode === 1) return event.deltaY * LINE_PX;
  if (event.deltaMode === 2) return event.deltaY * PAGE_PX;
  return event.deltaY;
}

/**
 * Rolagem amortecida e sinalização de estado de rolagem.
 *
 * ── Por que rolar de verdade, e não deslocar o conteúdo ──
 *
 * A abordagem comum para rolagem suave é travar a página e mover o
 * conteúdo com `transform`. Aqui isso seria autodestrutivo: o parallax
 * é feito com `animation-timeline: scroll()`, que mede a POSIÇÃO DE
 * ROLAGEM real. Sem rolagem real não há linha do tempo, e o efeito
 * simplesmente deixaria de existir. Então o que se interpola é o
 * próprio `scrollTop` — o navegador continua rolando, só que guiado.
 *
 * ── Por que descobrir o rolador em vez de assumir a janela ──
 *
 * Em telas grandes o `.app-shell` trava a altura e quem rola é o
 * `.app-main`; no resto, o documento. A media query que decide isso
 * depende de largura E altura da janela, então o alvo pode mudar no
 * meio da sessão — ao redimensionar, ao girar o aparelho, ao abrir o
 * console. Por isso ele é resolvido a cada evento, e não guardado.
 *
 * ── Onde este código se cala ──
 *
 * - Movimento reduzido: sem amortecimento nenhum.
 * - Ponteiro grosso (toque): o dedo já tem inércia nativa, feita pelo
 *   sistema e melhor que qualquer coisa reimplementada em JS.
 * - Roda sobre outro elemento rolável: o gesto pertence a ele.
 * - Com Ctrl pressionado: é zoom do navegador, não rolagem.
 *
 * Teclado, barra de rolagem e navegação por âncora não passam por
 * aqui — seguem nativos, com o comportamento que o usuário espera.
 */
export function ScrollTuning() {
  useEffect(() => {
    const root = document.documentElement;

    /* ── Estado de rolagem ─────────────────────────────────────
       Marca o <html> enquanto a página se move. Serve ao CSS, que
       suspende o desfoque mais caro durante o percurso. */
    let idleTimer = 0;

    const markScrolling = () => {
      root.dataset.scrolling = "true";
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        delete root.dataset.scrolling;
      }, IDLE_MS);
    };

    /** O elemento que de fato rola, agora. */
    const scroller = (): HTMLElement => {
      const main = document.querySelector<HTMLElement>(".app-main");
      if (main && main.scrollHeight - main.clientHeight > 1) return main;
      return (document.scrollingElement as HTMLElement | null) ?? root;
    };

    const main = document.querySelector<HTMLElement>(".app-main");
    window.addEventListener("scroll", markScrolling, { passive: true });
    main?.addEventListener("scroll", markScrolling, { passive: true });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

    /* ── Amortecimento ─────────────────────────────────────────── */
    let frame = 0;
    let running = false;
    let desired = 0;

    const step = () => {
      const element = scroller();
      const current = element.scrollTop;
      const remaining = desired - current;

      if (Math.abs(remaining) < SETTLE_PX) {
        /*
          `instant` é obrigatório, não preferência. O `.app-main` tem
          `scroll-behavior: smooth` para as âncoras, e sem esta
          instrução cada passo do amortecimento viraria uma animação
          suave do navegador POR CIMA da nossa — duas interpolações
          empilhadas, e a página respondendo com atraso visível.
        */
        element.scrollTo({ top: desired, behavior: "instant" });
        running = false;
        return;
      }

      element.scrollTo({
        top: current + remaining * LERP,
        behavior: "instant",
      });
      frame = requestAnimationFrame(step);
    };

    /** Algum ancestral do alvo rola no mesmo eixo? O gesto é dele. */
    const insideOwnScroller = (
      node: EventTarget | null,
      stop: HTMLElement,
    ): boolean => {
      let element = node instanceof Element ? node : null;

      while (element && element !== stop) {
        if (element instanceof HTMLElement) {
          const overflow = getComputedStyle(element).overflowY;
          const scrolls = overflow === "auto" || overflow === "scroll";
          if (scrolls && element.scrollHeight - element.clientHeight > 1) {
            return true;
          }
        }
        element = element.parentElement;
      }

      return false;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;

      const element = scroller();
      if (insideOwnScroller(event.target, element)) return;

      const max = element.scrollHeight - element.clientHeight;
      if (max <= 0) return;

      /*
        Fora de uma animação nossa, a posição de referência é a real:
        entre um gesto e outro o usuário pode ter usado o teclado, a
        barra ou um link de âncora, e partir de um alvo velho faria a
        página saltar para trás.
      */
      if (!running) desired = element.scrollTop;

      const next = desired + normalizeDelta(event);
      const clamped = Math.min(Math.max(next, 0), max);

      // No fim do curso, devolve o gesto ao navegador — assim o
      // "puxão" de fim de página do sistema continua acontecendo.
      if (clamped === desired) return;

      event.preventDefault();
      desired = clamped;
      markScrolling();

      if (!running) {
        running = true;
        frame = requestAnimationFrame(step);
      }
    };

    /** Liga e desliga conforme o ambiente muda sob os pés. */
    const sync = () => {
      const enabled = fine.matches && !reduced.matches;

      window.removeEventListener("wheel", onWheel);
      if (enabled) {
        // `passive: false` é o que permite `preventDefault` — sem isto
        // o navegador ignora a chamada e rola por conta própria.
        window.addEventListener("wheel", onWheel, { passive: false });
      } else {
        cancelAnimationFrame(frame);
        running = false;
      }
    };

    sync();
    reduced.addEventListener("change", sync);
    fine.addEventListener("change", sync);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", markScrolling);
      main?.removeEventListener("scroll", markScrolling);
      reduced.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
      cancelAnimationFrame(frame);
      window.clearTimeout(idleTimer);
      delete root.dataset.scrolling;
    };
  }, []);

  return null;
}
