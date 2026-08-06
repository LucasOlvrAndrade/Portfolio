import { ImageResponse } from "next/og";

import { locales } from "@/i18n/config";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** O ícone é o mesmo nos dois idiomas, mas a rota vive sob `[lang]`. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/** Favicon gerado: iniciais sobre o acento da paleta. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0a09",
          color: "#38bdf8",
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "-0.05em",
          borderRadius: 6,
        }}
      >
        LA
      </div>
    ),
    size,
  );
}
