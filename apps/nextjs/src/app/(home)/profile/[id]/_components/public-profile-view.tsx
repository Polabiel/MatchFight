"use client";

import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Separator } from "@acme/ui/separator";

import { useTRPC } from "~/trpc/react";
import { Button } from "@acme/ui/button";

export function PublicProfileView({ userId }: { userId: string }) {
  const trpc = useTRPC();
  const router = useRouter();

  const { data: profile } = useSuspenseQuery(
    trpc.profile.getByUser.queryOptions({ userId }),
  );

  if (!profile) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center p-6 text-center">
        <div className="mb-6">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-none">
            <span className="text-muted-foreground text-body-lg">❓</span>
          </div>
        </div>
        <h1 className="text-headline-lg mb-4">Perfil não encontrado</h1>
        <p className="text-body-md text-muted-foreground mb-6">
          O perfil que você procura não existe ou ainda não foi criado.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/profile")}
          className="h-12 px-6"
        >
          Voltar ao seu perfil
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 p-6">
      <div className="flex items-start gap-6">
        <div className="shrink-0">
          {profile.user.image ? (
            <img
              src={profile.user.image}
              alt={`Avatar de ${profile.user.name}`}
              className="border-foreground h-20 w-20 rounded-none border-2 object-cover"
            />
          ) : (
            <div className="bg-foreground text-background text-headline-md flex h-20 w-20 items-center justify-center rounded-none border-2 border-foreground">
              {profile.user.name.substring(0, 2) || "JJ"}
            </div>
          )}
        </div>
        <div className="space-y-2 flex-1">
          <h1 className="text-headline-lg">{profile.user.name}</h1>
          <p className="text-body-md text-muted-foreground">
            {profile.nickname}
          </p>
          <span className="bg-foreground text-background text-label-bold px-3 py-1">
            {profile.role === "fighter"
              ? "Lutador"
              : profile.role === "judge"
                ? "Juiz"
                : "Ambos"}
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="border-border border-2 p-6 space-y-4">
        {profile.bio && (
          <div>
            <h3 className="text-label-bold mb-1">Bio</h3>
            <p className="text-muted-foreground text-body-md">{profile.bio}</p>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-label-bold">Detalhes</h3>
          <div className="grid gap-2 text-body-md">
            {profile.weightClass && (
              <div className="flex items-center gap-2">
                <span className="text-label-sm">Categoria:</span>
                <span className="text-headline-md">
                  {profile.weightClass
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-label-sm">Cartel:</span>
              <span className="text-headline-md">
                {profile.wins}-{profile.losses}
              </span>
            </div>
            {profile.location && (
              <div className="flex items-center gap-2">
                <span className="text-label-sm">Localização:</span>
                <span className="text-headline-md">{profile.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="action"
          onClick={() => router.push(`/swipe?target=${userId}`)}
        >
          Enviar pedido de luta
        </Button>
      </div>
    </div>
  );
}
