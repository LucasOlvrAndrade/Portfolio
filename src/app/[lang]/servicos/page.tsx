import { redirect } from "next/navigation";

import { getI18n } from "@/i18n";
import { sectionAnchor } from "@/i18n/routes";

/** Desvia para a seção na página vertical. Ver `sobre/page.tsx`. */
export default async function ServicesPage() {
  const { locale } = await getI18n();
  redirect(sectionAnchor(locale, "services"));
}
