import { notFound } from "next/navigation";

import { Contact } from "@/components/sections/Contact";
import { isLocale } from "@/i18n/config";
import { sectionMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contato">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return sectionMetadata(lang, "contact");
}

export default function ContactPage() {
  return <Contact />;
}
