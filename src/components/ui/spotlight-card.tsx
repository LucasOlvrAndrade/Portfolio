"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";

type GlowColor = "brand" | "blue" | "purple" | "green" | "red" | "orange";
type GlowSize = "sm" | "md" | "lg";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: GlowColor;
  size?: GlowSize;
  width?: string | number;
  height?: string | number;
  /** Quando true, ignora `size` e deixa o pai (grid/flex) ditar as medidas. */
  customSize?: boolean;
}

/**
 * Matiz inicial e amplitude da variação conforme o cursor cruza a tela.
 *
 * `spread` positivo sobe o matiz; negativo desce. As paletas originais
 * usam amplitude 200+, o que atravessa meia roda de cores — daí o roxo
 * no centro da tela quando se parte do azul.
 */
const glowColorMap: Record<GlowColor, { base: number; spread: number }> = {
  /**
   * Paleta do site: terracota à esquerda, subindo até o âmbar do
   * logotipo do Grupo RAM à direita.
   *
   * A varredura percorre exatamente os três matizes quentes do site,
   * medidos em HSL: 15 é o acento do tema claro, 27 o do escuro, e 39
   * o âmbar do Grupo RAM. Começar em 15 com amplitude 24 faz a luz
   * atravessar os três, e o acento do tema escuro cai no meio.
   *
   * Era `base: 220, spread: -79` — azul descendo até o verde da marca
   * — de quando o acento do site era frio. Acendia azul num site que
   * deixou de ter azul.
   */
  brand: { base: 15, spread: 24 },
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
};

const sizeMap: Record<GlowSize, string> = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

/* ───────────────────────────────────────────────────────────
   Rastreio do ponteiro — um único listener para a página toda.

   O componente original registrava um `pointermove` por card, e
   cada um reescrevia as próprias variáveis. Com N cards na tela
   isso é N handlers disparando a cada movimento do mouse. Aqui o
   listener é compartilhado por contagem de referência e escreve
   as coordenadas no <html>; os cards apenas herdam as variáveis.
   ─────────────────────────────────────────────────────────── */
let subscribers = 0;
let handler: ((event: PointerEvent) => void) | null = null;

function acquirePointerTracking() {
  subscribers += 1;
  if (handler) return;

  handler = (event: PointerEvent) => {
    const root = document.documentElement;
    root.style.setProperty("--glow-x", event.clientX.toFixed(2));
    root.style.setProperty("--glow-y", event.clientY.toFixed(2));
    root.style.setProperty(
      "--glow-xp",
      (event.clientX / window.innerWidth).toFixed(3),
    );
    root.style.setProperty(
      "--glow-yp",
      (event.clientY / window.innerHeight).toFixed(3),
    );
  };

  document.addEventListener("pointermove", handler, { passive: true });
}

function releasePointerTracking() {
  subscribers -= 1;
  if (subscribers > 0 || !handler) return;

  document.removeEventListener("pointermove", handler);
  handler = null;
}

export function GlowCard({
  children,
  className = "",
  glowColor = "blue",
  size = "md",
  width,
  height,
  customSize = false,
}: GlowCardProps) {
  useEffect(() => {
    acquirePointerTracking();
    return releasePointerTracking;
  }, []);

  const { base, spread } = glowColorMap[glowColor];

  // `CSSProperties` não aceita chaves `--*`; a interseção libera as
  // variáveis sem recorrer a `any`.
  const style: CSSProperties & Record<string, string | number> = {
    "--base": base,
    "--spread": spread,
    "--radius": 12,
    "--border": 1,
    "--size": 260,
  };

  if (width !== undefined) {
    style.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  const sizeClasses = customSize ? "" : `${sizeMap[size]} aspect-[3/4]`;

  return (
    <div
      data-glow
      style={style}
      className={`relative rounded-xl ${sizeClasses} ${className}`}
    >
      {/* Halo externo desfocado — puramente decorativo. */}
      <div data-glow aria-hidden />
      {children}
    </div>
  );
}
