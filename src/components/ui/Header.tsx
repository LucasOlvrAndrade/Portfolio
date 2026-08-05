import Link from "next/link";

import { NavPill } from "./NavPill";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    /*
      `viewTransitionName` mantém o cabeçalho imóvel durante o deslize
      entre páginas — é a âncora espacial que informa ao usuário que só
      o conteúdo mudou, não a janela inteira.
    */
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-40 border-b border-border/70 bg-bg/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="font-mono text-sm font-medium tracking-tight text-text transition-colors hover:text-accent"
        >
          lucas<span className="text-accent">.</span>andrade
        </Link>

        <div className="flex items-center gap-2">
          <NavPill />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
