/**
 * Extrai prosa do README de perfil do GitHub.
 *
 * READMEs de perfil são cheios de HTML, badges do shields.io e ícones do
 * devicon. Renderizar isso direto traria imagens de terceiros e layout
 * quebrado para dentro do site. Aqui ficamos só com o texto — que é do
 * Lucas — e descartamos o resto.
 */

export type ReadmeSection = {
  heading: string;
  paragraphs: string[];
  bullets: string[];
};

/** Comprimento mínimo para uma linha contar como prosa, e não como rótulo. */
const MIN_PROSE_LENGTH = 40;

/**
 * Linhas soltas (sem marcador) aparecem tanto como parágrafo quanto como
 * item de lista sem hífen. Comprimento sozinho separa mal — no README real,
 * "Conhecimento em hardware, sistemas e manutenção" é um item, mas tem 47
 * caracteres. Exigir pontuação final resolve: frases terminam em ponto,
 * itens de lista não.
 */
function isProse(text: string): boolean {
  return text.length >= MIN_PROSE_LENGTH && /[.!?]$/.test(text);
}

function stripInline(line: string): string {
  return line
    // Imagens markdown: ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    // Links markdown: [texto](url) → texto
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Qualquer tag HTML remanescente
    .replace(/<[^>]+>/g, "")
    // Ênfase markdown
    .replace(/[*_`]{1,3}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseProfileReadme(markdown: string): ReadmeSection[] {
  const sections: ReadmeSection[] = [];
  let current: ReadmeSection | null = null;

  // Blocos <div>…</div> são sempre decoração (badges/ícones) — fora.
  const cleaned = markdown.replace(/<div[\s\S]*?<\/div>/gi, "");

  for (const rawLine of cleaned.split("\n")) {
    const line = rawLine.trim();

    if (!line || /^-{3,}$/.test(line)) continue;

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      if (current) sections.push(current);
      current = {
        heading: stripInline(heading[1]),
        paragraphs: [],
        bullets: [],
      };
      continue;
    }

    if (!current) continue;

    const bullet = line.match(/^[-*+]\s+(.*)$/);
    if (bullet) {
      const text = stripInline(bullet[1]);
      if (text) current.bullets.push(text);
      continue;
    }

    const text = stripInline(line);
    if (isProse(text)) {
      current.paragraphs.push(text);
    } else if (text) {
      current.bullets.push(text);
    }
  }

  if (current) sections.push(current);

  // Descarta seções que sobraram vazias após a limpeza (as de badges).
  return sections.filter(
    (section) => section.paragraphs.length > 0 || section.bullets.length > 0,
  );
}

/** Junta toda a prosa num texto corrido — usado como fallback do "Sobre". */
export function readmeProse(sections: ReadmeSection[]): string[] {
  return sections.flatMap((section) => section.paragraphs);
}
