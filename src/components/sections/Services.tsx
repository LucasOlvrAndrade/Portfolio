import { Reveal } from "@/components/ui/Reveal";
import { LivePreview } from "@/components/ui/LivePreview";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/config/site";
import { getI18n } from "@/i18n";
import { fill } from "@/i18n/config";

/**
 * Vitrine dos serviços à venda. Os itens vêm de `siteConfig.services`;
 * cada card leva para a demo e para o WhatsApp com a mensagem já
 * citando o serviço. Sem preço na tela, de propósito: a proposta é
 * mandada na conversa.
 */
export async function Services() {
  const { locale, copy } = await getI18n();
  const c = copy.sections.services;

  return (
    <Section id="services" eyebrow={c.eyebrow} title={c.title} description={c.description}>
      <ul className="grid gap-4">
        {siteConfig.services.map((s, index) => {
          const nome = s.title[locale];
          const mensagem = fill(c.whatsappMessage, { service: nome });
          return (
            <Reveal as="li" key={s.key} delay={index * 80}>
              <article className="grid gap-8 rounded-xl border border-border bg-surface p-6 sm:p-8">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-text">{nome}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.tagline[locale]}</p>
                  <ul className="mt-5 space-y-2">
                    {s.includes[locale].map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-text">
                        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(mensagem)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-bg transition-colors hover:bg-accent-hover"
                    >
                      {c.ask}
                    </a>
                    {s.demo && (
                      <a
                        href={s.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium text-text transition-colors hover:border-accent/60 hover:text-accent"
                      >
                        {c.demo} ↗
                      </a>
                    )}
                  </div>
                </div>
                {/* O site de verdade, ao vivo, em desktop e no escuro (modo vitrine da demo). */}
                {s.demo && <LivePreview src={`${s.demo}/?vitrine=1&tema=escuro`} title={nome} />}
              </article>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
