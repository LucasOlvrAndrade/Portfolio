"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";

import {
  clearTrackerCookies,
  getConsentServerSnapshot,
  getConsentSnapshot,
  subscribeConsent,
} from "@/lib/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

/**
 * GA e Clarity, só depois do aceite.
 *
 * Os dois só entram quando o ID está no ambiente, então o site roda limpo
 * sem eles (dev, fork, preview). IDs de GA e Clarity são públicos por
 * natureza; o NEXT_PUBLIC_ é de propósito.
 *
 * Antes do aceite o script nem chega ao documento: não há cookie, nem
 * requisição ao Google ou à Microsoft. O Consent Mode vai junto
 * (padrão "denied", atualizado para "granted") para o GA registrar que
 * a coleta foi consentida.
 */
export function Analytics() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  // Recusado: nenhum cookie de estatística pode sobrar de uma visita em
  // que o aceite ainda valia.
  useEffect(() => {
    if (consent === "denied") clearTrackerCookies();
  }, [consent]);

  if (consent !== "granted") return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script id="ga-consent" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
gtag('consent', 'update', {analytics_storage: 'granted'});
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
        </>
      )}
      {/*
        O id do Script NÃO pode ser "clarity": elemento com id vira global
        (`window.clarity` seria o <script>), o trecho de início acha que
        já existe e a tag do Clarity quebra com "is not a function".
      */}
      {CLARITY_ID && (
        <Script id="clarity-tag" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","${CLARITY_ID}");
window.clarity('consent');`}
        </Script>
      )}
    </>
  );
}
