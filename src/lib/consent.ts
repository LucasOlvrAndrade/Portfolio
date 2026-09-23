/**
 * Consentimento de cookies: a única fonte de verdade é um cookie próprio.
 *
 * Cookie, e não localStorage, porque é ele que a política declara e é o que
 * o visitante encontra ao apagar "cookies do site" no navegador: apagou,
 * o banner volta a perguntar.
 *
 * Só há uma categoria além dos necessários (estatística: GA e Clarity), e
 * por isso a escolha é binária. Um pixel de propaganda que entre um dia
 * pede uma categoria própria, e não uma carona nesta.
 */

export type Consent = "granted" | "denied";

const COOKIE = "consent";
/** Seis meses: depois disso o banner pergunta de novo. */
const MAX_AGE = 60 * 60 * 24 * 180;
const CHANGE_EVENT = "consent-change";
const OPEN_EVENT = "consent-open";

/** Cookies que o GA e o Clarity gravam, para apagar quando o aceite é retirado. */
const TRACKER_COOKIE = /^(_ga|_gid|_gat|_clck|_clsk|CLID)/;

function readConsent(): Consent | null {
  const match = document.cookie.match(/(?:^|; )consent=(granted|denied)(?:;|$)/);
  return match ? (match[1] as Consent) : null;
}

/** Para `useSyncExternalStore`: a escolha atual, ou "unset" se não houve. */
export function getConsentSnapshot(): Consent | "unset" {
  return readConsent() ?? "unset";
}

/** No servidor a escolha é desconhecida: nada de banner nem de rastreador. */
export function getConsentServerSnapshot(): null {
  return null;
}

export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/**
 * Apaga os cookies do GA e do Clarity gravados no domínio do site.
 *
 * Os que o Clarity grava no domínio da Microsoft (MUID, CLID...) ficam fora
 * de alcance: JavaScript só apaga cookie do próprio domínio. A política diz
 * isso ao visitante.
 */
export function clearTrackerCookies() {
  const host = location.hostname;
  const domains = ["", host, `.${host.replace(/^www\./, "")}`];
  for (const pair of document.cookie.split("; ")) {
    const name = pair.split("=")[0];
    if (!TRACKER_COOKIE.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ""}`;
    }
  }
}

export function saveConsent(value: Consent) {
  const previous = readConsent();
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;

  if (previous === "granted" && value === "denied") {
    // Script já executado não se descarrega: apaga o que ele gravou e
    // recarrega, para a página voltar sem GA nem Clarity. O GA ainda
    // regrava cookie enquanto a página descarrega; <Analytics> apaga de
    // novo na volta.
    clearTrackerCookies();
    location.reload();
    return;
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** "Preferências de cookies" no rodapé: reabre o banner. */
export function openConsentPreferences() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function subscribeOpenRequest(onOpen: () => void): () => void {
  window.addEventListener(OPEN_EVENT, onOpen);
  return () => window.removeEventListener(OPEN_EVENT, onOpen);
}
