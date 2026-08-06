"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

/**
 * O tema não vive no React: ele é a classe `.dark` no <html>, aplicada por
 * um script inline antes da primeira pintura (para não haver flash).
 * `useSyncExternalStore` lê essa fonte externa sem setState em effect.
 */
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

/** No servidor o tema é desconhecido — nada é renderizado até hidratar. */
function getServerSnapshot(): null {
  return null;
}

function readStoredTheme(): string | null {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Modo privativo pode bloquear o storage — o tema só não persiste.
  }
}

type ThemeToggleProps = {
  labels: {
    toLight: string;
    toDark: string;
    light: string;
    dark: string;
  };
};

export function ThemeToggle({ labels }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Enquanto o usuário não escolher manualmente, acompanha o sistema.
  // Este effect só altera o DOM; o store acima detecta e re-renderiza.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function onSystemChange(event: MediaQueryListEvent) {
      if (readStoredTheme()) return;
      document.documentElement.classList.toggle("dark", event.matches);
      document.documentElement.style.colorScheme = event.matches
        ? "dark"
        : "light";
    }

    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? labels.toLight : labels.toDark}
      title={isDark ? labels.light : labels.dark}
      className="grid size-9 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {/* `theme` é null até hidratar, evitando divergência servidor/cliente. */}
      {theme !== null && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[18px]"
          aria-hidden="true"
        >
          {isDark ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </>
          ) : (
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          )}
        </svg>
      )}
    </button>
  );
}
