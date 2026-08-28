"use client";

import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";

import { authClient } from "~/auth/client";
import { useSession } from "~/auth/hooks";

export default function SignUpPage() {
  const router = useRouter();
  const { session, isPending } = useSession();

  if (isPending) return null;

  if (session) {
    router.push("/profile/edit");
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-muted-foreground">
          Use sua conta Discord para começar no MatchFight.
        </p>
      </div>

      <Button
        size="lg"
        className="w-full max-w-xs"
        onClick={() =>
          authClient.signIn.social({ provider: "discord", callbackURL: "/profile/edit" })
        }
      >
        Entrar com Discord
      </Button>

      <p className="text-muted-foreground text-sm">
        Já tem conta?{" "}
        <a href="/sign-in" className="text-primary font-medium hover:underline">
          Entrar
        </a>
      </p>
    </div>
  );
}