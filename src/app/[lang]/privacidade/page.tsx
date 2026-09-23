import type { Metadata } from "next";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { getI18n } from "@/i18n";
import { locales, localeMeta } from "@/i18n/config";
import { sectionPath } from "@/i18n/routes";

/**
 * Política de privacidade (LGPD, art. 9).
 *
 * Página de verdade, e não âncora da home: é o endereço que o banner de
 * cookies e o rodapé apontam, e precisa ser lida inteira sem rolar por
 * cima do portfólio. Sem animação de entrada: texto legal tem que estar
 * visível de cara.
 *
 * A ordem das seções mora aqui; o texto, nos dicionários.
 */
const order = [
  "who",
  "what",
  "notCollected",
  "sharing",
  "retention",
  "cookies",
  "rights",
  "delete",
  "changes",
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const { locale, copy } = await getI18n();

  return {
    title: copy.privacy.title,
    description: copy.privacy.metaDescription,
    alternates: {
      canonical: `${siteConfig.url}${sectionPath(locale, "privacy")}`,
      languages: Object.fromEntries(
        locales.map((l) => [localeMeta[l].html, `${siteConfig.url}${sectionPath(l, "privacy")}`]),
      ),
    },
  };
}

/** Troca `{email}` por um link de e-mail de verdade. */
function withEmail(text: string): ReactNode {
  const [before, after] = text.split("{email}");
  if (after === undefined) return text;
  const email = siteConfig.contact.email;
  return (
    <>
      {before}
      <a href={`mailto:${email}`} className="text-accent underline underline-offset-4">
        {email}
      </a>
      {after}
    </>
  );
}

export default async function PrivacyPage() {
  const { copy } = await getI18n();
  const privacy = copy.privacy;

  return (
    <article className="page-section mx-auto max-w-5xl px-6 py-20 sm:py-28">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          {privacy.title}
        </h1>
        <p className="mt-3 font-mono text-xs text-muted">{privacy.updated}</p>
        <p className="mt-6 text-pretty text-lg leading-relaxed text-muted">
          {privacy.intro}
        </p>

        {order.map((key) => {
          const section = privacy[key];
          return (
            <section key={key} id={key} aria-labelledby={`${key}-titulo`} className="mt-12">
              <h2 id={`${key}-titulo`} className="text-xl font-semibold tracking-tight text-text">
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-relaxed text-text">
                  {withEmail(paragraph)}
                </p>
              ))}
              {section.items.length > 0 && (
                <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-text marker:text-accent">
                  {section.items.map((item) => (
                    <li key={item}>{withEmail(item)}</li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </article>
  );
}
