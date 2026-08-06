"use client";

import { usePathname } from "next/navigation";

import { fill, locales, localeMeta, type Locale } from "@/i18n/config";
import { translatePath } from "@/i18n/routes";

type LocaleToggleProps = {
  locale: Locale;
  /**
   * Só strings: este componente é cliente, e função não atravessa a
   * fronteira servidor/cliente.
   */
  labels: {
    group: string;
    switchTo: string;
    current: string;
  };
};

/**
 * Troca de idioma, em pílula, ao lado do controle de tema.
 *
 * São links, não botões: trocar de idioma muda a URL, e cada idioma tem
 * uma página própria e indexável. Com links, o "abrir em nova aba" do
 * navegador funciona, e o buscador enxerga as duas versões. Um botão
 * daria o mesmo efeito visual e nada disso.
 *
 * E são `<a>`, não `<Link>`, de propósito. `[lang]` é o segmento ACIMA
 * do layout raiz: trocar de idioma por navegação de cliente faria o
 * React re-renderizar o `<html>` inteiro, incluindo o script de tema do
 * `<head>` — que o React nunca executa no cliente, e sobre o qual ele
 * avisa no console. Uma navegação de documento inteiro evita isso, e é
 * o que corresponde ao que de fato muda: o idioma do documento, seus
 * metadados e o `lang` do `<html>`. O custo é um carregamento por troca,
 * uma vez por visita.
 *
 * A pílula aqui não usa mola, ao contrário da navegação: são duas
 * posições fixas e de mesma largura, então uma transição de `transform`
 * basta — e não custa um loop de animação no cabeçalho.
 */
export function LocaleToggle({ locale, labels }: LocaleToggleProps) {
  const pathname = usePathname();
  const index = locales.indexOf(locale);

  return (
    <div
      role="group"
      aria-label={labels.group}
      className="nav-track relative flex items-center rounded-full border border-border bg-surface-2 p-1"
    >
      {/*
        Decorativa. Quem informa o idioma ativo à tecnologia assistiva é
        o `aria-current` do link — este elemento não existe para ela.

        `left-1` e `w-[calc(50%-0.25rem)]` são o `p-1` da trilha: a
        pílula ocupa exatamente a metade útil, e deslocar 100% da própria
        largura a leva à posição do segundo item.
      */}
      <span
        aria-hidden="true"
        style={{ transform: `translate3d(${index * 100}%, 0, 0)` }}
        className="nav-pill pointer-events-none absolute left-1 top-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-full bg-surface transition-transform duration-300 ease-out motion-reduce:transition-none"
      />

      {locales.map((item) => {
        const meta = localeMeta[item];
        const isActive = item === locale;

        return (
          <a
            key={item}
            href={translatePath(pathname, item)}
            hrefLang={meta.html}
            aria-current={isActive ? "true" : undefined}
            /*
              "PT" e "EN" são claros na tela e opacos no leitor de tela.
              O rótulo acessível diz o nome do idioma por extenso.
            */
            aria-label={fill(isActive ? labels.current : labels.switchTo, {
              language: meta.label,
            })}
            title={
              isActive
                ? undefined
                : fill(labels.switchTo, { language: meta.label })
            }
            className={`nav-item relative z-[1] w-9 rounded-full py-1.5 text-center font-mono text-[13px] md:text-sm ${
              isActive ? "text-text" : "text-muted hover:text-accent"
            }`}
          >
            {meta.short}
          </a>
        );
      })}
    </div>
  );
}
