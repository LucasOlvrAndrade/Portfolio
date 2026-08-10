import { redirect } from "next/navigation";

import { getI18n } from "@/i18n";
import { sectionAnchor } from "@/i18n/routes";

/**
 * A seção voltou a viver na página vertical. A rota permanece só para
 * não quebrar links já compartilhados.
 *
 * `redirect` (307), e não `permanentRedirect` (308), de propósito: o
 * navegador guarda um redirecionamento permanente com afinco, e quem
 * visitou uma vez continuaria sendo desviado mesmo depois de a rota
 * voltar a existir. Enquanto a decisão entre página única e rotas
 * puder ser revista, o desvio tem que ser revogável.
 *
 * O fragmento sobrevive ao desvio: ele viaja no cabeçalho `Location`,
 * que o navegador aplica ao chegar. É o único ponto do sistema em que
 * o servidor consegue tratar de uma âncora.
 */
export default async function AboutPage() {
  const { locale } = await getI18n();
  redirect(sectionAnchor(locale, "about"));
}
