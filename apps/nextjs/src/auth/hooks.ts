"use client";

import { authClient } from "./client";

/**
 * Hook que retorna o usuário da sessão atual (client-side).
 * Útil para componentes React que precisam saber se o usuário está logado.
 */
export function useUser() {
  const { data: session, isPending, error } = authClient.useSession();
  return {
    user: session?.user ?? null,
    isPending,
    error,
    isAuthenticated: !!session?.user,
  };
}

/**
 * Hook que retorna a sessão completa (client-side).
 * Inclui session + user.
 */
export function useSession() {
  const result = authClient.useSession();
  return {
    session: result.data,
    isPending: result.isPending,
    error: result.error,
  };
}
