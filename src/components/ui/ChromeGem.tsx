"use client";

import { useEffect, useRef } from "react";

/*
  A vitrine dos serviços: um diamante bruto cromado, prata de Surfista
  Prateado, girando devagar num fundo preto com um halo branco atrás.

  É WebGL cru, sem biblioteca. A pedra é um icosaedro subdividido uma vez
  (80 faces) com cada vértice empurrado para dentro ou para fora por um
  ruído fixo, o que dá a cara de pedra lapidada à mão: facetas irregulares,
  nenhuma igual à outra. As normais são POR FACE, de propósito: é a
  faceta plana refletindo uma faixa de luz inteira que faz o cromo.

  O cromo é reflexo de um "estúdio" procedural: fundo escuro em degradê,
  faixas brancas de softbox em duas direções e duas luzes-chave duras.
  Nada de textura, então nada de download. A pedra gira sozinha e inclina
  com o mouse; o loop para quando o card sai da tela; quem pediu menos
  movimento recebe um quadro só.
*/

const VERT = `
attribute vec3 aPos;
attribute vec3 aNor;
uniform mat3 uRot;
varying vec3 vPos;
varying vec3 vNor;
void main() {
  vec3 p = uRot * aPos;
  vPos = p;
  vNor = uRot * aNor;
  // Câmera em z = +4 olhando para a origem; perspectiva simples.
  float depth = 4.0 - p.z;
  gl_Position = vec4(p.xy * 2.1, (depth - 3.0) / 3.0 * depth, depth);
}`;

const FRAG = `
precision highp float;
varying vec3 vPos;
varying vec3 vNor;
uniform float uTime;

// O estúdio refletido. Monocromático, contraste alto: é prata polida.
vec3 estudio(vec3 r) {
  // Fundo quase preto: o que faz cromo é o CONTRASTE entre faceta escura
  // e faceta que pegou uma faixa de luz, não o brilho médio.
  float v = 0.05 + 0.22 * smoothstep(-1.0, 1.0, r.y);
  float ang = atan(r.x, r.z);
  v += smoothstep(0.72, 0.9, sin(r.y * 7.0 + 0.6)) * 1.6;
  v += smoothstep(0.84, 0.97, sin(ang * 4.0 + r.y * 2.0 + uTime * 0.12)) * 1.0;
  v += pow(max(dot(r, normalize(vec3(-0.5, 0.8, 0.4))), 0.0), 20.0) * 2.2;
  v += pow(max(dot(r, normalize(vec3(0.7, 0.3, 0.5))), 0.0), 90.0) * 2.5;
  v += pow(max(dot(r, normalize(vec3(0.2, -0.7, 0.6))), 0.0), 70.0) * 0.9;
  v *= mix(0.15, 1.0, smoothstep(-0.95, -0.3, r.y));
  return vec3(v) * vec3(0.93, 0.96, 1.03);
}

void main() {
  vec3 n = normalize(vNor);
  vec3 v = normalize(vPos - vec3(0.0, 0.0, 4.0));
  vec3 r = reflect(v, n);
  float fresnel = pow(1.0 - max(dot(n, -v), 0.0), 4.0);
  vec3 cor = estudio(r) * mix(0.8, 1.3, fresnel);
  // Compressão de tom: os picos viram branco sem estourar tudo.
  cor = cor / (1.0 + cor) * 1.35;
  cor = pow(clamp(cor, 0.0, 1.0), vec3(1.0 / 1.5));
  gl_FragColor = vec4(cor, 1.0);
}`;

