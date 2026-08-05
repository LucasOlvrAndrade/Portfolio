import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/config/site";

type Link = {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
};

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-[18px]",
  "aria-hidden": true,
};

export function Contact() {
  const links: Link[] = [
    {
      label: "Email",
      value: siteConfig.contact.email,
      href: `mailto:${siteConfig.contact.email}`,
      icon: (
        <svg {...iconProps}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m2 7 10 6 10-6" />
        </svg>
      ),
    },
    {
      label: "GitHub",
      value: `@${siteConfig.githubUser}`,
      href: `https://github.com/${siteConfig.githubUser}`,
      icon: (
        <svg {...iconProps} fill="currentColor" stroke="none">
          <path d="M12 2A10 10 0 0 0 8.84 21.5c.5.08.66-.23.66-.5v-1.69C6.73 19.91 6.14 18 6.14 18a2.7 2.7 0 0 0-1.13-1.49c-.91-.62.07-.6.07-.6a2.14 2.14 0 0 1 1.57 1.05 2.18 2.18 0 0 0 2.97.84c.04-.5.24-.85.44-1.05-2.23-.25-4.57-1.11-4.57-4.95a3.87 3.87 0 0 1 1.03-2.69 3.6 3.6 0 0 1 .1-2.65s.84-.27 2.75 1.03a9.4 9.4 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03a3.6 3.6 0 0 1 .1 2.65 3.87 3.87 0 0 1 1.03 2.69c0 3.85-2.34 4.7-4.57 4.95.24.21.45.62.45 1.25v1.85c0 .27.16.59.67.5A10 10 0 0 0 12 2Z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      value: "Lucas Andrade",
      href: siteConfig.contact.linkedin,
      icon: (
        <svg {...iconProps} fill="currentColor" stroke="none">
          <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3zM10 9h3.8v1.64h.05a4.17 4.17 0 0 1 3.75-2.06c4 0 4.75 2.64 4.75 6.07V21h-4v-5.5c0-1.31-.03-3-1.83-3s-2.11 1.43-2.11 2.9V21h-4Z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      value: "@lucxsolvr",
      href: siteConfig.contact.instagram,
      icon: (
        <svg {...iconProps}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.5 6.5h.01" />
        </svg>
      ),
    },
  ];

  return (
    <Section
      id="contato"
      eyebrow="Contato"
      title="Vamos conversar"
      description="Aberto a projetos e trocas sobre tecnologia."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {links.map((link, index) => {
          const isExternal = !link.href.startsWith("mailto:");

          return (
            <Reveal as="li" key={link.label} delay={index * 70}>
              <a
                href={link.href}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/60"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted transition-colors group-hover:text-accent">
                  {link.icon}
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-xs uppercase tracking-[0.15em] text-muted">
                    {link.label}
                  </span>
                  <span className="mt-1 block truncate text-sm text-text transition-colors group-hover:text-accent">
                    {link.value}
                  </span>
                </span>
              </a>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
