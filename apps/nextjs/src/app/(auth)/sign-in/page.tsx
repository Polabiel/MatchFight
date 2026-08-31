"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";

import { authClient } from "~/auth/client";
import { useSession } from "~/auth/hooks";

function SignInContent() {
  const router = useRouter();
  const { session, isPending } = useSession();

  if (isPending) return null;

  if (session) {
    router.push("/swipe");
    return null;
  }

return (
  <div className="flex flex-col items-center gap-8 text-center">
    <div className="space-y-8">
      <h1 className="text-display-lg">MatchFight</h1>
      <p className="text-muted-foreground text-body-lg">
        Entre com sua conta Discord para continuar.
      </p>
    </div>

<Button
  variant="action"
  size="lg"
  className="w-full max-w-xs h-12 px-6"
  onClick={() =>
    authClient.signIn.social({ provider: "discord", callbackURL: "/" })
  }
>
  Entrar com Discord
</Button>
  </div>
);
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
