import type { Dictionary } from "./pt";

/**
 * Alarga os tipos literais que o `as const` do dicionário português
 * produziu. Sem isto, `en` teria de repetir o texto em português para
 * satisfazer o tipo — o que é exatamente o contrário do que queremos.
 *
 * O que a checagem preserva é a FORMA: toda chave de `pt` precisa existir
 * aqui, com o mesmo aninhamento. Esquecer uma quebra o build.
 */
export type Translation<T> = T extends readonly string[]
  ? readonly string[]
  : T extends string
    ? string
    : { readonly [K in keyof T]: Translation<T[K]> };

export const en: Translation<Dictionary> = {
  metadata: {
    description:
      "Portfolio of Lucas Andrade, a Software Engineering student at UniCEUB, Brazil. Projects, technologies and contact.",
    keywords: [
      "Lucas Andrade",
      "portfolio",
      "software engineering",
      "developer",
      "Java",
      "UniCEUB",
      "Brasília",
    ],
    titleTemplate: "%s — Lucas Andrade",
  },

  a11y: {
    skipToContent: "Skip to content",
    mainNav: "Main navigation",
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    themeLight: "Light theme",
    themeDark: "Dark theme",
    languageGroup: "Language",
    switchLanguage: "View in {language}",
    currentLanguage: "Current language: {language}",
  },

  sections: {
    about: {
      nav: "About",
      eyebrow: "About",
      title: "Who is behind the projects",
      empty: "This profile has no description on GitHub yet.",
      metaDescription:
        "Software Engineering studies at UniCEUB and a background in technical support.",
    },
    projects: {
      nav: "Projects",
      eyebrow: "Projects",
      title: "What I have been building",
      description:
        "Loaded straight from the GitHub API — always current, never edited by hand. Forks and archived repositories are left out.",
      empty: "No public repositories to show yet.",
      viewProfile: "View profile on GitHub",
      metaDescription:
        "Projects by Lucas Andrade, loaded straight from the GitHub API.",
    },
    skills: {
      nav: "Technologies",
      eyebrow: "Technologies",
      title: "Everyday tools",
      description:
        "What I already use with confidence, and what I am studying right now.",
      metaDescription:
        "Languages, databases and tools I use and the ones I am studying.",
    },
    services: {
      nav: "Services",
      eyebrow: "Services",
      title: "What I build for your business",
      description:
        "Ready-made systems, adapted to your brand. Price and timeline come in the proposal — just reach out.",
      metaDescription:
        "Services by Lucas Andrade: booking website with a management panel for barbershops and other appointment-based businesses.",
      demo: "See the demo",
      ask: "Hire me",
      whatsappMessage: "Hi Lucas! I saw the “{service}” service on your portfolio and I'd like a proposal.",
    },
    contact: {
      nav: "Contact",
      eyebrow: "Contact",
      title: "Let's talk",
      description: "Open to projects and conversations about technology.",
      metaDescription:
        "Email, GitHub, LinkedIn and Instagram for Lucas Andrade.",
      proposal:
        "Run a barbershop, salon or another appointment-based business? I build the booking site with your brand.",
      proposalLink: "Message me on WhatsApp",
    },
  },

  hero: {
    tagline:
      "Software Engineering student with a background in technical support. Building a solid foundation in programming, databases and infrastructure — one project at a time.",
    viewProjects: "View projects",
    getInTouch: "Get in touch",
    companyLink: "{company} — open website in a new tab",
    companyLogoAlt: "{company} logo",
    avatarAlt: "Profile photo of {name}",
  },

  explorer: {
    filterByLanguage: "Filter by language",
    all: "All",
    sortLabel: "Sort",
    sortRecent: "Most recent",
    sortStars: "Most stars",
    sortName: "Name (A–Z)",
    emptyForLanguage: "No projects in {language}.",
    viewAll: "View all",
    countOne: "{count} project shown.",
    countMany: "{count} projects shown.",
    loading: "Loading projects from GitHub…",
  },

  card: {
    featured: "Featured",
    published: "Live",
    stars: "Stars: ",
    forks: "Forks: ",
    lastCommitOn: "Last commit on {date}",
  },

  project: {
    back: "Projects",
    codeOnGitHub: "Code on GitHub",
    viewLive: "View live",
    lastCommit: "Last commit",
    language: "Language",
    stars: "Stars",
    forks: "Forks",
    composition: "Composition",
    about: "About this project",
    noReadme: "This repository does not have a README with content yet.",
    seeCode: "See the code on GitHub",
    notFound: "Project not found",
    fallbackDescription: "{name}, a project by {user}.",
    readmeNotTranslated: "This README is only available in Portuguese.",
  },

  errors: {
    rateLimitTitle: "Too many requests to the GitHub API just now",
    genericTitle: "Could not load the projects",
    resetAt: " The limit resets at around {time}.",
    viewRepos: "View repositories on GitHub",
    rateLimit:
      "GitHub API rate limit reached. The projects will be back in a moment.",
    notFound: "Resource not found on the GitHub API.",
    network: "Could not reach the GitHub API.",
    status: "The GitHub API responded {status}.",
    projectNotFound: "Project not found.",
  },

  footer: {
    credit: "© {year} Lucas Andrade. Built with Next.js and Tailwind.",
    loadedVia: "Projects loaded via",
    githubApi: "GitHub API",
  },

  og: {
    subtitle: "Software Engineering · UniCEUB · Brasília, Brazil",
  },
};
