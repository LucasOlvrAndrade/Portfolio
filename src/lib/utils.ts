import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Junta classes condicionais e resolve conflitos do Tailwind — a última
 * classe vence de fato, em vez de depender da ordem no CSS gerado.
 *
 * Convenção do shadcn/ui: componentes de terceiros importam daqui.
 * Ao contrário de `lib/github.ts`, este arquivo NÃO é `server-only`:
 * roda nos dois lados.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
