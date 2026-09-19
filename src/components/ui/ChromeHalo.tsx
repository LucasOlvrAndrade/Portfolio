"use client";

import { useEffect, useRef } from "react";

/*
  A vitrine dos serviços: um anel de cromo líquido, sem nada escrito, num
  fundo preto com halo. É a forma da referência (um círculo flutuando no
  vazio) com o material puxado para vidro: reflexo de metal nas bordas e
  luz atravessando o corpo, com um fio de dispersão (o vermelho, o verde e
  o azul refratam um pouco diferente, como num prisma).

  WebGL cru, sem biblioteca. O anel é um toro por raymarch cuja espessura
  ondula ao longo do círculo e no tempo, o que dá o "líquido": o aro nunca
  é perfeitamente regular e as ondas correm por ele. Sombreamento:
  Fresnel de Schlick decide quanto é reflexo (cromo) e quanto é
  transmissão (vidro); os dois olham para o mesmo estúdio procedural de
  faixas brancas em fundo preto.

  Resolução: o canvas roda no devicePixelRatio inteiro (até 3x), e a borda
  do anel é suavizada pela distância mínima do raio ao objeto, então não
  serrilha em tela nenhuma. O raymarch só roda nos pixels dentro da esfera
  envolvente; o loop para fora da tela; quem pediu menos movimento recebe
  um quadro só.
*/

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// Toro no plano xz (raio 1), com a espessura ondulando pelo círculo.
float sdf(vec3 p) {
  float ang = atan(p.z, p.x);
  float esp = 0.18
    + 0.03 * sin(ang * 4.0 + uTime * 0.5)
    + 0.018 * sin(ang * 7.0 - uTime * 0.8 + p.y * 3.0);
  vec2 q = vec2(length(p.xz) - 1.0, p.y);
  return length(q) - esp;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(
    sdf(p + e.xyy) - sdf(p - e.xyy),
    sdf(p + e.yxy) - sdf(p - e.yxy),
    sdf(p + e.yyx) - sdf(p - e.yyx)
  ));
}

// O estúdio que o anel reflete e deixa passar: preto com faixas de luz.
float estudio(vec3 r) {
  // Poucas faixas, largas e macias: muitas faixas finas viram ruído no
  // vidro, porque reflexo e transmissão as dobram duas vezes.
  float v = 0.015 + 0.09 * smoothstep(-1.0, 1.0, r.y);
  float ang = atan(r.x, r.z);
  v += smoothstep(0.3, 0.95, sin(r.y * 2.6 + 0.9)) * 1.3;
  v += smoothstep(0.6, 0.98, sin(ang * 2.0 + r.y * 0.8 + uTime * 0.1)) * 0.9;
  v += pow(max(dot(r, normalize(vec3(-0.4, 0.8, 0.45))), 0.0), 10.0) * 2.2;
  v += pow(max(dot(r, normalize(vec3(0.7, 0.2, 0.6))), 0.0), 40.0) * 2.5;
  v += pow(max(dot(r, normalize(vec3(0.1, -0.8, 0.5))), 0.0), 30.0) * 0.8;
  return v;
}

void main() {
  vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  vec3 ro = vec3(0.0, 0.0, 3.3);
  vec3 rd = normalize(vec3(q * 1.05, -1.0));

  // Esfera envolvente: raio 1.35 cobre o toro em qualquer inclinação.
  float b = dot(ro, rd);
  float c2 = dot(ro, ro) - 1.35 * 1.35;
  float disc = b * b - c2;
  if (disc < 0.0) { gl_FragColor = vec4(0.0); return; }

  // O anel fica quase de frente (como na referência), inclina com o mouse
  // e gira devagar em torno do próprio eixo; a ondulação é o que deixa o
  // giro visível.
  float ax = 1.35 - uMouse.y * 0.35 + sin(uTime * 0.25) * 0.08;
  float ay = uMouse.x * 0.45 + sin(uTime * 0.19) * 0.12;
  float az = uTime * 0.12;
  ro.yz *= rot(ax); rd.yz *= rot(ax);
  ro.xz *= rot(ay); rd.xz *= rot(ay);
  ro.xz *= rot(az); rd.xz *= rot(az);

  float t = -b - sqrt(disc);
  float tMax = -b + sqrt(disc);
  float dMin = 1e9;
  bool bateu = false;
  vec3 p;
  for (int i = 0; i < 96; i++) {
    p = ro + rd * t;
    float d = sdf(p);
    dMin = min(dMin, d);
    if (d < 0.0012) { bateu = true; break; }
    t += d * 0.85;
    if (t > tMax) break;
  }

  // Tamanho de um pixel no espaço do objeto, para suavizar a borda.
  float px = 2.2 / min(uRes.x, uRes.y);
  if (!bateu) {
    float borda = 1.0 - smoothstep(0.0, px * 1.5, dMin);
    gl_FragColor = vec4(vec3(0.75) * borda, borda);
    return;
  }

  vec3 n = normalAt(p);
  float cosv = max(dot(n, -rd), 0.0);
  // Schlick: metade reflexo de frente, tudo reflexo na borda. Cromo na borda,
  // vidro no meio.
  float F = 0.5 + 0.5 * pow(1.0 - cosv, 4.0);
  float refl = estudio(reflect(rd, n));

  // Transmissão com dispersão: cada canal refrata com um índice próprio.
  vec3 tr = vec3(
    estudio(refract(rd, n, 1.0 / 1.42)),
    estudio(refract(rd, n, 1.0 / 1.45)),
    estudio(refract(rd, n, 1.0 / 1.48))
  );
  // Segunda superfície: o que sai do outro lado do aro reflete de novo, e
  // é isso que enche o vidro de brilho em vez de deixá-lo oco.
  vec3 dentro = refract(rd, n, 1.0 / 1.45);
  vec3 p2 = p + dentro * 0.35;
  vec3 n2 = -normalAt(p2);
  float interno = estudio(reflect(dentro, n2)) * 0.45;

  vec3 cor = vec3(refl) * F + (tr * 0.5 + vec3(interno)) * (1.0 - F);
  cor *= vec3(0.94, 0.97, 1.03);
  cor = cor / (1.0 + cor) * 1.6;
  cor = pow(clamp(cor, 0.0, 1.0), vec3(1.0 / 1.35));
  gl_FragColor = vec4(cor, 1.0);
}`;

export function ChromeHalo({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
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
      gl.uniform2f(uRes, w, h);
    };

    const quadro = () => {
      mouse.x += (alvo.x - mouse.x) * 0.05;
      mouse.y += (alvo.y - mouse.y) * 0.05;
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uTime, parado ? 3.0 : (performance.now() - inicio) / 1000);
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
