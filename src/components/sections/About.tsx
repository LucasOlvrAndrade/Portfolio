import { Section } from "@/components/ui/Section";
import type { ReadmeSection } from "@/lib/readme";

type AboutProps = {
  /** Seções extraídas do README de perfil. Vazio se o repo não existir. */
  sections: ReadmeSection[];
  /** Bio do perfil — fallback quando não há README. */
  bio: string | null;
};

export function About({ sections, bio }: AboutProps) {
  // Seções com prosa viram texto corrido; as com lista viram cartões.
  const prose = sections.filter((section) => section.paragraphs.length > 0);
  const lists = sections.filter(
    (section) => section.bullets.length > 0 && section.paragraphs.length === 0,
  );

  const hasReadme = prose.length > 0 || lists.length > 0;

  return (
    <Section
      id="sobre"
      eyebrow="Sobre"
      title="Quem está por trás dos projetos"
      description={bio ?? undefined}
    >
      {!hasReadme ? (
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          {bio ?? "Perfil ainda sem descrição no GitHub."}
        </p>
      ) : (
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {prose.map((section, index) => (
              <div key={section.heading}>
                {/* O primeiro bloco é a introdução: o título dele é o
                    próprio nome, que já aparece no Hero. */}
                {index > 0 && (
                  <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-accent">
                    {section.heading}
                  </h3>
                )}
                <div className="space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-pretty text-base leading-relaxed text-muted"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {lists.length > 0 && (
            <aside className="space-y-8">
              {lists.map((section) => (
                <div
                  key={section.heading}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
                    {section.heading}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-2.5 text-sm leading-snug text-muted"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1.5 size-1 shrink-0 rounded-full bg-accent"
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </aside>
          )}
        </div>
      )}
    </Section>
  );
}
