"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  MAX_DT,
  createSpring,
  settled,
  snapSpring,
  stepSpring,
} from "@/lib/spring";

export type NavItem = {
  /** URL pública, já com o prefixo de idioma. */
  href: string;
  label: string;
  /**
   * Segmentos que contam como "esta seção" ao comparar com a URL.
   *
   * São dois porque a URL em inglês (`about`) é servida pela pasta em
   * português (`sobre`) via reescrita no proxy. Dependendo de onde a
   * comparação acontece — servidor ou cliente — o caminho visível pode
   * ser um ou o outro, e aceitar ambos elimina divergência de hidratação.
   */
  segments: string[];
};

type NavPillProps = {
  items: NavItem[];
  label: string;
};

const DAMPING = 26;
const STIFF_LEAD = 260;
const STIFF_TRAIL = 170;

/** Arredonda para meio pixel: valores fracionários borram o texto. */
const half = (value: number) => Math.round(value * 2) / 2;

export function NavPill({ items, label }: NavPillProps) {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  /*
    O segmento seguinte ao idioma identifica a seção. Pegá-lo por posição
    — e não o caminho inteiro — faz a página de um projeto
    (`/pt/projetos/portfolio`) manter "Projetos" aceso, que é o que o
    usuário espera de uma navegação de topo.
  */
  const current = pathname.split("/").filter(Boolean)[1] ?? "";
  const found = items.findIndex((item) => item.segments.includes(current));

  /** `null` na home, onde nenhuma seção está ativa. */
  const active = found >= 0 ? found : null;

  const leftSpring = useRef(createSpring());
  const rightSpring = useRef(createSpring());
  const frame = useRef(0);
  const lastTime = useRef(0);
  const measured = useRef(false);

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

  return (
    <nav aria-label={label} className="hidden sm:block">
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

        {items.map((item, index) => (
          <li key={item.href}>
            <Link
              href={item.href}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              aria-current={active === index ? "page" : undefined}
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
