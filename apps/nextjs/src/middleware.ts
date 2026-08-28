import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Rotas que exigem autenticação.
 * Rotas públicas (/, /sign-in, /sign-up, /api/*) não entram na lista.
 */
const protectedRoutes = [
  "/onboarding",
  "/swipe",
  "/fights",
  "/fights/new",
  "/profile",
  "/profile/edit",
  "/messages",
];

/** Rotas de auth (login/registro) — se logado, redireciona para /swipe */
const authRoutes = ["/sign-in", "/sign-up"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("better-auth.session_token"));

  // Rota protegida sem sessão → redirect para login
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!hasSessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Rota de auth com sessão ativa → redirect para /swipe
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (hasSessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/swipe";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Executa o middleware em todas as rotas exceto estáticos e API
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
