import Link from "next/link";

import { LocaleToggle } from "./LocaleToggle";
import { NavPill } from "./NavPill";
import { ThemeToggle } from "./ThemeToggle";
import { getI18n } from "@/i18n";

export async function Header() {
  const { locale, copy } = await getI18n();
  const { about, projects, skills, contact } = copy.sections;

  /*
    Os `id` vêm do dicionário porque as âncoras mudam de idioma:
    `/pt#sobre` e `/en#about`. Uma lista só, aqui, mantém a navegação e
    as seções falando do mesmo lugar.
  */
  const items = [about, projects, skills, contact].map((section) => ({
    id: section.id,
    label: section.nav,
  }));

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
          href={`/${locale}`}
          transitionTypes={["nav-back"]}
          className="font-mono text-sm font-medium tracking-tight text-text transition-colors hover:text-accent"
        >
          lucas<span className="text-accent">.</span>andrade
        </Link>

        <div className="flex items-center gap-2">
          <NavPill
            items={items}
            basePath={`/${locale}`}
            label={copy.a11y.mainNav}
          />
          <LocaleToggle
            locale={locale}
            labels={{
              group: copy.a11y.languageGroup,
              switchTo: copy.a11y.switchLanguage,
              current: copy.a11y.currentLanguage,
            }}
          />
          <ThemeToggle
            labels={{
              toLight: copy.a11y.themeToLight,
              toDark: copy.a11y.themeToDark,
              light: copy.a11y.themeLight,
              dark: copy.a11y.themeDark,
            }}
          />
        </div>
      </div>
    </header>
  );
}
