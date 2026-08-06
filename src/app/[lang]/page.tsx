import { Hero } from "@/components/sections/Hero";
import { LegacyHashRedirect } from "@/components/ui/LegacyHashRedirect";
import { getI18n } from "@/i18n";
import { legacyHashTargets } from "@/i18n/routes";
import { getProfile } from "@/lib/github";

/**
 * A página é pré-renderizada e revalidada de hora em hora (ISR).
 * A API do GitHub é consultada ~1x/hora no total, não 1x por visitante.
 */
export const revalidate = 3600;

export default async function Home() {
  const { locale } = await getI18n();

  const profileResult = await getProfile();
  const profile = profileResult.ok ? profileResult.data : null;

  return (
    <>
      {/* Quem chegar por um link antigo (`/#projetos`) segue daqui. */}
      <LegacyHashRedirect targets={legacyHashTargets(locale)} />
      <Hero profile={profile} />
    </>
  );
}
