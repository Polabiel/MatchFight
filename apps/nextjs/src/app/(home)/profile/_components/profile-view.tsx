"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";
import { Separator } from "@acme/ui/separator";

import { useTRPC } from "~/trpc/react";

export function ProfileView() {
  const router = useRouter();
  const trpc = useTRPC();

  const { data: profile } = useSuspenseQuery(trpc.profile.getMe.queryOptions());

  if (!profile) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center p-6 text-center">
        <div className="mb-6">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-none">
            <span className="text-muted-foreground text-body-lg">👤</span>
          </div>
        </div>
        <h1 className="text-headline-lg mb-4">Nenhum perfil ainda</h1>
        <p className="text-body-md text-muted-foreground mb-6 max-w-xl">
          Crie seu perfil para começar no MatchFight. Adicione seu apelido, bio,
          função, categoria de peso e mais para se conectar com outros lutadores
          e juízes.
        </p>
        <Button asChild variant="action" size="lg">
          <Link href="/profile/edit">Criar seu perfil</Link>
        </Button>
      </div>
    );
  }

  const createdDate = new Date(profile.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let joinedDate = "Agora mesmo";
  if (diffDays === 0) joinedDate = "Hoje";
  else if (diffDays === 1) joinedDate = "Ontem";
  else if (diffDays < 7) joinedDate = `Há ${diffDays} dias`;
  else if (diffDays < 30) joinedDate = `Há ${Math.ceil(diffDays / 7)} semanas`;
  else if (diffDays < 365) joinedDate = `Há ${Math.ceil(diffDays / 30)} meses`;
  else joinedDate = `Há ${Math.ceil(diffDays / 365)} anos`;

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
            <div className="bg-foreground text-background text-headline-md border-foreground flex h-20 w-20 items-center justify-center rounded-none border-2">
              {profile.user.name.substring(0, 2) || "JJ"}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
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
        <div className="border-foreground border-2 p-6 text-center">
          <div className="text-display-lg">
            {profile.wins}-{profile.losses}
          </div>
          <div className="text-label-bold">Cartel</div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="border-border space-y-4 border-2 p-6">
        {profile.bio && (
          <div>
            <h3 className="text-label-bold mb-1">Bio</h3>
            <p className="text-muted-foreground text-body-md">{profile.bio}</p>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-label-bold">Detalhes</h3>
          <div className="text-body-md grid gap-2">
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
        <div className="border-border border-t pt-4">
          <h3 className="text-label-bold mb-2">Conta</h3>
          <p className="text-body-md text-muted-foreground">
            Entrou {joinedDate}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => router.push("/profile/edit")}>
          Editar Perfil
        </Button>
      </div>
    </div>
  );
}
