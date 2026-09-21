import { siteConfig } from "@/config/site";
import { getCopyFor } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { localeMeta } from "@/i18n/config";

/**
 * Dados estruturados (schema.org) para o buscador entender quem é a pessoa
 * e o que o site é: uma Person, o WebSite e um Service por item da vitrine.
 *
 * Só entra o que a página já mostra. Nada de avaliação, endereço ou horário
 * inventado: o Google pune dado estruturado que não bate com o conteúdo.
 * Tudo sai de `siteConfig` e dos dicionários, então mudar lá muda aqui.
 */
export function JsonLd({ locale }: { locale: Locale }) {
  const copy = getCopyFor(locale);
  const url = `${siteConfig.url}/${locale}`;
  const pessoa = {
    "@type": "Person",
    "@id": `${siteConfig.url}/#pessoa`,
    name: "Lucas Andrade",
    url: siteConfig.url,
    email: `mailto:${siteConfig.contact.email}`,
    jobTitle: siteConfig.work.position[locale],
    worksFor: {
      "@type": "Organization",
      name: siteConfig.work.company,
      url: siteConfig.work.url,
    },
    sameAs: [
      `https://github.com/${siteConfig.githubUser}`,
      siteConfig.contact.linkedin,
      siteConfig.contact.instagram,
    ],
  };
  const site = {
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#site`,
    name: "Lucas Andrade",
    url,
    inLanguage: localeMeta[locale].html,
    description: copy.metadata.description,
    author: { "@id": pessoa["@id"] },
  };
  const servicos = siteConfig.services.map((s) => ({
    "@type": "Service",
    name: s.title[locale],
    description: s.tagline[locale],
    provider: { "@id": pessoa["@id"] },
    areaServed: "BR",
    url: `${url}#services`,
  }));
  const dados = { "@context": "https://schema.org", "@graph": [pessoa, site, ...servicos] };

  return (
    <script
      type="application/ld+json"
      // `<` escapado: JSON dentro de <script> não pode conter "</script>".
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, "\\u003c") }}
    />
  );
}