/** Icosaedro subdividido uma vez, vértices deslocados por ruído fixo, normais por face. */
function lapidar(): { pos: Float32Array; nor: Float32Array; n: number } {
  const t = (1 + Math.sqrt(5)) / 2;
  const base: [number, number, number][] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  const faces: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const verts = base.map(([x, y, z]) => {
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l] as [number, number, number];
  });
  const meio = new Map<string, number>();
  const pontoMedio = (a: number, b: number) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    const j = meio.get(k);
    if (j !== undefined) return j;
    const [ax, ay, az] = verts[a];
    const [bx, by, bz] = verts[b];
    const mx = (ax + bx) / 2, my = (ay + by) / 2, mz = (az + bz) / 2;
    const l = Math.hypot(mx, my, mz);
    verts.push([mx / l, my / l, mz / l]);
    meio.set(k, verts.length - 1);
    return verts.length - 1;
  };
  const sub: [number, number, number][] = [];
  for (const [a, b, c] of faces) {
    const ab = pontoMedio(a, b), bc = pontoMedio(b, c), ca = pontoMedio(c, a);
    sub.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
  }
  // Pedra bruta: cada vértice sai do raio 1 por um ruído fixo (semente
  // constante, para a pedra ser sempre a mesma), e a forma é alongada
  // no eixo vertical, como um cristal.
  let semente = 7;
  const rnd = () => {
    semente = (semente * 16807) % 2147483647;
    return semente / 2147483647;
  };
  const lap = verts.map(([x, y, z]) => {
    const r = 0.82 + rnd() * 0.36;
    return [x * r, y * r * 1.3, z * r] as [number, number, number];
  });
  const pos = new Float32Array(sub.length * 9);
  const nor = new Float32Array(sub.length * 9);
  sub.forEach(([a, b, c], i) => {
    const A = lap[a], B = lap[b], C = lap[c];
    const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2];
    const vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    [A, B, C].forEach((P, j) => {
      pos.set(P, i * 9 + j * 3);
      nor.set([nx, ny, nz], i * 9 + j * 3);
    });
  });
  return { pos, nor, n: sub.length * 3 };
}

export function ChromeGem({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) return;

    const compile = (tipo: number, src: string) => {
      const s = gl.createShader(tipo)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const pedra = lapidar();
    const liga = (nome: string, dados: Float32Array) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, dados, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, nome);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    };
    liga("aPos", pedra.pos);
    liga("aNor", pedra.nor);
    const uRot = gl.getUniformLocation(prog, "uRot");
    const uTime = gl.getUniformLocation(prog, "uTime");
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const alvo = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };
    let visivel = true;
    let raf = 0;
    const inicio = performance.now();

    const medir = () => {
      const r = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const quadro = () => {
      mouse.x += (alvo.x - mouse.x) * 0.05;
      mouse.y += (alvo.y - mouse.y) * 0.05;
      const t = parado ? 2.0 : (performance.now() - inicio) / 1000;
      // Gira devagar no eixo vertical, balança um pouco, e inclina com o mouse.
      const ay = t * 0.35 + mouse.x * 0.7;
      const ax = Math.sin(t * 0.4) * 0.25 - mouse.y * 0.5;
      const az = Math.sin(t * 0.23) * 0.15;
      const cy = Math.cos(ay), sy = Math.sin(ay);
      const cx = Math.cos(ax), sx = Math.sin(ax);
      const cz = Math.cos(az), sz = Math.sin(az);
      // Rz * Rx * Ry, em coluna-maior como o GLSL espera.
      const m = [
        cz * cy + sz * sx * sy, sz * cx, -cz * sy + sz * sx * cy,
        -sz * cy + cz * sx * sy, cz * cx, sz * sy + cz * sx * cy,
        cx * sy, -sx, cx * cy,
      ];
      gl.uniformMatrix3fv(uRot, false, m);
      gl.uniform1f(uTime, t);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, pedra.n);
    };

    const loop = () => {
      if (!visivel || document.hidden) {
        raf = 0;
        return;
      }
      quadro();
      raf = requestAnimationFrame(loop);
    };
    const acordar = () => {
      if (!raf && visivel && !document.hidden && !parado) raf = requestAnimationFrame(loop);
    };
    const card = canvas.closest("article") ?? canvas.parentElement!;
    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      alvo.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      alvo.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => {
      alvo.x = 0;
      alvo.y = 0;
    };

    const ro = new ResizeObserver(() => {
      medir();
      if (parado) quadro();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      acordar();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", acordar);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);

    medir();
    if (parado) quadro();
    else acordar();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", acordar);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div className={`gema relative aspect-square ${className}`} aria-hidden>
      <canvas ref={canvasRef} className="relative h-full w-full" />
    </div>
  );
}
