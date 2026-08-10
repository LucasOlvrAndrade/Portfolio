import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";
import { getCopyFor } from "@/i18n";
import { defaultLocale, isLocale, locales } from "@/i18n/config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lucas Andrade";

/** Sem isto a imagem seria gerada a cada pedido, e não no build. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * Imagem de compartilhamento (WhatsApp, LinkedIn, X).
 * Sem fontes externas: usa a fonte padrão do renderizador para não
 * depender de rede em build time.
 *
 * Uma por idioma: o link que um recrutador compartilha é o da versão que
 * ele leu, e a prévia precisa bater com a página.
 */
export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const copy = getCopyFor(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0a09",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 24,
              color: "#fb923c",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {siteConfig.role[locale]}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 96,
              fontWeight: 700,
              color: "#fafaf9",
              letterSpacing: "-0.03em",
            }}
          >
            Lucas Andrade
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 32,
              color: "#a8a29e",
              maxWidth: 800,
            }}
          >
            {copy.og.subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #2c2724",
            paddingTop: 32,
            fontSize: 26,
            color: "#a8a29e",
          }}
        >
          <span>github.com/{siteConfig.githubUser}</span>
          <span style={{ color: "#fb923c" }}>
            {siteConfig.url.replace("https://", "")}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
