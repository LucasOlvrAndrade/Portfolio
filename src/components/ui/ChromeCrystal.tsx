"use client";

import { useEffect, useRef } from "react";

/*
  A vitrine dos serviços: um cristal de metal líquido, cromado, flutuando
  num céu preto com estrelas. Reage ao mouse (a peça gira e a luz muda) e
  fica se mexendo sozinha quando ninguém encosta.

  É WebGL cru, sem biblioteca: um único fragment shader que faz raymarch de
  esferas fundidas (smooth-min) e reflete um "estúdio" procedural, faixas de
  luz brancas num fundo preto, que é o que dá a cara de cromo. Três.js
  custaria 600 KB para desenhar uma forma só.

  O canvas cobre o card inteiro (as estrelas ficam atrás do texto também);
  a peça é posicionada onde estiver o `slot`, uma div vazia na grade que o
  layout empurra para a direita no desktop e para cima no celular. Medir o
  slot em vez de chutar coordenadas é o que mantém o cristal no lugar certo
  em qualquer largura.

  Custo: o raymarch só roda nos pixels que podem tocar a peça (teste contra
  a esfera envolvente); o resto é só estrela. DPR limitado a 1.5, e o loop
  para quando o card sai da tela ou a aba fica escondida. Quem pediu menos
  movimento recebe um quadro só, parado.
*/

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;      // tamanho do canvas em pixels
uniform float uTime;
uniform vec2 uMouse;    // -1..1, já suavizado
uniform vec2 uCenter;   // centro da peça, em pixels
uniform float uRadius;  // raio da peça, em pixels

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// A peça: um núcleo e cinco gotas orbitando, fundidas. O smin com k alto é
// o que faz parecer líquido em vez de cacho de bolinhas.
float sdf(vec3 p) {
  float t = uTime * 0.5;
  float d = length(p) - 0.78;
  for (int i = 0; i < 5; i++) {
    float f = float(i);
    vec3 c = vec3(
      sin(t * 0.9 + f * 1.7),
      cos(t * 0.7 + f * 2.3) * 0.8,
      sin(t * 1.1 + f * 0.9)
    ) * (0.5 + 0.12 * sin(t + f * 1.3));
    d = smin(d, length(p - c) - (0.26 + 0.08 * sin(t * 1.4 + f)), 0.42);
  }
  return d;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.0025, 0.0);
  return normalize(vec3(
    sdf(p + e.xyy) - sdf(p - e.xyy),
    sdf(p + e.yxy) - sdf(p - e.yxy),
    sdf(p + e.yyx) - sdf(p - e.yyx)
  ));
}

