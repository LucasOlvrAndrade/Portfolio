import { siteConfig } from "@/config/site";
import type { FetchError } from "@/lib/types";

/**
 * Estado de falha da API. Nunca deixa a seção vazia: explica o que houve
 * e sempre oferece o caminho alternativo (ir direto ao GitHub).
 */
export function ErrorState({ error }: { error: FetchError }) {
  const isRateLimit = error.kind === "rate_limit";

  const resetLabel =
    isRateLimit && error.resetAt
      ? new Date(error.resetAt * 1000).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <div
      role="status"
      className="rounded-xl border border-dashed border-border bg-surface p-8 text-center"
    >
      <div className="mx-auto grid size-11 place-items-center rounded-full bg-surface-2 text-muted">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>

      <p className="mt-4 text-sm font-medium text-text">
        {isRateLimit
          ? "Muitas requisições à API do GitHub agora há pouco"
          : "Não foi possível carregar os projetos"}
      </p>

      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        {error.message}
        {resetLabel && ` O limite é restaurado por volta das ${resetLabel}.`}
      </p>

      <a
        href={`https://github.com/${siteConfig.githubUser}?tab=repositories`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-accent transition-colors hover:border-accent"
      >
        Ver repositórios no GitHub
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-3.5"
          aria-hidden="true"
        >
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </a>
    </div>
  );
}
