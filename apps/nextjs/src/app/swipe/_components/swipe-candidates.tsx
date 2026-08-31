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
  { value: "", label: "All weight classes" },
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
        toast.error(error.message || "Failed to like candidate");
      },
    }),
  );

  const pass = useMutation(
    trpc.swipe.pass.mutationOptions({
      onSuccess: () => {
        setCurrentIndex((i) => i + 1);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to pass candidate");
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
      <h1 className="text-headline-lg">Find your opponent</h1>

      {/* Weight class filter */}
      <div className="w-full max-w-md">
        <select
          value={weightClass}
          onChange={(e) => {
            setWeightClass((e.target.value || undefined) as typeof weightClass);
            setCurrentIndex(0);
          }}
          className="border-border bg-background placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-12 rounded-none border-2 px-4"
          aria-label="Filter by weight class"
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
          <h2 className="text-headline-md">No more candidates</h2>
          <p className="text-body-md text-muted-foreground max-w-md">
            You've seen everyone in this weight class. Check back later for new
            fighters or adjust your filter.
          </p>
          <Button
            onClick={refresh}
            variant="outline"
            className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
          >
            Refresh
          </Button>
        </div>
      ) : (
        <>
          {/* Candidate card */}
          <div className="border-border bg-background hover:bg-muted border-2 p-6 transition-colors">
            {current.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.image}
                alt={`${current.name} avatar`}
                className="mb-6 h-56 w-full rounded-none object-cover"
              />
            ) : (
              <div className="bg-muted border-foreground mb-6 flex h-56 w-full items-center justify-center rounded-none border text-headline-lg">
                <span className="text-label-bold uppercase">LUTAR</span>
              </div>
            )}
            <div className="relative">
              <div className="bg-muted/50 absolute inset-x-0 bottom-0 p-4 pt-12">
                <h2 className="text-headline-md text-foreground">
                  {current.name}
                </h2>
                <p className="text-label-bold text-foreground/90 uppercase">
                  "{current.nickname}"
                </p>
              </div>
            </div>

            <div className="mt-6">
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
                    <span className="text-label-bold uppercase">LOCAL</span> {current.location}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-center gap-6">
              <Button
                variant="outline"
                aria-label="Pass"
                disabled={pass.isPending || like.isPending}
                onClick={() => pass.mutate({ targetId: current.id })}
                className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
              >
                Passar
              </Button>
              <Button
                aria-label="Like"
                disabled={pass.isPending || like.isPending}
                onClick={() => like.mutate({ targetId: current.id })}
                className="bg-primary text-primary-foreground border-primary hover:bg-foreground hover:border-foreground text-label-bold h-12 border-2 px-6"
              >
                Dar Match
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Match modal */}
      {matchUser && (
        <div className="bg-background/50 fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="border-border bg-background flex w-full max-w-sm flex-col items-center gap-6 border-2 p-6">
            <span className="text-label-bold uppercase">CONECTADO</span>
            <h2 className="text-headline-lg">It&apos;s a Match!</h2>
            <p className="text-body-md text-muted-foreground">
              You and{" "}
              <span className="text-foreground font-semibold">
                {matchUser.name}
              </span>{" "}
              ({matchUser.nickname}) liked each other. Time to schedule your
              fight.
            </p>
            <div className="flex w-full flex-col gap-4">
              <Button
                onClick={() => {
                  setMatchUser(null);
                  refresh();
                }}
                className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
              >
                Keep swiping
              </Button>
              <Button
                variant="outline"
                onClick={() => setMatchUser(null)}
                className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
