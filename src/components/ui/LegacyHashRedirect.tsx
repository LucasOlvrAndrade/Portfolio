"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Encaminha as âncoras da versão de página única para as rotas novas.
 *
 * Isto existe no cliente porque não pode existir em outro lugar: o
 * fragmento (`#projetos`) não é enviado ao servidor, então nem o
 * `next.config` nem o `proxy` chegam a vê-lo. Quem recebeu um link
 * antigo cai na home e é levado adiante daqui.
 *
 * `replace`, e não `push`: o endereço antigo não merece uma entrada no
 * histórico — voltar tem que sair do site, como sairia antes.
 */
export function LegacyHashRedirect({
  targets,
}: {
  targets: Record<string, string>;
}) {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const destination = targets[hash];
    if (!destination) return;

    router.replace(destination);
  }, [targets, router]);

  return null;
}
