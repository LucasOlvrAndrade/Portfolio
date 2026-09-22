"use client";

import { useEffect, useRef } from "react";

/**
 * A abertura: um globo de pontos girando, com rotas se desenhando.
 *
 * A sequência é longa e presa à rolagem, não a um temporizador. A
 * seção que abriga a cena tem três telas de altura e o conteúdo dentro
 * dela fica fixo: o que a rolagem faz é avançar a cena, não sair dela.
 * São três fases —
 *
 *   1. montagem: os pontos chegam de fora e assentam na esfera;
 *   2. operação: o globo gira e as rotas se traçam, uma a uma;
 *   3. saída: a esfera recua e se apaga, dando lugar ao conteúdo.
 *
 * Canvas 2D e não WebGL: são pontos e linhas sobre uma esfera, sem
 * material, sem luz e sem sombra. Three.js custaria mais de 600 KB
 * para projetar vetores que cabem em quarenta linhas de matemática.
 *
 * Os continentes vêm de dois arquivos gerados a partir do mapa-múndi:
 * `/terra.png`, máscara equiretangular de 6,7 KB que diz a cada ponto
 * da grade se ele caiu em terra ou no mar, e `/contornos.json`, 30 KB
 * com os anéis dos continentes para o traço por cima da casca.
 */

/** Passo da grade, em graus. Menor = mais pontos, mais custo. */
const PASSO = 2;
/** Inclinação do eixo, como no enquadramento da referência. */
const TILT = -0.38;

type Ponto = {
  /** Posição na esfera unitária. */
  x: number;
  y: number;
  z: number;
  /** De onde ele vem na montagem: a mesma direção, mais longe. */
  raio0: number;
  /** Continente ou oceano. O oceano existe, só que quase apagado: é
      ele que dá a casca completa, e a terra que dá o desenho. */
  terra: boolean;
};

type Lugar = { nome: string; lat: number; lon: number };

/*
  As pontas das rotas. Brasília primeiro porque é de onde ele trabalha,
  e as outras são destinos com fuso bem distribuído — o que importa é a
  rota cruzar a esfera de um lado ao outro, senão o arco não se vê.
*/
const LUGARES: Lugar[] = [
  { nome: "Brasília", lat: -15.79, lon: -47.88 },
  { nome: "Lisboa", lat: 38.72, lon: -9.14 },
  { nome: "Nova York", lat: 40.71, lon: -74.01 },
  { nome: "Londres", lat: 51.51, lon: -0.13 },
  { nome: "Tóquio", lat: 35.68, lon: 139.65 },
  { nome: "Sydney", lat: -33.87, lon: 151.21 },
];

/** Pares ligados por arco, por índice em LUGARES. */
const ROTAS: [number, number][] = [
  [0, 1],
  [0, 2],
  [3, 4],
  [2, 3],
  [0, 5],
];

const rad = (g: number) => (g * Math.PI) / 180;

/** Coordenada geográfica para vetor unitário. */
function paraVetor(lat: number, lon: number) {
  const a = rad(lat);
  const b = rad(lon);
  return {
    x: Math.cos(a) * Math.sin(b),
    y: Math.sin(a),
    z: Math.cos(a) * Math.cos(b),
  };
}

