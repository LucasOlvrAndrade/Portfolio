import type { ReactNode } from "react";

/**
 * Aviso de que o texto a seguir não existe no idioma da página.
 *
 * Aparece quando o repositório não tem `README.<locale>.md` e o site cai
 * no original. Servir outro idioma sem dizer nada faria o leitor achar
 * que o site quebrou; dizer é mais honesto e custa uma linha.
 *
 * Discreto de propósito: é uma nota de rodapé no topo do conteúdo, não
 * um alerta. Por isso não tem `role="alert"` — nada aqui é urgente.
 */
export function TranslationNotice({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`flex items-start gap-2.5 rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-xs leading-relaxed text-muted ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-px size-4 shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
      </svg>
      {children}
    </p>
  );
}
