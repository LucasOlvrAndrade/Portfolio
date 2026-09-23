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
    titleTemplate: "%s · Lucas Andrade",
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
    switchLanguage: "{short}, ver em {language}",
    currentLanguage: "{short}, idioma atual: {language}",
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
        "Carregado direto da API do GitHub, sempre atualizado, sem edição manual. Forks e repositórios arquivados ficam de fora.",
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
        "Sistemas prontos para vender, adaptados com a sua marca. Preço e prazo vão na proposta, é só chamar.",
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
      "Estudante de Engenharia de Software com experiência em suporte técnico. Construindo base sólida em programação, banco de dados e infraestrutura, um projeto de cada vez.",
    viewProjects: "Ver projetos",
    getInTouch: "Entrar em contato",
    companyLink: "{company}: abrir site em nova aba",
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
    privacy: "Privacidade",
    cookiePreferences: "Preferências de cookies",
  },

  cookies: {
    title: "Cookies",
    text: "Uso cookies de estatística (Google Analytics e Microsoft Clarity) para saber o que é lido e o que está quebrado. Eles só carregam se você aceitar; recusando, o site funciona igual.",
    learnMore: "Política de privacidade",
    reject: "Recusar",
    accept: "Aceitar",
  },

  privacy: {
    title: "Privacidade",
    metaDescription:
      "O que acontece com os seus dados neste site, com quem são compartilhados, por quanto tempo ficam e como pedir para apagar.",
    updated: "Última atualização: 23 de setembro de 2026",
    intro:
      "Este é um site pessoal. Ele não tem formulário, cadastro nem banco de dados. Esta página explica o pouco que acontece com os seus dados quando você visita ou me chama, e como pedir para apagar.",
    who: {
      title: "Quem cuida dos dados",
      body: [
        "Lucas de Oliveira Andrade, pessoa física, Brasília (DF). Para qualquer assunto de privacidade, escreva para {email}. Respondo em até 15 dias.",
      ],
      items: [],
    },
    what: {
      title: "O que é coletado, e por quê",
      body: [],
      items: [
        "Estatística de visitas, só se você aceitar os cookies: páginas vistas, cliques e rolagem, tipo de aparelho e navegador, cidade aproximada e um identificador aleatório guardado num cookie. Serve para eu saber o que é lido e o que está quebrado. Base legal: o seu consentimento (LGPD, art. 7, I).",
        "Mensagens que você me manda por e-mail ou WhatsApp: seu nome, endereço ou número e o que você escrever. Servem para responder e, se você pedir, fazer uma proposta. Base legal: procedimentos anteriores a um contrato, a seu pedido (LGPD, art. 7, V).",
        "Registros técnicos da hospedagem: endereço IP e navegador de cada acesso, guardados pela Vercel por pouco tempo para o site funcionar e se proteger de abuso. Base legal: legítimo interesse (LGPD, art. 7, IX).",
      ],
    },
    notCollected: {
      title: "O que não é coletado",
      body: [
        "Não há cookie de propaganda, pixel de rede social nem venda de dados. Os projetos vêm da API pública do GitHub, consultada pelo servidor, sem levar nada seu. O tema claro ou escuro fica salvo só no seu navegador.",
      ],
      items: [],
    },
    sharing: {
      title: "Com quem é compartilhado",
      body: [
        "Não vendo nem cedo dados a ninguém. Eles passam só pelos serviços que fazem o site funcionar, que ficam fora do Brasil e seguem regras de proteção próprias (LGPD, art. 33):",
      ],
      items: [
        "Vercel: hospedagem do site.",
        "Google (Analytics) e Microsoft (Clarity): estatística, só com o seu aceite.",
        "Google (Gmail) e Meta (WhatsApp): onde chegam as suas mensagens.",
      ],
    },
    retention: {
      title: "Por quanto tempo",
      body: [],
      items: [
        "Estatística: até 14 meses no Google Analytics; no Clarity, gravações de sessão por 30 dias e mapas de calor por até 13 meses.",
        "Mensagens: enquanto a conversa for útil. Apago quando você pedir.",
        "Sua escolha sobre cookies: 6 meses. Depois o site pergunta de novo.",
      ],
    },
    cookies: {
      title: "Cookies",
      body: [
        "Você muda de ideia quando quiser em Preferências de cookies, no rodapé. Retirando o aceite, os cookies de estatística gravados neste site são apagados.",
      ],
      items: [
        "consent: guarda a sua escolha. Necessário, 6 meses.",
        "_ga e _ga_*: Google Analytics, estatística. 13 meses.",
        "_clck e _clsk: Microsoft Clarity, estatística. 1 ano e 1 dia.",
        "MUID, CLID, MR, SM, SRM_B e ANONCHK: gravados pelo Clarity nos domínios da Microsoft (clarity.ms e bing.com), por até 13 meses. Como ficam no domínio dela, este site não consegue apagá-los; o seu navegador apaga em Configurações, Cookies.",
      ],
    },
    rights: {
      title: "Seus direitos",
      body: ["Pela LGPD (art. 18), você pode, de graça:"],
      items: [
        "saber se tenho dados seus e ver quais são;",
        "corrigir o que estiver errado;",
        "pedir para apagar;",
        "saber com quem foram compartilhados;",
        "retirar o consentimento que deu.",
      ],
    },
    delete: {
      title: "Como apagar os seus dados",
      body: [
        "Mande “quero apagar meus dados” para {email} ou no mesmo WhatsApp em que conversamos. Apago as mensagens e confirmo em até 15 dias.",
        "Para a estatística, recuse os cookies em Preferências de cookies. Se quiser que eu apague também o que já foi coletado, me mande junto o valor do cookie _ga (o navegador mostra em Configurações do site) que eu peço a exclusão ao Google e à Microsoft.",
      ],
      items: [],
    },
    changes: {
      title: "Mudanças",
      body: [
        "Se algo aqui mudar, a data lá em cima muda junto. Se entrar um serviço novo que colete dados, ele passa pelo banner antes.",
      ],
      items: [],
    },
  },

  og: {
    subtitle: "Engenharia de Software · UniCEUB · Distrito Federal",
  },
} as const;

export type Dictionary = typeof pt;
