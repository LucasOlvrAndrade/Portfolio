import type { Metadata } from "next";

import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { getI18n } from "@/i18n";
import type { Locale } from "@/i18n/config";

/**
 * A proposta comercial do sistema de barbearia, na identidade do portfólio.
 *
 * Existe em PDF no repositório privado do sistema, com a cara da barbearia.
 * Aqui é a mesma oferta — preço, prazo, o que entra, como acontece — só
 * que como página deste site, bilíngue, para quem chega pelo portfólio e
 * não pela demo. O texto vive neste arquivo porque é de UMA página: não é
 * rótulo de interface que valha pôr no dicionário.
 */

const DEMO = "https://barbearia.lucas-andrade.dev";
const WHATSAPP = "5561993186733";

const COPY = {
  pt: {
    title: "Site de agendamento para barbearia",
    metaDescription:
      "Site próprio com agendamento por barbeiro e painel de gestão: R$ 1.900 de implantação + R$ 99/mês, pronto em 7 dias úteis.",
    eyebrow: "Proposta",
    lead: "O cliente escolhe o barbeiro, o serviço e o horário — sozinho, pelo celular. Você acompanha agenda, faturamento e comissões num painel feito para usar de pé, no balcão.",
    demo: "Veja funcionando",
    setup: "Implantação",
    setupNote: "Uma vez.",
    monthly: "Mensal",
    monthlyNote: "Hospedagem, domínio, backup e suporte. Sem fidelidade.",
    ready: "Pronto em",
    readyValue: "7 dias úteis",
    readyNote: "Contados a partir do envio dos materiais.",
    included: "O que está incluído",
    includedItems: [
      ["Site com a sua marca", "nome, logo, cores, fotos, endereço e horário de funcionamento."],
      ["Seu domínio", "ex.: suabarbearia.com.br, registrado no seu nome."],
      ["Agenda por barbeiro", "cada um com a própria página e um link para colar na bio do Instagram."],
      ["Seus serviços e preços", "com “a partir de” e planos mensais quando houver."],
      ["Conta do cliente", "marca, cancela e avalia pelo celular."],
      ["Painel da barbearia", "agenda do dia e da semana, folgas e feriados, fechamento do atendimento, faturamento, comissão por barbeiro, descontos, clientes e exportação para o contador."],
      ["Contas para toda a equipe", "com o barbeiro vendo só a própria agenda."],
      ["Treinamento", "1 hora com a equipe, presencial ou por vídeo."],
    ],
    how: "Como acontece",
    steps: [
      ["Dia 0", "Você me manda logo, fotos, lista de serviços com preços, nomes dos barbeiros e horário. Sinal de 50%."],
      ["Dia 1–3", "Monto o site com a sua marca e cadastro tudo. Você recebe um link para ver."],
      ["Dia 4–5", "Ajustes do que você pedir — texto, foto, ordem, preço."],
      ["Dia 6–7", "Domínio no ar, treinamento da equipe, entrega. Restante de 50%."],
    ],
    after:
      "Depois disso, mudou um preço ou entrou um barbeiro? Você mesmo altera no painel. Precisa de algo que não está lá? Está no mensal, sem custo, se for pequeno.",
    extras: "Se quiser mais, sob orçamento",
    extrasItems: [
      "Confirmação automática por WhatsApp",
      "Pagamento online e sinal no agendamento",
      "Programa de fidelidade",
      "Lembrete de retorno para quem não vem há tempo",
    ],
    others: "Também atende a outros negócios com hora marcada: salão, estúdio de tatuagem, clínica, consultório.",
    cta: "Vamos conversar",
    whatsapp: "Chamar no WhatsApp",
    email: "Mandar e-mail",
    validity: "Proposta válida por 30 dias. Sem pagamento online no site: o cliente paga na barbearia, como hoje.",
    whatsappMessage: "Olá, Lucas! Vi a proposta do sistema de barbearia e quero conversar.",
  },
  en: {
    title: "Booking website for barbershops",
    metaDescription:
      "A barbershop's own website with per-barber booking and a management panel: R$ 1,900 setup + R$ 99/month, live in 7 business days.",
    eyebrow: "Proposal",
    lead: "Clients pick the barber, the service and the time — on their own, from their phone. You follow the schedule, revenue and commissions in a panel built to be used standing at the counter.",
    demo: "See it running",
    setup: "Setup",
    setupNote: "One-time.",
    monthly: "Monthly",
    monthlyNote: "Hosting, domain, backups and support. No lock-in.",
    ready: "Live in",
    readyValue: "7 business days",
    readyNote: "Counted from the day you send the materials.",
    included: "What's included",
    includedItems: [
      ["Your brand", "name, logo, colors, photos, address and opening hours."],
      ["Your domain", "e.g. yourbarbershop.com, registered in your name."],
      ["A schedule per barber", "each with their own page and a link for the Instagram bio."],
      ["Your services and prices", "with “from” pricing and monthly plans when you have them."],
      ["Client accounts", "book, cancel and rate from the phone."],
      ["Shop panel", "day and week schedule, days off and holidays, closing appointments with the real amount, revenue, commission per barber, discounts, clients and an export for the accountant."],
      ["Accounts for the whole team", "each barber sees only their own schedule."],
      ["Training", "1 hour with the team, in person or on video."],
    ],
    how: "How it goes",
    steps: [
      ["Day 0", "You send me the logo, photos, service list with prices, barbers' names and hours. 50% deposit."],
      ["Day 1–3", "I build the site with your brand and enter everything. You get a link to review."],
      ["Day 4–5", "Adjustments — text, photos, order, prices."],
      ["Day 6–7", "Domain live, team training, delivery. Remaining 50%."],
    ],
    after:
      "After that, a price changed or a barber joined? You change it yourself in the panel. Need something that isn't there? Small things are covered by the monthly fee.",
    extras: "Want more? Quoted separately",
    extrasItems: [
      "Automatic WhatsApp confirmations",
      "Online payment and booking deposits",
      "Loyalty program",
      "Come-back reminders for clients who haven't been in a while",
    ],
    others: "Also fits other appointment-based businesses: salons, tattoo studios, clinics, offices.",
    cta: "Let's talk",
    whatsapp: "Message on WhatsApp",
    email: "Send an email",
    validity: "Valid for 30 days. No online payment on the site: clients pay at the shop, as they do today.",
    whatsappMessage: "Hi Lucas! I saw the barbershop system proposal and I'd like to talk.",
  },
} satisfies Record<Locale, unknown>;

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getI18n();
  const c = COPY[locale];
  return { title: c.title, description: c.metaDescription };
}

