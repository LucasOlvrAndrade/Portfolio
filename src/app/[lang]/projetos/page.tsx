import { redirect } from "next/navigation";

import { getI18n } from "@/i18n";
import { sectionAnchor } from "@/i18n/routes";

/**
 * Desvia para a seção na página vertical. Ver `sobre/page.tsx` para o
 * porquê de 307 e não 308.
 *
 * Isto NÃO afeta `projetos/[nome]`: um `page.tsx` responde apenas pelo
 * caminho exato do próprio segmento, e a página de cada projeto segue
 * resolvendo por conta própria.
 */
export default async function ProjectsPage() {
  const { locale } = await getI18n();
  redirect(sectionAnchor(locale, "projects"));
}
