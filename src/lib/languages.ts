/**
 * Cores oficiais de linguagem do GitHub (github/linguist).
 * Subconjunto pragmático — cobre o que aparece em portfólios reais.
 */
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Java: "#b07219",
  Python: "#3572a5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  PHP: "#4f5d95",
  Ruby: "#701516",
  Go: "#00add8",
  Rust: "#dea584",
  Kotlin: "#a97bff",
  Swift: "#f05138",
  Dart: "#00b4ab",
  Shell: "#89e051",
  PowerShell: "#012456",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Astro: "#ff5a03",
  MDX: "#fcb32c",
  "Jupyter Notebook": "#da5b0b",
  R: "#198ce7",
  Lua: "#000080",
  Perl: "#0298c3",
  Scala: "#c22d40",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  "Objective-C": "#438eff",
  Assembly: "#6e4c13",
  Makefile: "#427819",
  Dockerfile: "#384d54",
  PLpgSQL: "#336790",
  TeX: "#3d6117",
  Batchfile: "#c1f12e",
  Vim_Script: "#199f4b",
};

/** Cor neutra para linguagens fora da lista — nunca deixa o ponto sem cor. */
const FALLBACK_COLOR = "#8b949e";

export function languageColor(language: string | null | undefined): string {
  if (!language) return FALLBACK_COLOR;
  return LANGUAGE_COLORS[language] ?? FALLBACK_COLOR;
}

export function hasKnownColor(language: string | null | undefined): boolean {
  return Boolean(language && language in LANGUAGE_COLORS);
}
