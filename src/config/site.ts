/**
 * Configuração do site.
 *
 * Este é o ÚNICO arquivo que precisa ser editado no dia a dia — e só
 * quando você quiser destacar ou esconder algo específico. Repositórios
 * novos aparecem automaticamente via API, sem tocar em código.
 */

export const siteConfig = {
  /** Username do GitHub. Vem do env, com fallback para não quebrar o build. */
  githubUser: process.env.NEXT_PUBLIC_GITHUB_USER ?? "LucasOlvrAndrade",

  /** Usado em metadata/SEO. Ajuste após definir o domínio final. */
  url: "https://lucasolvrandrade.vercel.app",

  /** Exibido no Hero, abaixo do nome. */
  role: "Desenvolvedor em formação",

  contact: {
    email: "lucasolvrandrade@gmail.com",
    linkedin: "https://www.linkedin.com/in/lucas-andrade-93b3273b3/",
    instagram: "https://instagram.com/lucxsolvr",
  },

  /**
   * Repositórios destacados — aparecem primeiro, com card maior.
   * Basta adicionar o nome exato do repo. Ex.: ["Calculadora-java"]
   */
  featured: [] as string[],

  /**
   * Repositórios ocultos, além dos forks e arquivados (escondidos por padrão).
   * O repo de perfil entra aqui porque é o README do GitHub, não um projeto.
   */
  hidden: ["lucasolvrandrade"] as string[],

  /**
   * Skills exibidas na seção "Tecnologias".
   * Vêm do seu README de perfil — não das linguagens dos repositórios,
   * que hoje estão majoritariamente nulas na API.
   */
  skills: [
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
} as const;

export type SiteConfig = typeof siteConfig;
