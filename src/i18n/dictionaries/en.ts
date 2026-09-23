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
    titleTemplate: "%s · Lucas Andrade",
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
        "Loaded straight from the GitHub API, always current, never edited by hand. Forks and archived repositories are left out.",
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
        "Ready-made systems, adapted to your brand. Price and timeline come in the proposal, just reach out.",
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
      "Software Engineering student with a background in technical support. Building a solid foundation in programming, databases and infrastructure, one project at a time.",
    viewProjects: "View projects",
    getInTouch: "Get in touch",
    companyLink: "{company}: open website in a new tab",
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
    privacy: "Privacy",
    cookiePreferences: "Cookie preferences",
  },

  cookies: {
    title: "Cookies",
    text: "I use analytics cookies (Google Analytics and Microsoft Clarity) to learn what gets read and what is broken. They only load if you accept; if you decline, the site works the same.",
    learnMore: "Privacy policy",
    reject: "Decline",
    accept: "Accept",
  },

  privacy: {
    title: "Privacy",
    metaDescription:
      "What happens to your data on this site, who it is shared with, how long it is kept and how to ask for it to be deleted.",
    updated: "Last updated: September 23, 2026",
    intro:
      "This is a personal website. It has no forms, no sign-up and no database. This page explains the little that happens to your data when you visit or reach out, and how to ask for it to be deleted.",
    who: {
      title: "Who is responsible",
      body: [
        "Lucas de Oliveira Andrade, private individual, Brasília, Brazil. For anything privacy-related, write to {email}. I reply within 15 days.",
      ],
      items: [],
    },
    what: {
      title: "What is collected, and why",
      body: [],
      items: [
        "Visit analytics, only if you accept cookies: pages viewed, clicks and scrolling, device and browser type, approximate city and a random identifier stored in a cookie. It tells me what gets read and what is broken. Legal basis: your consent (Brazil's LGPD, art. 7, I).",
        "Messages you send me by e-mail or WhatsApp: your name, address or number and whatever you write. They are used to reply and, if you ask, to send a proposal. Legal basis: steps prior to a contract, at your request (LGPD, art. 7, V).",
        "Hosting logs: IP address and browser of each request, kept briefly by Vercel so the site works and is protected from abuse. Legal basis: legitimate interest (LGPD, art. 7, IX).",
      ],
    },
    notCollected: {
      title: "What is not collected",
      body: [
        "No advertising cookies, no social media pixels, no selling of data. Projects come from the public GitHub API, queried by the server, without taking anything of yours. The light or dark theme is saved only in your browser.",
      ],
      items: [],
    },
    sharing: {
      title: "Who it is shared with",
      body: [
        "I do not sell or hand over data to anyone. It only goes through the services that run the site, which are outside Brazil and follow their own data protection rules (LGPD, art. 33):",
      ],
      items: [
        "Vercel: website hosting.",
        "Google (Analytics) and Microsoft (Clarity): analytics, only with your consent.",
        "Google (Gmail) and Meta (WhatsApp): where your messages arrive.",
      ],
    },
    retention: {
      title: "How long",
      body: [],
      items: [
        "Analytics: up to 14 months in Google Analytics; in Clarity, session recordings for 30 days and heatmaps for up to 13 months.",
        "Messages: as long as the conversation is useful. I delete them when you ask.",
        "Your cookie choice: 6 months. After that the site asks again.",
      ],
    },
    cookies: {
      title: "Cookies",
      body: [
        "Change your mind any time under Cookie preferences, in the footer. Withdrawing consent deletes the analytics cookies.",
      ],
      items: [
        "consent: stores your choice. Necessary, 6 months.",
        "_ga and _ga_*: Google Analytics, analytics. Up to 2 years.",
        "_clck and _clsk: Microsoft Clarity, analytics. 1 year and 1 day.",
      ],
    },
    rights: {
      title: "Your rights",
      body: ["Under the LGPD (art. 18), free of charge, you can:"],
      items: [
        "know whether I hold data about you and see it;",
        "correct anything that is wrong;",
        "ask for it to be deleted;",
        "know who it was shared with;",
        "withdraw consent you gave.",
      ],
    },
    delete: {
      title: "How to delete your data",
      body: [
        "Send “please delete my data” to {email} or on the same WhatsApp chat we used. I delete the messages and confirm within 15 days.",
        "For analytics, decline cookies under Cookie preferences. If you also want what was already collected deleted, send me the value of your _ga cookie (your browser shows it under Site settings) and I will request deletion from Google and Microsoft.",
      ],
      items: [],
    },
    changes: {
      title: "Changes",
      body: [
        "If anything here changes, the date at the top changes with it. Any new service that collects data goes through the banner first.",
      ],
      items: [],
    },
  },

  og: {
    subtitle: "Software Engineering · UniCEUB · Brasília, Brazil",
  },
};
