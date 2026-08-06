import { siteConfig } from "@/config/site";
import { getI18n } from "@/i18n";
import { fill } from "@/i18n/config";

export async function Footer() {
  const { copy } = await getI18n();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted sm:flex-row">
        <p>{fill(copy.footer.credit, { year: new Date().getFullYear() })}</p>
        <p className="font-mono text-xs">
          {copy.footer.loadedVia}{" "}
          <a
            href={`https://github.com/${siteConfig.githubUser}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            {copy.footer.githubApi}
          </a>
        </p>
      </div>
    </footer>
  );
}
