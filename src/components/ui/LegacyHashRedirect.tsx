"use client";

import { useEffect } from "react";

import type { SectionKey } from "@/i18n/routes";

/**
 * Traduz âncoras antigas para o `id` que a seção usa hoje.
 *
 * Isto existe no cliente porque não pode existir em outro lugar: o
 * fragmento (`#projetos`) não é enviado ao servidor, então nem o
 * `next.config` nem o `proxy` chegam a vê-lo.
 *
 * Só entra em ação quando o fragmento PRECISA de tradução. `#about` já
 * é o endereço certo e o navegador o resolve sozinho, antes de qualquer
 * JavaScript rodar — intervir ali só atrasaria o que já ia acontecer.
 */
export function LegacyHashRedirect({
  targets,
}: {
  targets: Record<string, SectionKey>;
}) {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const key = targets[hash];
    // Sem tradução a fazer, ou já no endereço final: nada a fazer.
    if (!key || key === hash) return;

    const target = document.getElementById(key);
    if (!target) return;

    /*
      `replaceState`, e não `push`: o endereço antigo não merece uma
      entrada no histórico — voltar tem que sair do site, como sairia
      antes. E trocar o hash por `history` em vez de `location.hash`
      evita um segundo salto de rolagem do navegador.
    */
    window.history.replaceState(null, "", `#${key}`);

    /*
      `auto` de propósito: quem chega por link direto quer estar na
      seção, não assistir à viagem até ela. O deslize suave vale para
      quem clica no menu já dentro da página.
    */
    target.scrollIntoView({ behavior: "auto", block: "start" });
  }, [targets]);

  return null;
}