export default async function ProposalPage() {
  const { locale } = await getI18n();
  const c = COPY[locale];

  return (
    <section className="page-section py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{c.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">{c.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted">{c.lead}</p>
          <a
            href={DEMO}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-medium text-text transition-colors hover:border-accent/60 hover:text-accent"
          >
            {c.demo} — barbearia.lucas-andrade.dev ↗
          </a>
        </Reveal>

        {/* Os tres numeros. E o que fecha venda; vem antes de qualquer lista. */}
        <Reveal className="mt-12" delay={80}>
          <dl className="grid gap-3 sm:grid-cols-3">
            {[
              [c.setup, "R$ 1.900", c.setupNote],
              [c.monthly, "R$ 99/mês", c.monthlyNote],
              [c.ready, c.readyValue, c.readyNote],
            ].map(([k, v, nota]) => (
              <div key={k} className="rounded-xl border border-border bg-surface p-5">
                <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted">{k}</dt>
                <dd className="mt-2 text-2xl font-semibold tracking-tight text-text">{v}</dd>
                <dd className="mt-1 text-sm text-muted">{nota}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="mt-16 grid gap-12 md:grid-cols-2">
          <Reveal delay={120}>
            <h2 className="text-xl font-semibold tracking-tight text-text">{c.included}</h2>
            <ul className="mt-5 divide-y divide-border">
              {c.includedItems.map(([t, d]) => (
                <li key={t} className="py-3 text-sm leading-relaxed">
                  <span className="font-medium text-text">{t}</span>{" "}
                  <span className="text-muted">— {d}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={160}>
            <h2 className="text-xl font-semibold tracking-tight text-text">{c.how}</h2>
            <ol className="mt-5 divide-y divide-border">
              {c.steps.map(([dia, d]) => (
                <li key={dia} className="grid grid-cols-[5.5rem_1fr] gap-3 py-3 text-sm leading-relaxed">
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent">{dia}</span>
                  <span className="text-muted">{d}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm leading-relaxed text-muted">{c.after}</p>
          </Reveal>
        </div>

        <Reveal className="mt-14 rounded-xl border border-border bg-surface-2 p-6" delay={100}>
          <h2 className="text-base font-semibold text-text">{c.extras}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {c.extrasItems.join(" · ")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{c.others}</p>
        </Reveal>

        <Reveal className="mt-14" delay={120}>
          <h2 className="text-xl font-semibold tracking-tight text-text">{c.cta}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(c.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-xl bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              {c.whatsapp}
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(c.title)}`}
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-medium text-text transition-colors hover:border-accent/60 hover:text-accent"
            >
              {c.email} — {siteConfig.contact.email}
            </a>
          </div>
          <p className="mt-5 text-xs text-muted">{c.validity}</p>
        </Reveal>
      </div>
    </section>
  );
}
