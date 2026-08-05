import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} Lucas Andrade. Feito com Next.js e
          Tailwind.
        </p>
        <p className="font-mono text-xs">
          Projetos carregados via{" "}
          <a
            href={`https://github.com/${siteConfig.githubUser}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            API do GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
