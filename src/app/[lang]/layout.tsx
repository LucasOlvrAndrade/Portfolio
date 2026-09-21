import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { ScrollTuning } from "@/components/ui/ScrollTuning";
import { siteConfig } from "@/config/site";
import { getCopyFor } from "@/i18n";
import { isLocale, locales, localeMeta } from "@/i18n/config";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});


/** As duas versões são geradas no build — nenhuma delas é renderizada sob demanda. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * Um mapa de idioma → URL, para o `hreflang`. É o que informa ao
 * buscador que as duas páginas são a mesma coisa em idiomas diferentes,
 * em vez de conteúdo duplicado.
 */
const languageAlternates = Object.fromEntries([
  ...locales.map((locale) => [
    localeMeta[locale].html,
    `${siteConfig.url}/${locale}`,
  ]),
  // Para quem não pede nenhum dos dois, o buscador oferece o português.
  ["x-default", `${siteConfig.url}/pt`],
]);

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const copy = getCopyFor(lang);
  const title = `Lucas Andrade · ${siteConfig.role[lang]}`;
  const description = copy.metadata.description;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: title,
      template: copy.metadata.titleTemplate,
    },
    description,
    keywords: [...copy.metadata.keywords],
    authors: [{ name: "Lucas Andrade", url: siteConfig.url }],
    creator: "Lucas Andrade",
    openGraph: {
      type: "website",
      locale: localeMeta[lang].og,
      url: `${siteConfig.url}/${lang}`,
      siteName: "Lucas Andrade",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteConfig.url}/${lang}`,
      languages: languageAlternates,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    // Acompanha `--bg` do tema claro. Divergir daqui pinta a barra do
    // navegador de uma cor que não existe na página.
    { media: "(prefers-color-scheme: light)", color: "#f2ede3" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

/**
 * Roda antes da primeira pintura: aplica o tema salvo (ou o do sistema)
 * para não haver flash de tema errado ao carregar a página.
 *
 * Marca também a classe `js`, de que depende a revelação ao rolar. Sem
 * ela o CSS nunca esconde nada — se este script falhar, a página
 * continua legível em vez de ficar em branco à espera do observador.
 *
 * O idioma NÃO passa por aqui: ele está na URL, resolvido no servidor
 * antes de o HTML sair. Não há troca a fazer no cliente, e portanto não
 * há flash de idioma errado a evitar.
 */
const themeScript = `
(function () {
  document.documentElement.classList.add('js');
  try {
    var stored = localStorage.getItem('theme');
    var isDark = stored
      ? stored === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const copy = getCopyFor(lang);

  return (
    <html
      lang={localeMeta[lang].html}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd locale={lang} />
      </head>
      <body className="app-shell flex min-h-full flex-col bg-bg text-text">
        <a
          href="#conteudo"
          className="sr-only rounded-lg bg-accent px-4 py-2 text-bg focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          {copy.a11y.skipToContent}
        </a>
        {/* Amortece a roda e sinaliza rolagem ao CSS. Não renderiza nada. */}
        <ScrollTuning />
        <Header />
        <main id="conteudo" className="app-main flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
