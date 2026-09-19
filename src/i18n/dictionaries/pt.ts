/**
 * Dicionário em português — a referência.
 *
 * `en.ts` é tipado a partir daqui: esquecer uma chave lá quebra o build,
 * em vez de deixar um buraco em produção.
 *
 * Regras deste arquivo:
 * - só strings e arrays de string, nunca funções. Pedaços do dicionário
 *   viajam como prop para componentes cliente, e função não atravessa
 *   essa fronteira.
 * - interpolação por `{chave}`, resolvida por `fill()` em `../config`.
 * - os `id` das seções são âncoras de URL e vivem aqui porque mudam de
 *   idioma: `/pt#sobre` e `/en#about`.
 */

export const pt = {
  metadata: {
    description:
      "Portfólio de Lucas Andrade, estudante de Engenharia de Software no UniCEUB. Projetos, tecnologias e contato.",
    keywords: [
      "Lucas Andrade",
      "portfólio",
      "engenharia de software",
      "desenvolvedor",
      "Java",
      "UniCEUB",
      "Brasília",
    ],
    /** Sufixo do <title> das páginas internas. */
    titleTemplate: "%s — Lucas Andrade",
  },

  a11y: {
    skipToContent: "Pular para o conteúdo",
    mainNav: "Navegação principal",
    themeToLight: "Ativar tema claro",
    themeToDark: "Ativar tema escuro",
    themeLight: "Tema claro",
    themeDark: "Tema escuro",
    languageGroup: "Idioma",
    /** Título do link do idioma que NÃO está ativo. */
    switchLanguage: "Ver em {language}",
    currentLanguage: "Idioma atual: {language}",
  },

  sections: {
    about: {
      nav: "Sobre",
      eyebrow: "Sobre",
      title: "Quem está por trás dos projetos",
      empty: "Perfil ainda sem descrição no GitHub.",
      metaDescription:
        "Formação em Engenharia de Software no UniCEUB e experiência em suporte técnico.",
    },
    projects: {
      nav: "Projetos",
      eyebrow: "Projetos",
      title: "O que eu venho construindo",
      description:
        "Carregado direto da API do GitHub — sempre atualizado, sem edição manual. Forks e repositórios arquivados ficam de fora.",
      empty: "Nenhum repositório público para exibir ainda.",
      viewProfile: "Ver perfil no GitHub",
      metaDescription:
        "Projetos de Lucas Andrade, carregados direto da API do GitHub.",
    },
    skills: {
      nav: "Tecnologias",
      eyebrow: "Tecnologias",
      title: "Ferramentas do dia a dia",
      description:
        "O que já uso com confiança e o que estou estudando agora.",
      metaDescription:
        "Linguagens, bancos de dados e ferramentas que uso e que estudo.",
    },
    services: {
      nav: "Serviços",
      eyebrow: "Serviços",
      title: "O que eu faço para o seu negócio",
      description:
        "Sistemas prontos para vender, adaptados com a sua marca. Preço e prazo vão na proposta — é só chamar.",
      metaDescription:
        "Serviços de Lucas Andrade: site de agendamento com painel de gestão para barbearias e outros negócios com hora marcada.",
      demo: "Ver a demo",
      ask: "Contrate",
      whatsappMessage: "Olá, Lucas! Vi o serviço “{service}” no seu portfólio e quero uma proposta.",
    },
    contact: {
      nav: "Contato",
      eyebrow: "Contato",
      title: "Vamos conversar",
      description: "Aberto a projetos e trocas sobre tecnologia.",
      metaDescription:
        "E-mail, GitHub, LinkedIn e Instagram de Lucas Andrade.",
      proposal:
        "Tem uma barbearia, salão ou outro negócio com hora marcada? Faço o site de agendamento com a sua marca.",
      proposalLink: "Chamar no WhatsApp",
    },
  },

  hero: {
    tagline:
      "Estudante de Engenharia de Software com experiência em suporte técnico. Construindo base sólida em programação, banco de dados e infraestrutura — um projeto de cada vez.",
    viewProjects: "Ver projetos",
    getInTouch: "Entrar em contato",
    companyLink: "{company} — abrir site em nova aba",
    companyLogoAlt: "Logotipo do {company}",
    avatarAlt: "Foto de perfil de {name}",
  },

  explorer: {
    filterByLanguage: "Filtrar por linguagem",
    all: "Todos",
    sortLabel: "Ordenar",
    sortRecent: "Mais recentes",
    sortStars: "Mais estrelas",
    sortName: "Nome (A–Z)",
    emptyForLanguage: "Nenhum projeto em {language}.",
    viewAll: "Ver todos",
    countOne: "{count} projeto exibido.",
    countMany: "{count} projetos exibidos.",
    loading: "Carregando projetos do GitHub…",
  },

  card: {
    featured: "Destaque",
    published: "Publicado",
    stars: "Estrelas: ",
    forks: "Forks: ",
    lastCommitOn: "Último commit em {date}",
  },

  project: {
    back: "Projetos",
    codeOnGitHub: "Código no GitHub",
    viewLive: "Ver no ar",
    lastCommit: "Último commit",
    language: "Linguagem",
    stars: "Estrelas",
    forks: "Forks",
    composition: "Composição",
    about: "Sobre o projeto",
    noReadme: "Este repositório ainda não tem README com conteúdo.",
    seeCode: "Ver o código no GitHub",
    notFound: "Projeto não encontrado",
    fallbackDescription: "Projeto {name} de {user}.",
    /**
     * Só aparece em /en, quando o repositório não tem README.en.md.
     * Em português nunca é exibido — mas a chave existe para que os dois
     * dicionários tenham o mesmo formato.
     */
    readmeNotTranslated:
      "Este README está disponível apenas em português.",
  },

  errors: {
    rateLimitTitle: "Muitas requisições à API do GitHub agora há pouco",
    genericTitle: "Não foi possível carregar os projetos",
    resetAt: " O limite é restaurado por volta das {time}.",
    viewRepos: "Ver repositórios no GitHub",
    rateLimit:
      "Limite de requisições da API do GitHub atingido. Os projetos voltam a aparecer em instantes.",
    notFound: "Recurso não encontrado na API do GitHub.",
    network: "Não foi possível alcançar a API do GitHub.",
    status: "A API do GitHub respondeu {status}.",
    projectNotFound: "Projeto não encontrado.",
  },

  footer: {
    credit: "© {year} Lucas Andrade. Feito com Next.js e Tailwind.",
    loadedVia: "Projetos carregados via",
    githubApi: "API do GitHub",
  },

  og: {
    subtitle: "Engenharia de Software · UniCEUB · Distrito Federal",
  },
} as const;

export type Dictionary = typeof pt;
