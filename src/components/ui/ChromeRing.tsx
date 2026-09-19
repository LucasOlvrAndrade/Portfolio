/*
  A vitrine dos serviços: um anel de texto em blackletter, cromado, girando
  devagar num fundo preto. A referência é o tipo de arte de capa em que o
  nome roda em volta de um vazio, com metal líquido e um halo branco.

  É SVG, por isso a qualidade é a mesma em qualquer tela: o texto é vetor e
  o cromo é filtro. O anel gira por CSS (`.anel-gira`), mas o degradê de
  fill e as luzes do filtro ficam PARADOS no espaço do SVG, então as faixas
  de reflexo escorrem pelas letras enquanto elas passam. É esse detalhe que
  faz parecer metal e não um PNG rodando.

  Como o cromo é montado, de baixo para cima:
  1. halo: alpha do texto borrado, branco, em duas camadas (justa e larga);
  2. o texto com fill em degradê de faixas (branco, cinza, quase preto),
     que é a paisagem que um metal polido refletiria;
  3. duas luzes especulares em cima de um relevo (alpha borrado fino), uma
     branca forte de cima à esquerda e uma fria de baixo à direita: o bisel.

  A fonte entra por `next/font` (UnifrakturMaguntia) como variável CSS, no
  layout, e o `<text>` a chama pelo nome.
*/

export function ChromeRing({ text, className = "" }: { text: string; className?: string }) {
  // O texto repete até fechar o círculo; o `textLength` estica ou aperta o
  // espaçamento para a emenda cair exata, sem buraco nem sobreposição.
  const raio = 185;
  const comprimento = Math.round(2 * Math.PI * raio);
  return (
    <div className={`anel ${className}`} aria-hidden>
      <svg viewBox="-260 -260 520 520" className="h-full w-full" role="img">
        <defs>
          <path id="anel-caminho" d={`M 0 ${-raio} A ${raio} ${raio} 0 1 1 0 ${raio} A ${raio} ${raio} 0 1 1 0 ${-raio}`} />
          <linearGradient id="anel-cromo" gradientUnits="userSpaceOnUse" x1="-120" y1="-260" x2="120" y2="260">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.14" stopColor="#8f949c" />
            <stop offset="0.26" stopColor="#ffffff" />
            <stop offset="0.38" stopColor="#2a2c33" />
            <stop offset="0.47" stopColor="#e6e9ee" />
            <stop offset="0.58" stopColor="#6a6e78" />
            <stop offset="0.7" stopColor="#ffffff" />
            <stop offset="0.84" stopColor="#5a5e66" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
          <filter id="anel-filtro" filterUnits="userSpaceOnUse" x="-260" y="-260" width="520" height="520" colorInterpolationFilters="sRGB">
            {/* Dois halos: um justo e forte, um largo e tênue. Um só fica ou
                duro demais ou cinza demais. */}
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="haloJustoA" />
            <feFlood floodColor="#ffffff" floodOpacity="0.45" result="branco" />
            <feComposite in="branco" in2="haloJustoA" operator="in" result="haloJusto" />
            <feGaussianBlur in="SourceAlpha" stdDeviation="16" result="haloLargoA" />
            <feFlood floodColor="#ffffff" floodOpacity="0.35" result="brancoTenue" />
            <feComposite in="brancoTenue" in2="haloLargoA" operator="in" result="haloLargo" />

            <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="relevo" />
            <feSpecularLighting in="relevo" surfaceScale="12" specularConstant="1.9" specularExponent="20" lightingColor="#ffffff" result="luz1">
              <fePointLight x="-230" y="-280" z="260" />
            </feSpecularLighting>
            <feSpecularLighting in="relevo" surfaceScale="12" specularConstant="1.1" specularExponent="30" lightingColor="#dbe6ff" result="luz2">
              <fePointLight x="250" y="230" z="200" />
            </feSpecularLighting>
            <feComposite in="luz1" in2="luz2" operator="arithmetic" k2="1" k3="1" result="luz" />
            <feComposite in="luz" in2="SourceAlpha" operator="in" result="luzNoTexto" />
            <feComposite in="SourceGraphic" in2="luzNoTexto" operator="arithmetic" k2="1" k3="1" result="metal" />

            <feMerge>
              <feMergeNode in="haloLargo" />
              <feMergeNode in="haloJusto" />
              <feMergeNode in="metal" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#anel-filtro)">
          <g className="anel-gira">
            <text
              fill="url(#anel-cromo)"
              stroke="#000"
              strokeWidth="0.8"
              paintOrder="stroke"
              fontSize="60"
              style={{ fontFamily: "var(--font-gotica), 'UnifrakturMaguntia', serif" }}
            >
              <textPath href="#anel-caminho" textLength={comprimento} lengthAdjust="spacing">
                {text}
              </textPath>
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
