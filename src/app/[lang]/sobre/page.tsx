import { notFound } from "next/navigation";

import { About } from "@/components/sections/About";
import { getI18n } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { getProfile, getProfileReadme } from "@/lib/github";
import { sectionMetadata } from "@/lib/metadata";
import { parseProfileReadme } from "@/lib/readme";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/sobre">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return sectionMetadata(lang, "about");
}

export default async function AboutPage() {
  const { locale } = await getI18n();

  // Perfil e README são independentes — buscados em paralelo. As duas
  // respostas ficam no cache de `fetch`, então a home não as pede de novo.
  const [profileResult, readmeResult] = await Promise.all([
    getProfile(),
    getProfileReadme(locale),
  ]);

  const profile = profileResult.ok ? profileResult.data : null;
  const readme = readmeResult.ok ? readmeResult.data : null;
  const sections = readme ? parseProfileReadme(readme.markdown) : [];

  return (
    <About
      sections={sections}
      bio={profile?.bio ?? null}
      // Sem README nenhum não há o que avisar: o aviso é sobre idioma,
      // não sobre ausência de conteúdo.
      localized={readme?.localized ?? true}
    />
  );
}
