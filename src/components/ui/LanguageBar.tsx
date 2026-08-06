import { languageColor } from "@/lib/languages";

/**
 * Composição de linguagens do repositório, em bytes.
 *
 * O campo `language` da API traz só a linguagem dominante — e vem `null`
 * em vários repositórios. O endpoint `/languages` traz a distribuição
 * real, que é informação de verdade sobre o projeto em vez de um rótulo.
 */
export function LanguageBar({
  bytes,
  label,
}: {
  bytes: Record<string, number>;
  /** Prefixo do rótulo acessível da barra — o título da seção. */
  label: string;
}) {
  const total = Object.values(bytes).reduce((sum, value) => sum + value, 0);
  if (total === 0) return null;

  const parts = Object.entries(bytes)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value,
      percent: (value / total) * 100,
    }));

  return (
    <div>
      <div
        className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
        role="img"
        aria-label={`${label}: ${parts
          .map((part) => `${part.name} ${part.percent.toFixed(1)}%`)
          .join(", ")}`}
      >
        {parts.map((part) => (
          <span
            key={part.name}
            style={{
              width: `${part.percent}%`,
              backgroundColor: languageColor(part.name),
            }}
          />
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {parts.map((part) => (
          <li
            key={part.name}
            className="inline-flex items-center gap-2 text-xs text-muted"
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: languageColor(part.name) }}
            />
            {part.name}
            <span className="font-mono text-[11px] opacity-70">
              {part.percent.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
