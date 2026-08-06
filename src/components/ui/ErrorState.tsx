import { siteConfig } from "@/config/site";
import { fill } from "@/i18n/config";
import type { Copy } from "@/i18n";
import type { FetchError } from "@/lib/types";

type ErrorCopy = Copy["errors"];

/** A frase é montada aqui, e não na camada de dados, que não conhece idioma. */
function explain(error: FetchError, copy: ErrorCopy): string {
  switch (error.kind) {
    case "rate_limit":
      return copy.rateLimit;
    case "not_found":
      return copy.notFound;
    case "network":
      return copy.network;
    default:
      return fill(copy.status, { status: error.status ?? 0 });
  }
}

/**
 * Estado de falha da API. Nunca deixa a seção vazia: explica o que houve
 * e sempre oferece o caminho alternativo (ir direto ao GitHub).
 */
export function ErrorState({
  error,
  copy,
  intl,
}: {
  error: FetchError;
  copy: ErrorCopy;
  /** Tag de idioma para formatar a hora do reset. */
  intl: string;
}) {
  const isRateLimit = error.kind === "rate_limit";

  const resetLabel =
    isRateLimit && error.resetAt
      ? new Date(error.resetAt * 1000).toLocaleTimeString(intl, {
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
        {isRateLimit ? copy.rateLimitTitle : copy.genericTitle}
      </p>

      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        {explain(error, copy)}
        {resetLabel && fill(copy.resetAt, { time: resetLabel })}
      </p>

      <a
        href={`https://github.com/${siteConfig.githubUser}?tab=repositories`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-accent transition-colors hover:border-accent"
      >
        {copy.viewRepos}
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
