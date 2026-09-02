/**
 * Resolve um callbackUrl de forma segura.
 *
 * Regras:
 * - Só aceita caminhos internos relativos (ex: "/swipe"), nunca URLs externas
 *   (evita open redirect) nem protocolos ("//", "http", "javascript").
 * - Nunca devolve a landing "/" — após login o usuário deve ir para o app.
 * - Se ausente ou inválido, usa o fallback.
 */
export function resolveCallbackUrl(
 raw: string | null | undefined,
 fallback = "/swipe",
): string {
 if (
  raw &&
  raw.startsWith("/") &&
  !raw.startsWith("//") &&
  raw !== "/" &&
  !/^\/[^/]+:/.test(raw)
 ) {
  return raw;
 }
 return fallback;
}
