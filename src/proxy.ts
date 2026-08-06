import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { folderFor, keyForFolder, keyForSlug, slugFor } from "@/i18n/routes";

/**
 * Escolhe o idioma pela preferência declarada no navegador.
 *
 * Sem biblioteca: o cabeçalho é `pt-BR,pt;q=0.9,en;q=0.8` — pares de tag
 * e peso. Ordena pelo peso e devolve a primeira tag que sabemos servir,
 * comparando só a parte do idioma (`en-GB` atende como `en`).
 */
function negotiate(header: string | null): Locale {
  if (!header) return defaultLocale;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const quality = params
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="));

      return {
        language: tag.trim().toLowerCase().split("-")[0],
        // Ausência de `q` significa 1 — a preferência mais forte.
        quality: quality ? Number.parseFloat(quality.slice(2)) : 1,
      };
    })
    // `q=0` significa "recuso este idioma", não "aceito com peso zero".
    .filter((entry) => Number.isFinite(entry.quality) && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const entry of ranked) {
    if (isLocale(entry.language)) return entry.language;
  }

  return defaultLocale;
}

/**
 * Concilia o slug público com a pasta da rota.
 *
 * Há uma árvore de rotas só, nomeada em português. O inglês existe como
 * URL — `/en/about` é servido pela pasta `sobre` por reescrita, e a
 * barra de endereços não muda. O caminho inverso (`/en/sobre`, a pasta
 * exposta crua) redireciona para o slug público, para que cada página
 * tenha uma URL canônica e não duas.
 */
function resolveSection(
  request: NextRequest,
  locale: Locale,
  segments: string[],
): NextResponse | null {
  const [segment, ...rest] = segments;
  if (!segment) return null;

  const key = keyForSlug(locale, segment);

  if (key) {
    const folder = folderFor(key);
    // Slug público. Só reescreve quando ele difere do nome da pasta.
    if (folder === segment) return null;
    const url = request.nextUrl.clone();
    url.pathname = ["", locale, folder, ...rest].join("/");
    return NextResponse.rewrite(url);
  }

  const exposed = keyForFolder(segment);
  if (exposed) {
    // Pasta crua num idioma que a chama de outro nome: manda ao canônico,
    // para que cada página tenha uma URL só.
    const url = request.nextUrl.clone();
    url.pathname = ["", locale, slugFor(locale, exposed), ...rest].join("/");
    return NextResponse.redirect(url);
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const [first, ...rest] = segments;

  // Já prefixado: só resta conciliar o slug da seção. É o caso da
  // esmagadora maioria dos acessos, e sair cedo mantém o custo perto de
  // zero para quem não precisa de reescrita.
  if (first && isLocale(first)) {
    return resolveSection(request, first, rest) ?? NextResponse.next();
  }

  const locale = negotiate(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  /*
    Redirecionamento temporário de propósito. O destino depende de QUEM
    pede: marcar como permanente faria o navegador — ou um CDN pelo
    caminho — gravar a escolha de um visitante e servi-la aos demais.
  */
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
      Fora: rotas internas do Next, o endpoint de imagem e qualquer
      caminho com extensão (o logo em `public/`, por exemplo). Sem a
      última exclusão, `/grupo-ram.png` viraria `/pt/grupo-ram.png` e o
      Hero ficaria sem o logo.
    */
    "/((?!_next/|_vercel/|.*\\..*).*)",
  ],
};
