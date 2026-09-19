/**
 * Configuração do site.
 *
 * Este é o ÚNICO arquivo que precisa ser editado no dia a dia — e só
 * quando você quiser destacar ou esconder algo específico. Repositórios
 * novos aparecem automaticamente via API, sem tocar em código.
 *
 * Campos com as chaves `pt` e `en` são texto exibido, e precisam dos dois.
 * O texto que não é configuração — títulos de seção, rótulos, botões —
 * mora em `src/i18n/dictionaries/`.
 */

export const siteConfig = {
  /** Username do GitHub. Vem do env, com fallback para não quebrar o build. */
  githubUser: process.env.NEXT_PUBLIC_GITHUB_USER ?? "LucasOlvrAndrade",

  /**
   * Domínio canônico. Alimenta `metadataBase`, as tags canônicas, o
   * Open Graph e o `hreflang` — apontar para um endereço morto faz o
   * buscador indexar o lugar errado e quebra a prévia de compartilhamento.
   *
   * Sem `www` de propósito: é o domínio raiz que serve o site, e o
   * endereço mais curto é o que vai para a bio das redes.
   */
  url: "https://lucas-andrade.dev",

  /** Exibido no Hero, no <title> da aba e na imagem de compartilhamento. */
  role: {
    pt: "Estagiário de desenvolvimento · Grupo RAM",
    en: "Development intern · Grupo RAM",
  },

  /**
   * Trabalho atual — vira um card com logo na seção "Contato".
   * Para remover, apague este bloco e o card some sozinho.
   * O logo mora em `public/`, servido pelo próprio site: não depende
   * do servidor da empresa continuar no ar nem do caminho do arquivo lá.
   */
  work: {
    company: "Grupo RAM",
    position: {
      pt: "Estagiário de desenvolvimento",
      en: "Development intern",
    },
    url: "https://memoriaram.com.br",
    logo: "/grupo-ram.png",
    logoWidth: 540,
    logoHeight: 150,
    /** Cores amostradas do próprio arquivo do logo, para o realce combinar. */
    brand: {
      green: "#0F7433",
      amber: "#F8AA14",
      ink: "#0D1522",
    },
  },

  contact: {
    email: "lucasolvrandrade@gmail.com",
    /** Digitos com DDI, para o wa.me. */
    whatsapp: "5561993186733",
    linkedin: "https://www.linkedin.com/in/lucas-andrade-93b3273b3/",
    instagram: "https://instagram.com/lucxsolvr",
  },

  /**
   * Serviços à venda — a vitrine da seção "Serviços".
   *
   * Cada item é um produto pronto que se adapta ao cliente. Sem preço aqui
   * de propósito: a proposta vai na conversa. Para vender mais um, é
   * acrescentar um objeto — o card, o botão e a mensagem do WhatsApp saem
   * daqui.
   */
  services: [
    {
      key: "agendamento",
      title: { pt: "Site de agendamento com painel", en: "Booking website with management panel" },
      tagline: {
        pt: "Para barbearia, salão, estúdio de tatuagem, clínica — qualquer negócio com hora marcada.",
        en: "For barbershops, salons, tattoo studios, clinics — any appointment-based business.",
      },
      includes: {
        pt: [
          "Cliente escolhe o profissional, o serviço e o horário pelo celular",
          "Painel com agenda do dia e da semana, folgas e feriados automáticos",
          "Faturamento, comissão por profissional e exportação para o contador",
          "Sua marca, seu domínio, sem marketplace mostrando o concorrente ao lado",
        ],
        en: [
          "Clients pick the professional, the service and the time from their phone",
          "Panel with day and week schedule, days off and automatic holidays",
          "Revenue, commission per professional and an export for the accountant",
          "Your brand, your domain, no marketplace showing your competitor next to you",
        ],
      },
      demo: "https://barbearia.lucas-andrade.dev",
    },
  ],

  /**
   * Repositórios destacados — aparecem primeiro, com card maior.
   * Basta adicionar o nome exato do repo. Ex.: ["Calculadora-java"]
   */
  featured: ["sistema-barbearia", "portfolio", "Calculadora-java"] as string[],

  /**
   * Repositórios ocultos, além dos forks e arquivados (escondidos por padrão).
   * - `lucasolvrandrade`: é o README do perfil, não um projeto
   * - `seminario-introc`: repositório vazio (0 KB). Vitrine mostra o melhor,
   *   não o inventário — repo sem conteúdo comunica descuido.
   */
  hidden: ["lucasolvrandrade", "seminario-introc"] as string[],

  /**
   * Bio em inglês.
   *
   * A do GitHub é um campo só, e está em português. Sem isto, o subtítulo
   * da seção "Sobre" em /en viria em português.
   */
  bio: {
    en: "Second-semester Software Engineering student at Centro Universitário de Brasília (CEUB).",
  } as Record<string, string>,

  /**
   * Descrição em inglês por repositório.
   *
   * O GitHub guarda UMA descrição por repositório, e a sua está em
   * português. Sem esta tabela, `/en` mostraria cards em português.
   * A chave é o nome exato do repositório; o que não estiver aqui cai
   * na descrição do GitHub, em português mesmo.
   */
  descriptions: {
    en: {
      "sistema-barbearia":
        "Booking site with barber choice and a management panel for the barbershop: schedule, revenue, commissions, clients and days off. Next.js 16 + Postgres. Live demo.",
      portfolio:
        "Personal portfolio site that lists GitHub repositories automatically through the API. Next.js 16 + TypeScript + Tailwind v4.",
      "Calculadora-java":
        "Console calculator in Java: addition, subtraction, multiplication, division and exponentiation, reading input with Scanner.",
      "github-page":
        "Portfolio site in HTML, CSS and JavaScript, built during the intermediate stage of Bootcamp I.",
      EngenhariaDeRequisitos_2026_2:
        "Practical coursework for the Requirements Engineering course.",
      "Introducao-Computacao-Hardware":
        "Coursework for the Introduction to Computing course.",
    } as Record<string, string>,
  },

  /**
   * Skills exibidas na seção "Tecnologias".
   * Vêm do seu README de perfil — não das linguagens dos repositórios,
   * que hoje estão majoritariamente nulas na API.
   */
  skills: {
    pt: [
      {
        group: "Linguagens",
        items: ["Java", "HTML", "CSS", "JavaScript", "SQL"],
      },
      {
        group: "Banco de Dados",
        items: ["MySQL", "Modelagem de Dados"],
      },
      {
        group: "Ferramentas",
        items: ["Git", "GitHub", "VS Code", "Windows"],
      },
      {
        group: "Estudando",
        items: [
          "Estruturas de Dados",
          "Engenharia de Requisitos",
          "Desenvolvimento Web",
          "Boas Práticas",
        ],
      },
    ],
    en: [
      {
        group: "Languages",
        items: ["Java", "HTML", "CSS", "JavaScript", "SQL"],
      },
      {
        group: "Databases",
        items: ["MySQL", "Data Modeling"],
      },
      {
        group: "Tools",
        items: ["Git", "GitHub", "VS Code", "Windows"],
      },
      {
        group: "Studying",
        items: [
          "Data Structures",
          "Requirements Engineering",
          "Web Development",
          "Best Practices",
        ],
      },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
