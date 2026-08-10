import Image from "next/image";
import Link from "next/link";

import { LocaleToggle } from "./LocaleToggle";
import { NavPill, type NavItem } from "./NavPill";
import { ThemeToggle } from "./ThemeToggle";
import { getI18n } from "@/i18n";
import {
  folderFor,
  homePath,
  sectionAnchor,
  sectionKeys,
  slugFor,
} from "@/i18n/routes";

export async function Header() {
  const { locale, copy } = await getI18n();

  /*
    Uma lista só, derivada das chaves de seção. Os rótulos vêm do
    dicionário e as URLs de `routes.ts` — nada de caminho escrito à mão,
    que é o que fazia o menu e as páginas divergirem.
  */
  const items: NavItem[] = sectionKeys.map((key) => ({
    /*
      Caminho completo com âncora, e não só `#about`. O cabeçalho também
      aparece na página de um projeto, e de lá o fragmento sozinho não
      levaria a lugar nenhum — a seção não existe naquele documento. Com
      o caminho, o `Link` navega até a home e desce até a âncora; já na
      home, ele reconhece a mesma rota e apenas rola.
    */
    href: sectionAnchor(locale, key),
    label: copy.sections[key].nav,
    // O `id` no HTML é a chave, estável entre idiomas.
    id: key,
    // Slug público e pasta: a reescrita do proxy faz os dois aparecerem.
    segments: [...new Set([slugFor(locale, key), folderFor(key)])],
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
          href={homePath(locale)}
          transitionTypes={["nav-back"]}
          className="flex items-center gap-2.5 font-mono text-sm font-medium tracking-tight text-text transition-colors hover:text-accent"
        >
          {/*
            `alt` vazio de propósito. O texto ao lado já nomeia o link, e
            um alt descritivo faria o leitor de tela anunciar a marca duas
            vezes seguidas. Aqui ela é redundante com o que está escrito.

            O arquivo é uma versão própria, recortada mais justa que o
            favicon: aquele tem 38% de área útil, e nos 28px do cabeçalho
            a letra ficaria perdida no meio do preto.
          */}
          <Image
            src="/logo.png"
            alt=""
            width={28}
            height={28}
            priority
            className="size-7 shrink-0 rounded-md"
          />
          <span>
            lucas<span className="text-accent">.</span>andrade
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <NavPill items={items} label={copy.a11y.mainNav} />
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
