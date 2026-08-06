import { notFound } from "next/navigation";

import { Skills } from "@/components/sections/Skills";
import { isLocale } from "@/i18n/config";
import { sectionMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/tecnologias">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return sectionMetadata(lang, "skills");
}

export default function SkillsPage() {
  return <Skills />;
}
