import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `Lucas Andrade — ${siteConfig.role}`;

/**
 * Imagem de compartilhamento (WhatsApp, LinkedIn, X).
 * Sem fontes externas: usa a fonte padrão do renderizador para não
 * depender de rede em build time.
 */
export default function OpenGraphImage() {
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
              color: "#38bdf8",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {siteConfig.role}
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
            Engenharia de Software · UniCEUB · Distrito Federal
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
          <span style={{ color: "#38bdf8" }}>
            {siteConfig.url.replace("https://", "")}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
