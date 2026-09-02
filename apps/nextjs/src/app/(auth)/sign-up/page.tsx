"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@acme/ui/button";

import { authClient } from "~/auth/client";
import { resolveCallbackUrl } from "~/auth/callback-url";
import { useSession } from "~/auth/hooks";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  );
}

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isPending } = useSession();

  const callbackUrl = resolveCallbackUrl(
    searchParams.get("callbackUrl"),
    "/profile/edit",
  );

  if (isPending) return null;

  if (session) {
    router.push(callbackUrl);
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="space-y-4">
        <h1 className="text-display-lg">Criar conta</h1>
        <p className="text-muted-foreground text-body-lg">
          Use sua conta Discord para começar no MatchFight.
        </p>
      </div>

      <Button
        variant="action"
        className="w-full max-w-xs h-12 px-6"
        onClick={() =>
          authClient.signIn.social({
            provider: "discord",
            callbackURL: callbackUrl,
          })
        }
      >
        Entrar com Discord
      </Button>

      <p className="text-muted-foreground text-body-md">
        Já tem conta?{" "}
        <a href="/sign-in" className="text-foreground underline hover:no-underline">
          Entrar
        </a>
      </p>
    </div>
  );
}
