import type { Metadata } from "next";
import Image from "next/image";

import { siteConfig } from "@/config/site";
import { getI18n } from "@/i18n";
import { locales, localeMeta } from "@/i18n/config";
import { sectionPath } from "@/i18n/routes";

/**
 * Página de venda do sistema de barbearia.
 *
 * Existe para a BUSCA. A vitrine de serviços da home é uma âncora numa
 * página única, e âncora não aparece sozinha no Google: quem procura
 * "sistema de agendamento para barbearia" precisa cair numa URL que fale
 * só disso. A demo não serve, porque é `noindex` de propósito (a barbearia
 * dela é inventada).
 *
 * Só entra o que o sistema faz hoje. Cada item de `features` foi conferido
 * contra o código do sistema-barbearia; nada de "em breve", preço ou prazo
 * (vão na proposta, como na home). O texto mora nos dicionários.
 *
 * As capturas são da demo no ar, em /public/barbearia, regeradas junto
 * com as do README da vitrine pública.
 */

const DEMO = siteConfig.services.find((s) => s.key === "agendamento")?.demo ?? "https://barbearia.lucas-andrade.dev";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, copy } = await getI18n();
  const url = `${siteConfig.url}${sectionPath(locale, "barbershop")}`;

  return {
    title: copy.barbershop.title,
    description: copy.barbershop.metaDescription,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [localeMeta[l].html, `${siteConfig.url}${sectionPath(l, "barbershop")}`]),
      ),
    },
    openGraph: {
      title: copy.barbershop.title,
      description: copy.barbershop.metaDescription,
      url,
      images: [{ url: "/barbearia/landing.webp", width: 1280, height: 900 }],
    },
  };
}

export default async function BarbershopPage() {
  const { locale, copy } = await getI18n();
  const c = copy.barbershop;
  const zap = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(c.whatsappMessage)}`;

  const telas = [
    { src: "/barbearia/landing.webp", w: 1280, h: 900, legenda: c.screens.landing },
    { src: "/barbearia/barbeiros.webp", w: 1280, h: 900, legenda: c.screens.barbers },
    { src: "/barbearia/agendar.webp", w: 1280, h: 900, legenda: c.screens.booking },
    { src: "/barbearia/painel.webp", w: 1600, h: 1000, legenda: c.screens.panel },
    { src: "/barbearia/semana.webp", w: 1600, h: 1000, legenda: c.screens.week },
  ];

  // Só o que a página mostra: o Google pune dado estruturado que não bate
  // com o conteúdo. Service + FAQPage, com o mesmo texto das perguntas.
  const dados = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: c.title,
        description: c.metaDescription,
        serviceType: c.title,
        provider: { "@id": `${siteConfig.url}/#pessoa` },
        areaServed: "BR",
        url: `${siteConfig.url}${sectionPath(locale, "barbershop")}`,
      },
      {
        "@type": "FAQPage",
        mainEntity: c.faq.items.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <article className="page-section mx-auto max-w-5xl px-6 py-20 sm:py-28">
      <script
        type="application/ld+json"
        // `<` escapado: JSON dentro de <script> não pode conter "</script>".
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, "\\u003c") }}
      />

      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{c.eyebrow}</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          {c.title}
        </h1>
        <p className="mt-6 text-pretty text-lg leading-relaxed text-muted">{c.lead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={DEMO}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-bg transition-colors hover:bg-accent-hover"
          >
            {c.demo} ↗
          </a>
          <a
            href={zap}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium text-text transition-colors hover:border-accent/60 hover:text-accent"
          >
            {c.ask}
          </a>
        </div>
        <p className="mt-4 text-sm text-muted">{c.demoNote}</p>
      </header>

      <figure className="mt-14">
        <Image
          src={telas[0].src}
          width={telas[0].w}
          height={telas[0].h}
          alt={telas[0].legenda}
          priority
          sizes="(min-width: 1024px) 976px, 100vw"
          className="w-full rounded-xl border border-border"
        />
      </figure>

      <section aria-labelledby="por-que" className="mt-20">
        <h2 id="por-que" className="text-2xl font-semibold tracking-tight text-text">
          {c.why.title}
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {c.why.items.map((item) => (
            <div key={item.title}>
              <h3 className="font-medium text-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="telas" className="mt-20">
        <h2 id="telas" className="text-2xl font-semibold tracking-tight text-text">
          {c.screens.title}
        </h2>
        <div className="mt-8 grid gap-10 sm:grid-cols-2">
          {telas.slice(1).map((t) => (
            <figure key={t.src}>
              <Image
                src={t.src}
                width={t.w}
                height={t.h}
                alt={t.legenda}
                sizes="(min-width: 640px) 480px, 100vw"
                className="w-full rounded-xl border border-border"
              />
              <figcaption className="mt-3 text-sm leading-relaxed text-muted">{t.legenda}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section aria-labelledby="recursos" className="mt-20">
        <h2 id="recursos" className="text-2xl font-semibold tracking-tight text-text">
          {c.features.title}
        </h2>
        <div className="mt-8 grid gap-10 sm:grid-cols-2">
          {[c.features.client, c.features.panel].map((grupo) => (
            <div key={grupo.title}>
              <h3 className="font-medium text-text">{grupo.title}</h3>
              <ul className="mt-4 space-y-2">
                {grupo.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-text">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="contratacao" className="mt-20">
        <h2 id="contratacao" className="text-2xl font-semibold tracking-tight text-text">
          {c.how.title}
        </h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-3">
          {c.how.steps.map((passo, i) => (
            <li key={passo.title}>
              <p className="font-mono text-sm text-accent">0{i + 1}</p>
              <h3 className="mt-2 font-medium text-text">{passo.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{passo.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-muted">{c.how.price}</p>
      </section>

      <section aria-labelledby="perguntas" className="mt-20 max-w-3xl">
        <h2 id="perguntas" className="text-2xl font-semibold tracking-tight text-text">
          {c.faq.title}
        </h2>
        <dl className="mt-8 divide-y divide-border border-y border-border">
          {c.faq.items.map((f) => (
            <div key={f.q} className="py-5">
              <dt className="font-medium text-text">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="chamada"
        className="mt-20 rounded-xl border border-border bg-surface p-6 sm:p-10"
      >
        <h2 id="chamada" className="text-2xl font-semibold tracking-tight text-text">
          {c.cta.title}
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">{c.cta.body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={zap}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-bg transition-colors hover:bg-accent-hover"
          >
            {c.ask}
          </a>
          <a
            href={DEMO}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium text-text transition-colors hover:border-accent/60 hover:text-accent"
          >
            {c.demo} ↗
          </a>
        </div>
      </section>
    </article>
  );
}
