"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  MAX_DT,
  createSpring,
  settled,
  snapSpring,
  stepSpring,
} from "@/lib/spring";

const NAV = [
  { id: "sobre", label: "Sobre" },
  { id: "projetos", label: "Projetos" },
  { id: "tecnologias", label: "Tecnologias" },
  { id: "contato", label: "Contato" },
];

const DAMPING = 26;
const STIFF_LEAD = 260;
const STIFF_TRAIL = 170;

/**
 * Janela em que o observer fica calado após um clique. O smooth scroll
 * atravessa as seções intermediárias e o observer dispararia em cada
 * uma — a pílula pularia de item em item até chegar. Com a supressão
 * ela vai direto ao destino.
 */
const CLICK_SUPPRESSION_MS = 600;

/** Arredonda para meio pixel: valores fracionários borram o texto. */
const half = (value: number) => Math.round(value * 2) / 2;

export function NavPill() {
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  /** `null` fora da home, onde as seções não existem. */
  const [active, setActive] = useState<number | null>(null);

  const leftSpring = useRef(createSpring());
  const rightSpring = useRef(createSpring());
  const frame = useRef(0);
  const lastTime = useRef(0);
  const measured = useRef(false);
  const suppressUntil = useRef(0);

  const paint = useCallback(() => {
    const pill = pillRef.current;
    if (!pill) return;

    const l = half(leftSpring.current.value);
    const r = half(rightSpring.current.value);

    pill.style.transform = `translate3d(${l}px, 0, 0)`;
    pill.style.width = `${Math.max(0, r - l)}px`;
  }, []);

  const bounds = useCallback((index: number) => {
    const item = itemRefs.current[index];
    if (!item) return null;
    // `scrollLeft` entra na conta caso a trilha role em telas estreitas.
    const offset = listRef.current?.scrollLeft ?? 0;
    return {
      left: item.offsetLeft - offset,
      right: item.offsetLeft + item.offsetWidth - offset,
    };
  }, []);

  /* ── Qual seção está à vista ─────────────────────────────────── */
  useEffect(() => {
    const sections = NAV.map(({ id }) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (sections.length === 0) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        // Durante a janela de supressão o clique manda, não o scroll.
        if (performance.now() < suppressUntil.current) return;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            ratios.set(entry.target.id, entry.intersectionRatio);
          } else {
            ratios.delete(entry.target.id);
          }
        }

        if (ratios.size === 0) return;

        let bestId = "";
        let bestRatio = -1;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        const index = NAV.findIndex((item) => item.id === bestId);
        if (index >= 0) setActive(index);
      },
      {
        /*
          -80px no topo compensa o header fixo de 4rem e o
          `scroll-padding-top: 5rem` do CSS. Sem isso a seção que está
          escondida ATRÁS do header ainda contaria como visível, e a
          pílula ficaria sempre uma posição adiantada.
        */
        rootMargin: "-80px 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* ── Fim da página ativa a última seção ──────────────────────── */
  useEffect(() => {
    if (!document.getElementById(NAV[NAV.length - 1].id)) return;

    /*
      "Contato" é curta: pode nunca conquistar a maior fatia da tela e,
      sem isto, a pílula jamais chegaria nela por rolagem.
    */
    const onScroll = () => {
      if (performance.now() < suppressUntil.current) return;

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      if (atBottom) setActive(NAV.length - 1);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Âncora vinda de fora (link externo, voltar do navegador) ─── */
  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) return;
      const index = NAV.findIndex((item) => item.id === id);
      if (index < 0) return;
      suppressUntil.current = performance.now() + CLICK_SUPPRESSION_MS;
      setActive(index);
    };

    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  /* ── Molas ───────────────────────────────────────────────────── */
  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;

    if (active === null) {
      pill.style.opacity = "0";
      measured.current = false;
      return;
    }

    let cancelled = false;

    const run = async () => {
      /*
        A Geist entra por `next/font` e a largura dos itens muda no
        swap. Medir antes disso posiciona a pílula sobre a métrica da
        fonte de fallback, e ela salta quando a real chega.
      */
      if (!measured.current && document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (cancelled) return;

      const target = bounds(active);
      if (!target) return;

      leftSpring.current.target = target.left;
      rightSpring.current.target = target.right;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Primeira medição e movimento reduzido: posiciona sem animar.
      if (!measured.current || reduced) {
        snapSpring(leftSpring.current, target.left);
        snapSpring(rightSpring.current, target.right);
        paint();
        pill.style.opacity = "1";
        measured.current = true;
        return;
      }

      /*
        A borda que lidera chega antes; a que fica atrás alcança depois.
        A pílula estica no percurso e recolhe ao assentar — o esticão é
        a distância real entre as bordas, não `scaleX`, que deformaria
        o raio.
      */
      const goingRight = target.left > leftSpring.current.value;
      const leftStiffness = goingRight ? STIFF_TRAIL : STIFF_LEAD;
      const rightStiffness = goingRight ? STIFF_LEAD : STIFF_TRAIL;

      cancelAnimationFrame(frame.current);
      lastTime.current = 0;

      const tick = (now: number) => {
        const dt = lastTime.current
          ? Math.min((now - lastTime.current) / 1000, MAX_DT)
          : 1 / 60;
        lastTime.current = now;

        stepSpring(leftSpring.current, leftStiffness, DAMPING, dt);
        stepSpring(rightSpring.current, rightStiffness, DAMPING, dt);
        paint();

        // O rAF morre ao assentar: o header está sempre na tela, e um
        // loop eterno aqui custaria bateria o tempo todo.
        if (settled(leftSpring.current) && settled(rightSpring.current)) {
          snapSpring(leftSpring.current, leftSpring.current.target);
          snapSpring(rightSpring.current, rightSpring.current.target);
          paint();
          return;
        }

        frame.current = requestAnimationFrame(tick);
      };

      frame.current = requestAnimationFrame(tick);
    };

    void run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame.current);
    };
  }, [active, bounds, paint]);

  /* ── Redimensionamento: remede sem animar ────────────────────── */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const observer = new ResizeObserver(() => {
      if (active === null || !measured.current) return;
      const target = bounds(active);
      if (!target) return;

      snapSpring(leftSpring.current, target.left);
      snapSpring(rightSpring.current, target.right);
      paint();
    });

    observer.observe(list);
    return () => observer.disconnect();
  }, [active, bounds, paint]);

  // `useCallback` não é otimização aqui: sem ele o linter de pureza do
  // React trata `performance.now()` como chamada em tempo de render.
  const handleClick = useCallback((index: number) => {
    // Assume o destino na hora e cala o observer enquanto a rolagem
    // suave atravessa o que houver pelo caminho.
    suppressUntil.current = performance.now() + CLICK_SUPPRESSION_MS;
    setActive(index);
  }, []);

  return (
    <nav aria-label="Navegação principal" className="hidden sm:block">
      <ul
        ref={listRef}
        className="nav-track relative flex items-center rounded-full border border-border bg-surface-2 p-1"
      >
        {/*
          Decorativa. Quem informa o estado à tecnologia assistiva é o
          `aria-current` no link — este elemento não existe para ela.
        */}
        <span
          ref={pillRef}
          aria-hidden="true"
          style={{ opacity: 0 }}
          className="nav-pill pointer-events-none absolute left-0 top-1 h-[calc(100%-0.5rem)] rounded-full bg-surface"
        />

        {NAV.map((item, index) => (
          <li key={item.id}>
            <Link
              href={`/#${item.id}`}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              aria-current={active === index ? "page" : undefined}
              onClick={() => handleClick(index)}
              className={`nav-item relative z-[1] block rounded-full px-2.5 py-1.5 text-[13px] md:px-3 md:text-sm ${
                active === index ? "text-text" : "text-muted hover:text-accent"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
