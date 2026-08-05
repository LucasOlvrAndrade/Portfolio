import Link from "next/link";

import { ThemeToggle } from "./ThemeToggle";

/*
  Caminhos absolutos (`/#sobre`, não `#sobre`): agora existem rotas
  além da home, e uma âncora relativa apontaria para uma seção que não
  existe em /projetos/[nome].
*/
const NAV = [
  { href: "/#sobre", label: "Sobre" },
  { href: "/#projetos", label: "Projetos" },
  { href: "/#tecnologias", label: "Tecnologias" },
  { href: "/#contato", label: "Contato" },
];

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

        <div className="flex items-center gap-1">
          <nav aria-label="Navegação principal" className="hidden sm:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