// O estúdio refletido: fundo preto com faixas de luz branca (softbox) e
// uma luz-chave forte. Monocromático de propósito: é cromo, não arco-íris.
vec3 env(vec3 r) {
  float faixa = smoothstep(0.25, 0.75, sin(r.y * 9.0 + sin(r.x * 4.0 + uTime * 0.2) * 1.8));
  float colunas = smoothstep(0.4, 0.9, sin(r.x * 5.0 + r.z * 3.0 - uTime * 0.15));
  float alto = smoothstep(-0.9, 0.7, r.y);
  float v = 0.08 + faixa * (0.35 + 0.65 * alto) + colunas * 0.35 * alto;
  v += pow(max(r.y, 0.0), 4.0) * 0.6;
  v += pow(max(dot(r, normalize(vec3(0.5, 0.7, 0.5))), 0.0), 50.0) * 2.5;
  v += pow(max(dot(r, normalize(vec3(-0.7, 0.2, 0.4))), 0.0), 70.0) * 1.6;
  v += pow(max(dot(r, normalize(vec3(0.2, -0.6, 0.7))), 0.0), 80.0) * 0.8;
  return vec3(v) * vec3(0.94, 0.97, 1.0);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;

  // Estrelas: uma por célula, só nas células "sorteadas", piscando devagar.
  vec3 cor = vec3(0.0);
  float alpha = 0.0;
  {
    vec2 g = floor(frag / 26.0);
    vec2 f = fract(frag / 26.0) - 0.5;
    float h = hash(g);
    vec2 off = (vec2(hash(g + 1.0), hash(g + 2.0)) - 0.5) * 0.7;
    float brilho = smoothstep(0.09, 0.0, length(f - off)) * step(0.93, h);
    brilho *= 0.45 + 0.55 * sin(uTime * (0.6 + h * 1.2) + h * 30.0);
    cor += vec3(brilho);
    alpha = brilho;
  }

  // Raio da câmera, em coordenadas centradas na peça.
  vec2 q = (frag - uCenter) / uRadius;
  vec3 ro = vec3(0.0, 0.0, 3.4);
  vec3 rd = normalize(vec3(q * 0.5, -1.0));

  // Esfera envolvente da peça: quem passa longe não paga o raymarch.
  float b = dot(ro, rd);
  float c2 = dot(ro, ro) - 2.2 * 2.2;
  if (b * b - c2 < 0.0) { gl_FragColor = vec4(cor, alpha); return; }

  // A peça gira com o mouse, e sozinha quando ninguém mexe.
  float ay = uMouse.x * 0.6 + uTime * 0.15;
  float ax = -uMouse.y * 0.4 + sin(uTime * 0.3) * 0.1;
  vec3 roL = ro; vec3 rdL = rd;
  roL.xz *= rot(ay); rdL.xz *= rot(ay);
  roL.yz *= rot(ax); rdL.yz *= rot(ax);

  float t = -b - sqrt(b * b - c2);
  bool bateu = false;
  vec3 p;
  for (int i = 0; i < 90; i++) {
    p = roL + rdL * t;
    float d = sdf(p);
    if (d < 0.0015) { bateu = true; break; }
    t += d * 0.9;
    if (t > 7.0) break;
  }
  if (!bateu) { gl_FragColor = vec4(cor, alpha); return; }

  vec3 n = normalAt(p);
  vec3 r = reflect(rdL, n);
  float fresnel = pow(1.0 - max(dot(n, -rdL), 0.0), 3.0);
  vec3 metal = env(r) * mix(0.7, 1.0, fresnel);
  // Toque de luz direta para a forma não sumir nas partes sem reflexo.
  vec3 l1 = normalize(vec3(0.6, 0.8, 0.6));
  metal += vec3(pow(max(dot(n, l1), 0.0), 3.0) * 0.06);
  metal += vec3(pow(max(dot(r, l1), 0.0), 120.0) * 1.5);
  // Um fio de luz na borda: separa o cromo do preto.
  metal += vec3(fresnel * 0.12);

  gl_FragColor = vec4(metal, 1.0);
}
`;

export function ChromeCrystal({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const slot = slotRef.current;
    if (!canvas || !slot) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
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

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
      center: gl.getUniformLocation(prog, "uCenter"),
      radius: gl.getUniformLocation(prog, "uRadius"),
    };

    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
      const s = slot.getBoundingClientRect();
      // WebGL conta y de baixo para cima.
      const cx = (s.left - r.left + s.width / 2) * dpr;
      const cy = (r.height - (s.top - r.top + s.height / 2)) * dpr;
      gl.uniform2f(u.res, w, h);
      gl.uniform2f(u.center, cx, cy);
      gl.uniform1f(u.radius, (Math.min(s.width, s.height) / 2) * dpr);
    };

    const quadro = () => {
      mouse.x += (alvo.x - mouse.x) * 0.06;
      mouse.y += (alvo.y - mouse.y) * 0.06;
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.time, parado ? 4.0 : (performance.now() - inicio) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
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

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
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
    ro.observe(slot);
    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      acordar();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", acordar);
    canvas.parentElement?.addEventListener("pointermove", onMove);
    canvas.parentElement?.addEventListener("pointerleave", onLeave);

    medir();
    if (parado) quadro();
    else acordar();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", acordar);
      canvas.parentElement?.removeEventListener("pointermove", onMove);
      canvas.parentElement?.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
      <div ref={slotRef} aria-hidden className={className} />
    </>
  );
}
