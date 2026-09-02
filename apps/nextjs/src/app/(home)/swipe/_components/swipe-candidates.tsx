"use client";

import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";

const weightClasses = [
  { value: "", label: "Todas as categorias" },
  { value: "flyweight", label: "Flyweight" },
  { value: "bantamweight", label: "Bantamweight" },
  { value: "featherweight", label: "Featherweight" },
  { value: "lightweight", label: "Lightweight" },
  { value: "welterweight", label: "Welterweight" },
  { value: "middleweight", label: "Middleweight" },
  { value: "light_heavyweight", label: "Light Heavyweight" },
  { value: "heavyweight", label: "Heavyweight" },
] as const;

export function SwipeCandidates() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [weightClass, setWeightClass] = useState<
    | "flyweight"
    | "bantamweight"
    | "featherweight"
    | "lightweight"
    | "welterweight"
    | "middleweight"
    | "light_heavyweight"
    | "heavyweight"
    | undefined
  >(undefined);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchUser, setMatchUser] = useState<{
    name: string;
    nickname: string;
  } | null>(null);

  const { data: candidates } = useSuspenseQuery(
    trpc.swipe.candidates.queryOptions({ weightClass }),
  );

  const like = useMutation(
    trpc.swipe.like.mutationOptions({
      onSuccess: (data) => {
        if (data.matched) {
          const user = candidates[currentIndex];
          if (user) setMatchUser({ name: user.name, nickname: user.nickname });
        }
        setCurrentIndex((i) => i + 1);
      },
      onError: (error) => {
        toast.error(error.message || "Falha ao dar match");
      },
    }),
  );

  const pass = useMutation(
    trpc.swipe.pass.mutationOptions({
      onSuccess: () => {
        setCurrentIndex((i) => i + 1);
      },
      onError: (error) => {
        toast.error(error.message || "Falha ao passar candidato");
      },
    }),
  );

  const refresh = () => {
    setCurrentIndex(0);
    void queryClient.invalidateQueries(trpc.swipe.candidates.pathFilter());
  };

  const current = candidates[currentIndex];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-headline-lg">Encontre seu oponente</h1>

      {/* Weight class filter */}
      <div className="w-full max-w-md">
        <select
          value={weightClass}
          onChange={(e) => {
            setWeightClass((e.target.value || undefined) as typeof weightClass);
            setCurrentIndex(0);
          }}
          className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-12 rounded-none border-2 bg-transparent px-4"
          aria-label="Filtrar por categoria de peso"
        >
          {weightClasses.map((wc) => (
            <option key={wc.value} value={wc.value}>
              {wc.label}
            </option>
          ))}
        </select>
      </div>

      {!current ? (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="bg-muted text-headline-md flex h-24 w-24 items-center justify-center rounded-none">
            <span className="text-label-bold uppercase">LUTAR</span>
          </div>
          <h2 className="text-headline-md">Sem mais candidatos</h2>
          <p className="text-body-md text-muted-foreground max-w-md">
            Você já viu todos os lutadores desta categoria. Volte mais tarde
            para novos lutadores ou ajuste o filtro.
          </p>
          <Button onClick={refresh} variant="outline">
            Atualizar
          </Button>
        </div>
      ) : (
        <>
          {/* Candidate card */}
          <div className="border-border bg-background w-full max-w-md border-2 p-6">
            {current.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.image}
                alt={`Avatar de ${current.name}`}
                className="mb-6 h-56 w-full rounded-none object-cover"
              />
            ) : (
              <div className="bg-muted border-foreground mb-6 flex h-56 w-full items-center justify-center rounded-none border text-headline-lg">
                <span className="text-label-bold uppercase">LUTAR</span>
              </div>
            )}
            <div className="mb-6 text-center">
              <h2 className="text-headline-md">{current.name}</h2>
              {current.nickname && (
                <p className="text-label-bold text-muted-foreground mt-1 uppercase">
                  "{current.nickname}"
                </p>
              )}
            </div>

            {current.bio && (
              <p className="text-body-md text-muted-foreground">
                {current.bio}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {current.weightClass && (
                <span className="bg-foreground text-background text-label-sm rounded-none px-3 py-1">
                  {current.weightClass
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              )}
              <span className="bg-foreground text-background text-label-sm rounded-none px-3 py-1">
                {current.wins}-{current.losses}
              </span>
              {current.location && (
                <span className="bg-foreground text-background text-label-sm rounded-none px-3 py-1">
                  <span className="text-label-bold uppercase">LOCAL</span>{" "}
                  {current.location}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-center gap-6">
              <Button
                variant="outline"
                aria-label="Passar"
                disabled={pass.isPending || like.isPending}
                onClick={() => pass.mutate({ targetId: current.id })}
              >
                Passar
              </Button>
              <Button
                variant="action"
                aria-label="Dar Match"
                disabled={pass.isPending || like.isPending}
                onClick={() => like.mutate({ targetId: current.id })}
              >
                Dar Match
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Match modal */}
      {matchUser && (
        <div className="bg-muted fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="border-border bg-background flex w-full max-w-sm flex-col items-center gap-6 border-2 p-6">
            <span className="text-label-bold uppercase">CONECTADO</span>
            <h2 className="text-headline-lg">Deu Match!</h2>
            <p className="text-body-md text-muted-foreground">
              Você e{" "}
              <span className="text-foreground font-semibold">
                {matchUser.name}
              </span>{" "}
              ({matchUser.nickname}) gostaram um do outro. Hora de marcar a
              luta.
            </p>
            <div className="flex w-full flex-col gap-4">
              <Button
                onClick={() => {
                  setMatchUser(null);
                  refresh();
                }}
                className="w-full"
              >
                Continuar vendo
              </Button>
              <Button
                variant="outline"
                onClick={() => setMatchUser(null)}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
