import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { siteConfig } from "@/config/site";
import "./globals.css";

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

const title = `Lucas Andrade — ${siteConfig.role}`;
const description =
  "Portfólio de Lucas Andrade, estudante de Engenharia de Software no UniCEUB. Projetos, tecnologias e contato.";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: title,
    template: "%s — Lucas Andrade",
  },
  description,
  keywords: [
    "Lucas Andrade",
    "portfólio",
    "engenharia de software",
    "desenvolvedor",
    "Java",
    "UniCEUB",
    "Brasília",
  ],
  authors: [{ name: "Lucas Andrade", url: siteConfig.url }],
  creator: "Lucas Andrade",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteConfig.url,
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
  alternates: { canonical: siteConfig.url },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

/**
 * Roda antes da primeira pintura: aplica o tema salvo (ou o do sistema)
 * para não haver flash de tema errado ao carregar a página.
 */
const themeScript = `
(function () {
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-bg text-text">
        <a
          href="#conteudo"
          className="sr-only rounded-lg bg-accent px-4 py-2 text-bg focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
