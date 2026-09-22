"use client";

import { useEffect, useRef } from "react";

/**
 * A abertura: a marca do site desenhada em estrelas.
 *
 * Duas cenas vieram antes desta. Um globo terrestre com rotas entre
 * continentes, que era da referência e não dele: rota de Brasília para
 * Tóquio diz algo sobre uma transportadora e nada sobre quem escreve
 * software. E uma constelação dos repositórios, que era sobre ele e
 * ainda assim perdeu para a marca.
 *
 * Cada ponto é uma estrela: núcleo claro com halo em volta, tamanho
 * próprio e um cintilar fora de fase com os vizinhos. A versão anterior
 * desenhava quadrados de três pixels, e o que se via era uma malha de
 * pixels grandes — o desenho aparecia, o encanto não.
 *
 * O giro é solto e vem da referência do fone: a marca tomba e vira ao
 * mesmo tempo, em dois eixos quase perpendiculares e em velocidades
 * diferentes, enquanto flutua e se aproxima. A rolagem dá impulso e ela
 * segue girando por inércia — presa ao ângulo da rolagem, pararia junto
 * com o dedo e pareceria manivela.
 *
 * Canvas 2D e não WebGL, pelo terceiro motivo igual: são pontos, sem
 * material, sem luz e sem sombra. Three.js custaria mais de 600 KB para
 * projetar vetores que cabem em trinta linhas.
 */

/** Largura da amostragem da logo. */
const GRADE = 240;
/*
  Uma estrela a cada três pixels da amostra. Espaçamento é o que
  distingue céu de textura: encostadas, as estrelas viram mancha, e a
  marca perde o desenho que elas deviam formar.
*/
const PASSO = 3;
/** Espessura da placa, em unidades da própria logo. */
const ESPESSURA = 0.1;
/** Quanto da menor dimensão da tela a marca ocupa. */
const TAMANHO = 0.6;

/*
  Dois eixos de giro, e é daí que vem o movimento da referência.

  No vídeo do fone, o objeto não gira em torno de um eixo só: ele tomba
  e vira ao mesmo tempo, devagar, e a pose nunca se repete. Isso não se
  consegue com um eixo — por mais inclinado que esteja, um eixo único dá
  volta e volta ao mesmo lugar, e o olho percebe o ciclo.

  Com dois eixos quase perpendiculares girando em velocidades
  diferentes, a composição só se repetiria depois de um tempo longo. O
  segundo anda a 38% do primeiro, número escolhido por não ser fração
  redonda do outro: 1/2 ou 1/3 voltariam a coincidir rápido.
*/
const EIXO_A = { x: 0.3817, y: 0.9241, z: 0 };
const EIXO_B = { x: 0.9214, y: -0.3005, z: 0.2504 };
/** Quanto o segundo eixo anda em relação ao primeiro. */
const RITMO_B = 0.38;

type Estrela = {
  /** Posição na placa: x e y do desenho, z da espessura. */
  x: number;
  y: number;
  z: number;
  laranja: boolean;
  /** Raio em pixels, antes da perspectiva. */
  raio: number;
  /** Fase do cintilar, para as vizinhas não piscarem juntas. */
  fase: number;
  /** Deslocamento momentâneo, de quando o cursor empurra. */
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  /** Direção de onde vem na montagem. */
  s1: number;
  s2: number;
};

