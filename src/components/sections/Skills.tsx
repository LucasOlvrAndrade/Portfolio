import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/config/site";

export function Skills() {
  return (
    <Section
      id="tecnologias"
      eyebrow="Tecnologias"
      title="Ferramentas do dia a dia"
      description="O que já uso com confiança e o que estou estudando agora."
    >
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {siteConfig.skills.map((group, index) => (
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
