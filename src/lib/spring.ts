/**
 * Integrador de mola — o suficiente para animação de UI, em ~20 linhas.
 *
 * Sem `server-only`: roda no cliente, dentro do rAF.
 */

export type Spring = { value: number; velocity: number; target: number };

export function createSpring(value = 0): Spring {
  return { value, velocity: 0, target: value };
}

export function stepSpring(
  s: Spring,
  stiffness: number,
  damping: number,
  dt: number,
): void {
  const force = -stiffness * (s.value - s.target);
  const drag = -damping * s.velocity;
  s.velocity += (force + drag) * dt;
  s.value += s.velocity * dt;
}

export function settled(s: Spring): boolean {
  return Math.abs(s.value - s.target) < 0.1 && Math.abs(s.velocity) < 0.1;
}

/** Crava a mola no alvo, sem animar. */
export function snapSpring(s: Spring, target: number): void {
  s.target = target;
  s.value = target;
  s.velocity = 0;
}

/**
 * Teto do passo de tempo. Uma aba que volta do segundo plano entrega um
 * delta de vários segundos; sem o teto a integração explode e o elemento
 * sai voando em vez de convergir.
 */
export const MAX_DT = 1 / 30;
