import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/config/site";
import { getI18n } from "@/i18n";

export async function Skills() {
  const { locale, copy } = await getI18n();
  const groups = siteConfig.skills[locale];

  return (
    <Section
      id="skills"
      eyebrow={copy.sections.skills.eyebrow}
      title={copy.sections.skills.title}
      description={copy.sections.skills.description}
    >
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group, index) => (
          <Reveal key={group.group} delay={index * 80}>
            <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
              {group.group}
            </h3>
            <ul className="mt-4 space-y-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="border-l border-border pl-3 text-sm text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