export function GlobeScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let pontos: Ponto[] = [];
    let largura = 0;
    let altura = 0;
    let dpr = 1;
    let quadro = 0;
    let vivo = false;
    let giro = 0;
    let ultimo = performance.now();
    /** 0 a 1: onde a rolagem está dentro da seção da cena. */
    let avanco = 0;

    /*
      Dez baldes de opacidade, reaproveitados quadro a quadro. São dez
      mil pontos por desenho: mudar `globalAlpha` a cada um custa mais
      que o desenho inteiro, e quantizar em dez níveis é indistinguível
      a olho. Os arrays nunca são recriados, só esvaziados — alocar dez
      mil números por quadro alimentaria o coletor de lixo e devolveria
      engasgo periódico.
    */
    const baldes: number[][] = Array.from({ length: 10 }, () => []);
    /** Anéis de continente, já em vetor unitário. */
    let contornos: { x: number; y: number; z: number }[][] = [];

    let corPonto = "#fafaf9";
    let corAcento = "#fb923c";

    const lerTema = () => {
      const estilo = getComputedStyle(document.documentElement);
      corPonto = estilo.getPropertyValue("--text").trim() || corPonto;
      corAcento = estilo.getPropertyValue("--accent").trim() || corAcento;
    };
    lerTema();

    /* ── Estrelas ────────────────────────────────────────────────
       Sorteadas uma vez e guardadas em coordenada relativa, para o
       redimensionamento não redesenhar um céu diferente a cada vez. */
    const estrelas = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      a: 0.12 + Math.random() * 0.4,
      r: Math.random() < 0.15 ? 1.4 : 0.9,
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

    /** Rotação em Y (o giro do planeta) e depois inclinação em X. */
    function girar(p: { x: number; y: number; z: number }, ang: number) {
      const cos = Math.cos(ang);
      const sen = Math.sin(ang);
      const x = p.x * cos - p.z * sen;
      const z = p.x * sen + p.z * cos;
      const cosT = Math.cos(TILT);
      const senT = Math.sin(TILT);
      return {
        x,
        y: p.y * cosT - z * senT,
        z: p.y * senT + z * cosT,
      };
    }

    /*
      Projeção com uma pitada de perspectiva. Sem ela a esfera lê como
      disco: é a diferença de escala entre o ponto da frente e o da
      borda que informa ao olho que aquilo tem volume.
    */
    const projetar = (
      v: { x: number; y: number; z: number },
      cx: number,
      cy: number,
      raio: number,
    ) => {
      const persp = 1 / (1.35 - v.z * 0.35);
      return { x: cx + v.x * raio * persp, y: cy - v.y * raio * persp, z: v.z };
    };

    /* ── Desenho ─────────────────────────────────────────────── */
    const desenhar = (t: number) => {
      ctx.clearRect(0, 0, largura, altura);

      const cx = largura / 2;
      const cy = altura / 2;
      const base = Math.min(largura, altura) * 0.36;

      /*
        A cena inteira responde ao avanço da rolagem: entra crescendo,
        opera no tamanho cheio e sai recuando. As três fases estão aqui,
        e não em classes de CSS, porque é o mesmo desenho o tempo todo —
        só o estado muda.
      */
      const entrada = Math.min(1, avanco / 0.18);
      const saida = Math.max(0, (avanco - 0.62) / 0.38);
      const escala = base * (0.82 + entrada * 0.18) * (1 - saida * 0.22);
      const opacidade = entrada * (1 - saida);

      if (opacidade <= 0.01) return;

      // Céu
      for (const e of estrelas) {
        ctx.globalAlpha = e.a * opacidade;
        ctx.fillStyle = corPonto;
        ctx.fillRect(e.x * largura, e.y * altura, e.r, e.r);
      }

      /*
        Atmosfera. Duas luzes, como na referência: uma fria envolvendo a
        borda inferior e uma quente raspando o topo. Elas vêm ANTES dos
        pontos para o planeta se recortar contra o brilho, em vez de
        flutuar sobre ele.
      */
      const halo = ctx.createRadialGradient(cx, cy, escala * 0.86, cx, cy, escala * 1.5);
      halo.addColorStop(0, "rgba(56, 130, 246, 0)");
      halo.addColorStop(0.45, `rgba(56, 130, 246, ${0.22 * opacidade})`);
      halo.addColorStop(1, "rgba(56, 130, 246, 0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, escala * 1.5, 0, Math.PI * 2);
      ctx.fill();

      const quente = ctx.createRadialGradient(
        cx,
        cy - escala * 0.72,
        escala * 0.1,
        cx,
        cy - escala * 0.72,
        escala * 0.95,
      );
      quente.addColorStop(0, `rgba(251, 146, 60, ${0.3 * opacidade})`);
      quente.addColorStop(1, "rgba(251, 146, 60, 0)");
      ctx.fillStyle = quente;
      ctx.beginPath();
      ctx.arc(cx, cy - escala * 0.72, escala * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // A casca de pontos
      const s = 2 / dpr;
      const naGrade = (v: number) => Math.round(v * dpr) / dpr;

      for (const balde of baldes) balde.length = 0;

      for (const p of pontos) {
        // Na montagem cada ponto vem de mais longe, na própria direção.
        const r = escala * (p.raio0 + (1 - p.raio0) * entrada);
        const v = girar(p, giro);
        const q = projetar(v, cx, cy, r);

        /*
          O hemisfério de trás continua visível, só que fraco: é o que
          faz a esfera ler como casca de pontos e não como disco pintado.
          E o oceano fica quase apagado: ele dá a esfera completa, a
          terra dá o desenho.
        */
        const frente = (v.z + 1) / 2;
        const forca = p.terra
          ? (0.16 + frente * 0.84) * (v.z > 0 ? 1 : 0.42)
          : (0.05 + frente * 0.12) * (v.z > 0 ? 1 : 0.5);

        const nivel = Math.min(9, Math.max(0, Math.round(forca * 9)));
        baldes[nivel].push(naGrade(q.x), naGrade(q.y));
      }

      ctx.fillStyle = corPonto;
      for (let n = 1; n < 10; n++) {
        const balde = baldes[n];
        if (!balde.length) continue;
        ctx.globalAlpha = opacidade * (n / 9);
        for (let i = 0; i < balde.length; i += 2) {
          ctx.fillRect(balde[i], balde[i + 1], s, s);
        }
      }

      /*
        O contorno dos continentes, um traço fino por cima da casca. Sem
        ele a esfera lê como nuvem de pontos; com ele, lê como mapa. Só
        a face voltada para nós é traçada, e o corte em z = 0,02 evita o
        risco que apareceria rasgando a silhueta na borda.

        Um `beginPath` para todos os anéis: 88 caminhos separados seriam
        88 chamadas de `stroke`, e o traço é o mesmo em todos.
      */
      if (contornos.length) {
        ctx.strokeStyle = corPonto;
        ctx.lineWidth = 0.9;
        ctx.globalAlpha = opacidade * 0.45;
        ctx.beginPath();
        for (const anel of contornos) {
          let caneta = false;
          for (const p of anel) {
            const v = girar(p, giro);
            if (v.z < 0.02) {
              caneta = false;
              continue;
            }
            const q = projetar(v, cx, cy, escala * 1.004);
            if (caneta) ctx.lineTo(q.x, q.y);
            else {
              ctx.moveTo(q.x, q.y);
              caneta = true;
            }
          }
        }
        ctx.stroke();
      }

      /* ── Rotas ──────────────────────────────────────────────
         Cada arco é um grande círculo entre duas cidades, elevado no
         meio do trajeto. Ele se traça do começo ao fim, descansa e
         recomeça, e só entra em cena depois que a fase de montagem
         terminou. */
      ROTAS.forEach(([ia, ib], i) => {
        const entra = 0.2 + i * 0.07;
        if (avanco < entra) return;

        const a = paraVetor(LUGARES[ia].lat, LUGARES[ia].lon);
        const b = paraVetor(LUGARES[ib].lat, LUGARES[ib].lon);

        // Ciclo próprio, desencontrado dos vizinhos.
        const ciclo = ((t / 4200 + i * 0.37) % 1 + 1) % 1;
        const traco = Math.min(1, ciclo / 0.55);
        if (traco <= 0) return;

        const passos = 42;
        ctx.strokeStyle = corAcento;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = opacidade * (ciclo > 0.8 ? (1 - ciclo) / 0.2 : 1) * 0.85;

        ctx.beginPath();
        let caneta = false;
        for (let k = 0; k <= passos * traco; k++) {
          const u = k / passos;
          // Interpolação simples entre os dois vetores, renormalizada:
          // slerp completo seria mais correto e, a esta distância
          // angular, indistinguível.
          const mx = a.x + (b.x - a.x) * u;
          const my = a.y + (b.y - a.y) * u;
          const mz = a.z + (b.z - a.z) * u;
          const n = Math.hypot(mx, my, mz) || 1;
          const alto = 1 + Math.sin(Math.PI * u) * 0.22;

          const v = girar(
            { x: (mx / n) * alto, y: (my / n) * alto, z: (mz / n) * alto },
            giro,
          );

          // O trecho que passa por trás do planeta some: sem isto o
          // arco atravessa a esfera e denuncia que não há volume.
          if (v.z < -0.15) {
            caneta = false;
            continue;
          }
          const q = projetar(v, cx, cy, escala);
          if (!caneta) {
            ctx.moveTo(q.x, q.y);
            caneta = true;
          } else {
            ctx.lineTo(q.x, q.y);
          }
        }
        ctx.stroke();

        // Marcadores nas duas pontas, pulsando devagar.
        for (const ponta of [a, b]) {
          const v = girar(ponta, giro);
          if (v.z < 0) continue;
          const q = projetar(v, cx, cy, escala);
          const pulso = 0.6 + 0.4 * Math.sin(t / 620 + i);
          ctx.globalAlpha = opacidade * pulso;
          ctx.fillStyle = corAcento;
          ctx.beginPath();
          ctx.arc(q.x, q.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
    };

    const passo = (t: number) => {
      if (!vivo) {
        quadro = 0;
        return;
      }
      const dt = Math.min(64, t - ultimo);
      ultimo = t;

      // Gira sozinho, e a rolagem adianta o giro: parar de rolar não
      // congela o planeta, mas rolar acelera a viagem.
      giro += dt * 0.00009 + avanco * 0.0006;

      desenhar(t);
      quadro = requestAnimationFrame(passo);
    };

    const ligar = () => {
      if (!quadro) {
        ultimo = performance.now();
        quadro = requestAnimationFrame(passo);
      }
    };

    /* ── Grade de pontos ─────────────────────────────────────── */
    const img = new Image();
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = img.width;
      off.height = img.height;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(img, 0, 0);
      const { data } = octx.getImageData(0, 0, off.width, off.height);

      const ehTerra = (lat: number, lon: number) => {
        const px = Math.floor(((lon + 180) / 360) * off.width);
        const py = Math.floor(((90 - lat) / 180) * off.height);
        const i = (py * off.width + px) * 4;
        return data[i] > 127;
      };

      for (let lat = -84; lat <= 84; lat += PASSO) {
        /*
          O passo em longitude é corrigido pelo cosseno da latitude. Com
          passo fixo, os meridianos se juntam perto dos polos e a
          Groenlândia vira um borrão sólido enquanto o equador fica
          ralo — a correção mantém a densidade parecida na esfera toda.
        */
        const passoLon = PASSO / Math.max(0.22, Math.cos(rad(lat)));
        for (let lon = -180; lon < 180; lon += passoLon) {
          const v = paraVetor(lat, lon);
          pontos.push({
            ...v,
            raio0: 1.6 + Math.random() * 1.4,
            terra: ehTerra(lat, lon),
          });
        }
      }

      medir();
      if (calmo) {
        // Sem movimento: o planeta aparece montado, no estado de operação.
        avanco = 0.4;
        desenhar(0);
        return;
      }
      ligar();
    };
    img.src = "/terra.png";

    /*
      Os anéis chegam em lat/lon e são convertidos uma vez só. Converter
      2.400 pontos a cada quadro seria trabalho repetido para um
      resultado que nunca muda: o que gira é a câmera, não o mapa.
    */
    const aborta = new AbortController();
    fetch("/contornos.json", { signal: aborta.signal })
      .then((r) => r.json())
      .then((aneis: [number, number][][]) => {
        contornos = aneis.map((anel) =>
          anel.map(([lon, lat]) => paraVetor(lat, lon)),
        );
      })
      // Sem contorno o globo continua de pé: é acabamento, não estrutura.
      .catch(() => {});

    /* ── Entradas ────────────────────────────────────────────── */
    const aoRolar = () => {
      // A seção é o pai do canvas: o avanço é o quanto dela já passou.
      const secao = canvas.closest(".intro");
      if (!secao) return;
      const r = secao.getBoundingClientRect();
      const curso = r.height - window.innerHeight;
      avanco = curso > 0 ? Math.min(1, Math.max(0, -r.top / curso)) : 0;
    };

    const aoRedimensionar = () => medir();

    // `capture` porque em telas grandes quem rola é o `.app-main`, e
    // evento de rolagem não borbulha.
    window.addEventListener("scroll", aoRolar, { passive: true, capture: true });
    window.addEventListener("resize", aoRedimensionar);
    aoRolar();

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
      window.removeEventListener("scroll", aoRolar, { capture: true });
      window.removeEventListener("resize", aoRedimensionar);
      obs.disconnect();
      tema.disconnect();
      aborta.abort();
      img.onload = null;
      pontos = [];
    };
  }, []);

  return <canvas ref={ref} className="globe-canvas" aria-hidden="true" />;
}