/** Hex para os três canais, para compor rgba com alpha variável. */
function paraRgb(hex: string): [number, number, number] {
  const limpo = hex.replace("#", "").trim();
  const completo =
    limpo.length === 3
      ? limpo
          .split("")
          .map((c) => c + c)
          .join("")
      : limpo;
  const n = Number.parseInt(completo.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function LogoScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let estrelas: Estrela[] = [];
    let largura = 0;
    let altura = 0;
    let dpr = 1;
    let quadro = 0;
    let vivo = false;
    let ultimo = performance.now();
    let relogio = 0;
    /** 0 a 1, contada em tempo: a cena existe antes de qualquer gesto. */
    let montagem = 0;
    /** 0 a 1: onde a rolagem está dentro da seção da cena. */
    let avanco = 0;
    let avancoAnterior = 0;
    /** Ângulo acumulado e a velocidade que a rolagem empurra. */
    let ang = 0;
    let velAng = 0;
    let mx = -9999;
    let my = -9999;

    let corTexto = "#fafaf9";
    let corAcento = "#fb923c";
    /** Sprites de estrela, um por cor, redesenhados na troca de tema. */
    let brilhoClaro: HTMLCanvasElement | null = null;
    let brilhoAcento: HTMLCanvasElement | null = null;

    /*
      Cada estrela é um sprite desenhado UMA vez e reaproveitado. Um
      gradiente radial por estrela a cada quadro seriam mil e quatrocentos
      gradientes por desenho, o que derruba o quadro sozinho; o sprite
      custa um `drawImage`, que a GPU resolve.
    */
    const fazerBrilho = (hex: string) => {
      const lado = 32;
      const c = document.createElement("canvas");
      c.width = lado;
      c.height = lado;
      const g = c.getContext("2d");
      if (!g) return null;

      const [r, v, b] = paraRgb(hex);
      const meio = lado / 2;
      const grad = g.createRadialGradient(meio, meio, 0, meio, meio, meio);
      // Núcleo quase sólido e halo caindo rápido: é o perfil que o olho
      // lê como ponto de luz, e não como bolha.
      grad.addColorStop(0, `rgba(${r}, ${v}, ${b}, 1)`);
      grad.addColorStop(0.18, `rgba(${r}, ${v}, ${b}, 0.85)`);
      grad.addColorStop(0.45, `rgba(${r}, ${v}, ${b}, 0.22)`);
      grad.addColorStop(1, `rgba(${r}, ${v}, ${b}, 0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, lado, lado);
      return c;
    };

    const lerTema = () => {
      const estilo = getComputedStyle(document.documentElement);
      corTexto = estilo.getPropertyValue("--text").trim() || corTexto;
      corAcento = estilo.getPropertyValue("--accent").trim() || corAcento;
      brilhoClaro = fazerBrilho(corTexto);
      brilhoAcento = fazerBrilho(corAcento);
    };
    lerTema();

    /** Poeira de fundo: estrelas distantes, sem cintilar. */
    const poeira = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      a: 0.08 + Math.random() * 0.3,
      r: Math.random() < 0.2 ? 1.6 : 1,
    }));

    const medir = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = r.width;
      altura = r.height;
      canvas.width = Math.round(largura * dpr);
      canvas.height = Math.round(altura * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /*
      Rotação em torno de um eixo qualquer (fórmula de Rodrigues). Com o
      eixo vertical bastaria misturar x e z; com o eixo inclinado é
      preciso o caso geral, e ele cabe em seis linhas.
    */
    const girar = (
      p: { x: number; y: number; z: number },
      a: number,
      k: { x: number; y: number; z: number },
    ) => {
      const c = Math.cos(a);
      const s = Math.sin(a);
      const kv = k.x * p.x + k.y * p.y + k.z * p.z;
      return {
        x: p.x * c + (k.y * p.z - k.z * p.y) * s + k.x * kv * (1 - c),
        y: p.y * c + (k.z * p.x - k.x * p.z) * s + k.y * kv * (1 - c),
        z: p.z * c + (k.x * p.y - k.y * p.x) * s + k.z * kv * (1 - c),
      };
    };

    /* ── Desenho ─────────────────────────────────────────────── */
    const desenhar = () => {
      ctx.clearRect(0, 0, largura, altura);

      const cx = largura / 2;
      const cy = altura / 2;
      const base = Math.min(largura, altura) * TAMANHO;

      /*
        A rolagem tem duas fases. Até 65% do percurso ela impulsiona o
        giro; depois disso a marca estoura, e as estrelas saem pela borda
        da tela. O estouro é ao quadrado para acelerar no fim: linear,
        pareceria um zoom lento.
      */
      const fimDoGiro = 0.65;
      const estouro = Math.max(0, (avanco - fimDoGiro) / (1 - fimDoGiro));
      const solta = estouro * estouro;

      /*
        A marca também se aproxima conforme se rola, como o objeto da
        referência: 16% ao longo do percurso, antes do estouro. Giro sem
        variação de distância lê como peça montada num eixo; com a
        aproximação, lê como objeto num espaço.
      */
      const escala =
        base * (0.92 + montagem * 0.08) * (1 + avanco * 0.16) * (1 + estouro * 0.3);
      const opacidade = montagem * (1 - solta * 1.1);
      if (opacidade <= 0.01) return;

      /*
        E flutua. Dois senos de períodos diferentes, amplitude de 2,5% da
        tela: pouco o bastante para não parecer que a marca está solta na
        página, e o suficiente para ela nunca estar exatamente no mesmo
        lugar duas vezes.
      */
      const boiaX = Math.sin(relogio / 5200) * base * 0.025;
      const boiaY = Math.sin(relogio / 3900 + 1.2) * base * 0.025;

      for (const p of poeira) {
        ctx.globalAlpha = p.a * opacidade * 0.7;
        ctx.fillStyle = corTexto;
        ctx.fillRect(p.x * largura, p.y * altura, p.r, p.r);
      }

      /*
        Atmosfera: um halo quente atrás da marca. No globo eram duas
        luzes, fria na borda e quente no topo, porque lá havia um corpo
        esférico para modelar. Aqui é uma placa: a segunda luz não teria
        o que revelar e viraria mancha.
      */
      const halo = ctx.createRadialGradient(
        cx,
        cy,
        escala * 0.1,
        cx,
        cy,
        escala * 1.25,
      );
      halo.addColorStop(0, `rgba(251, 146, 60, ${0.16 * opacidade})`);
      halo.addColorStop(1, "rgba(251, 146, 60, 0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, escala * 1.25, 0, Math.PI * 2);
      ctx.fill();

      /*
        Somando em vez de cobrindo: onde duas estrelas se sobrepõem a luz
        se acumula, como em céu de verdade. É o que faz um aglomerado
        parecer mais brilhante que uma estrela sozinha.
      */
      ctx.globalCompositeOperation = "lighter";

      const chegando = 1 - montagem;

      for (const e of estrelas) {
        // Tomba e vira: um giro depois do outro, no mesmo quadro.
        const v = girar(girar(e, ang, EIXO_A), ang * RITMO_B, EIXO_B);

        // Perspectiva: o que está à frente vem maior; o que está atrás
        // encolhe. É daí que sai a leitura de volume.
        const persp = 1 / (1 - v.z * 0.25);

        /*
          No estouro as estrelas saem DO CENTRO PARA FORA: a direção é a
          do próprio ponto em relação ao meio da marca, com a semente
          entrando só como desvio. Direção sorteada faria a marca se
          dissolver, não explodir.
        */
        const dirX = v.x * 2 + e.s1 * 0.35;
        const dirY = v.y * 2 + e.s2 * 0.35;

        const x =
          cx +
          boiaX +
          v.x * escala * persp +
          e.dx +
          e.s1 * chegando * largura * 0.55 +
          dirX * solta * largura * 0.9;
        const y =
          cy +
          boiaY +
          v.y * escala * persp +
          e.dy +
          e.s2 * chegando * altura * 0.55 +
          dirY * solta * altura * 0.9;

        // Cintilar lento e fraco. Forte, a marca pisca; ausente, o céu
        // vira adesivo.
        const cintila = 0.82 + 0.18 * Math.sin(relogio / 900 + e.fase);
        const frente = (v.z / (ESPESSURA / 2) + 1) / 2;
        const brilho = opacidade * cintila * (0.55 + frente * 0.45);
        if (brilho <= 0.02) continue;

        const r = e.raio * persp;
        const sprite = e.laranja ? brilhoAcento : brilhoClaro;
        if (!sprite) continue;

        ctx.globalAlpha = Math.min(1, brilho);
        ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    };

    const passo = (t: number) => {
      if (!vivo) {
        quadro = 0;
        return;
      }
      const dt = Math.min(64, t - ultimo);
      ultimo = t;
      relogio += dt;

      if (montagem < 1) montagem = Math.min(1, montagem + dt / 1400);

      /*
        Giro solto. A rolagem não define o ângulo, ela EMPURRA: cada
        pedaço rolado vira velocidade, que decai por atrito. Preso ao
        ângulo, o giro parava junto com o dedo e parecia manivela; assim
        ele continua e desacelera sozinho.

        O impulso é calibrado, e não chutado. Com atrito de 0,96, a
        velocidade em regime é o impulso dividido por 0,04, então o giro
        total de uma rolagem completa da seção vale 25 vezes a constante.
        Em 0,14, isso dá pouco mais de meia volta do começo ao fim do
        percurso — antes estava em 2,4, ou seja, dez voltas, e era isso
        o "rápido demais". O valor caiu de novo quando a seção encurtou
        de três telas para duas: o mesmo giro em metade da rolagem
        voltaria a parecer apressado.
      */
      const delta = avanco - avancoAnterior;
      avancoAnterior = avanco;
      velAng += delta * 0.14;
      velAng *= 0.96;

      /*
        No topo a marca fica EM PÉ. A deriva constante só entra depois
        que a rolagem começou, com uma rampa curta: quem abre o site vê
        a logo de frente, parada, cintilando — que é como uma marca deve
        se apresentar. O giro é consequência do gesto, não estado
        natural da página.
      */
      const acordou = Math.min(1, avanco / 0.12);
      ang += velAng + acordou * dt * 0.00004;

      /*
        O cursor empurra as estrelas que passam perto, e elas voltam por
        mola. O deslocamento é guardado à parte da posição na placa: a
        estrela continua onde está no desenho, o que muda é onde ela
        aparece.
      */
      const cx = largura / 2;
      const cy = altura / 2;
      const escala = Math.min(largura, altura) * TAMANHO;
      const raio = 110;

      for (const e of estrelas) {
        const px = cx + e.x * escala + e.dx;
        const py = cy + e.y * escala + e.dy;
        const dx = px - mx;
        const dy = py - my;
        const d2 = dx * dx + dy * dy;

        if (d2 < raio * raio) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / raio) * 2.2;
          e.vx += (dx / d) * f;
          e.vy += (dy / d) * f;
        }

        e.vx += -e.dx * 0.07;
        e.vy += -e.dy * 0.07;
        e.vx *= 0.86;
        e.vy *= 0.86;
        e.dx += e.vx;
        e.dy += e.vy;
      }

      desenhar();
      quadro = requestAnimationFrame(passo);
    };

    const ligar = () => {
      if (!quadro) {
        ultimo = performance.now();
        quadro = requestAnimationFrame(passo);
      }
    };

    /* ── Amostragem ──────────────────────────────────────────── */
    const img = new Image();
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = GRADE;
      off.height = Math.round((img.height / img.width) * GRADE);
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(img, 0, 0, off.width, off.height);
      const { data } = octx.getImageData(0, 0, off.width, off.height);

      const aceso = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= off.width || y >= off.height) return false;
        const i = (y * off.width + x) * 4;
        if (data[i + 3] < 40) return false;
        // O fundo da logo é preto: luminância baixa não vira estrela. É
        // o que recorta o "L" sem precisar de máscara.
        const lum =
          (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
        return lum >= 0.22;
      };

      for (let y = 0; y < off.height; y += PASSO) {
        for (let x = 0; x < off.width; x += PASSO) {
          if (!aceso(x, y)) continue;
          const i = (y * off.width + x) * 4;

          // Contorno: pixel aceso com vizinho apagado. A estrela da
          // borda nasce maior, e é ela que sustenta a silhueta do "L".
          const borda =
            !aceso(x - PASSO, y) ||
            !aceso(x + PASSO, y) ||
            !aceso(x, y - PASSO) ||
            !aceso(x, y + PASSO);

          /*
            Tamanhos desiguais, e a desigualdade é o ponto: um céu com
            estrelas todas do mesmo tamanho é uma grade. Uma em cada doze
            nasce grande.
          */
          const sorte = Math.random();
          const raio = borda
            ? 3.4 + sorte * 1.6
            : sorte < 0.08
              ? 3.6
              : 1.7 + sorte * 1.3;

          estrelas.push({
            x: x / off.width - 0.5,
            y: y / off.height - 0.5,
            // A espessura é sorteada por estrela: com z fixo a placa
            // vira folha e a rotação não tem o que revelar.
            z: (Math.random() - 0.5) * ESPESSURA,
            /*
              A cor sai da distância entre vermelho e azul, não de
              limiares por canal. O chanfro é desenhado com antialias, e
              o pixel de borda é mistura de laranja com branco: claro o
              bastante para passar num teste de "vermelho alto, azul
              baixo" e cair no branco, salpicando a área laranja.
            */
            laranja: data[i] - data[i + 2] > 28,
            raio,
            fase: Math.random() * Math.PI * 2,
            dx: 0,
            dy: 0,
            vx: 0,
            vy: 0,
            s1: Math.random() * 2 - 1,
            s2: Math.random() * 2 - 1,
          });
        }
      }

      /*
        A marca é reenquadrada pelo próprio retângulo. O arquivo tem
        bastante preto em volta do "L", e sem isto a escala se aplica à
        imagem inteira: a cena fica com um quarto da tela ocupado e três
        quartos de margem invisível.
      */
      if (estrelas.length) {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const e of estrelas) {
          if (e.x < minX) minX = e.x;
          if (e.x > maxX) maxX = e.x;
          if (e.y < minY) minY = e.y;
          if (e.y > maxY) maxY = e.y;
        }
        // Um fator só para os dois eixos, senão o "L" estica.
        const fator = 1 / Math.max(maxX - minX, maxY - minY);
        const meioX = (minX + maxX) / 2;
        const meioY = (minY + maxY) / 2;
        for (const e of estrelas) {
          e.x = (e.x - meioX) * fator;
          e.y = (e.y - meioY) * fator;
        }
      }

      medir();
      if (calmo) {
        // Sem movimento: a marca aparece montada e fica.
        montagem = 1;
        desenhar();
        return;
      }
      ligar();
    };
    img.src = "/logo.webp";

    /* ── Entradas ────────────────────────────────────────────── */
    const aoMover = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };

    const aoRolar = () => {
      const secao = canvas.closest(".intro");
      if (!secao) return;
      const r = secao.getBoundingClientRect();
      const curso = r.height - window.innerHeight;
      avanco = curso > 0 ? Math.min(1, Math.max(0, -r.top / curso)) : 0;
    };

    const aoRedimensionar = () => medir();

    window.addEventListener("pointermove", aoMover, { passive: true });
    // `capture` porque em telas grandes quem rola é o `.app-main`, e
    // evento de rolagem não borbulha.
    window.addEventListener("scroll", aoRolar, { passive: true, capture: true });
    window.addEventListener("resize", aoRedimensionar);
    aoRolar();
    avancoAnterior = avanco;

    const obs = new IntersectionObserver(
      ([e]) => {
        vivo = e.isIntersecting && !calmo;
        if (vivo) ligar();
      },
      { threshold: 0 },
    );
    obs.observe(canvas);

    const tema = new MutationObserver(lerTema);
    tema.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      if (quadro) cancelAnimationFrame(quadro);
      window.removeEventListener("pointermove", aoMover);
      window.removeEventListener("scroll", aoRolar, { capture: true });
      window.removeEventListener("resize", aoRedimensionar);
      obs.disconnect();
      tema.disconnect();
      img.onload = null;
      estrelas = [];
    };
  }, []);

  return <canvas ref={ref} className="cena-canvas" aria-hidden="true" />;
}
