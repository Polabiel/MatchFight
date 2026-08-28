'use client';

import { useMutation, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTRPC } from '~/trpc/react';
import { Button } from '@acme/ui/button';
import { toast } from '@acme/ui/toast';

const weightClasses = [
  { value: '', label: 'All weight classes' },
  { value: 'flyweight', label: 'Flyweight' },
  { value: 'bantamweight', label: 'Bantamweight' },
  { value: 'featherweight', label: 'Featherweight' },
  { value: 'lightweight', label: 'Lightweight' },
  { value: 'welterweight', label: 'Welterweight' },
  { value: 'middleweight', label: 'Middleweight' },
  { value: 'light_heavyweight', label: 'Light Heavyweight' },
  { value: 'heavyweight', label: 'Heavyweight' },
] as const;

export function SwipeCandidates() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [weightClass, setWeightClass] = useState<
    'flyweight' | 'bantamweight' | 'featherweight' | 'lightweight' | 'welterweight' | 'middleweight' | 'light_heavyweight' | 'heavyweight' | undefined
  >(undefined);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchUser, setMatchUser] = useState<{ name: string; nickname: string } | null>(null);

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
        toast.error(error.message || 'Failed to like candidate');
      },
    }),
  );

  const pass = useMutation(
    trpc.swipe.pass.mutationOptions({
      onSuccess: () => {
        setCurrentIndex((i) => i + 1);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to pass candidate');
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
      <h1 className="text-3xl font-extrabold tracking-tight">Find your opponent</h1>

      {/* Weight class filter */}
      <div className="w-full max-w-md">
        <select
          value={weightClass}
          onChange={(e) => {
            setWeightClass((e.target.value || undefined) as typeof weightClass);
            setCurrentIndex(0);
          }}
          className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-4xl">
            🥊
          </div>
          <h2 className="text-2xl font-bold">No more candidates</h2>
          <p className="max-w-md text-muted-foreground">
            You've seen everyone in this weight class. Check back later for new fighters or adjust
            your filter.
          </p>
          <Button onClick={refresh} variant="outline">
            Refresh
          </Button>
        </div>
      ) : (
        <>
          {/* Candidate card */}
          <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="relative h-64 w-full bg-muted">
              {current.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.image}
                  alt={`${current.name} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl">
                  🥊
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                <h2 className="text-2xl font-bold text-white">{current.name}</h2>
                <p className="text-sm font-medium text-white/90">"{current.nickname}"</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-5">
              {current.bio && <p className="text-sm text-muted-foreground">{current.bio}</p>}

              <div className="flex flex-wrap gap-2 text-sm">
                {current.weightClass && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {current.weightClass.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                  {current.wins}-{current.losses}
                </span>
                {current.location && (
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                    📍 {current.location}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-2 flex items-center justify-center gap-6">
                <Button
                  variant="outline"
                  size="lg"
                  aria-label="Pass"
                  disabled={pass.isPending || like.isPending}
                  onClick={() => pass.mutate({ targetId: current.id })}
                  className="h-14 w-14 rounded-full text-xl"
                >
                  ✕
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  aria-label="Like"
                  disabled={pass.isPending || like.isPending}
                  onClick={() => like.mutate({ targetId: current.id })}
                  className="h-14 w-14 rounded-full text-xl"
                >
                  ✓
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Match modal */}
      {matchUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-extrabold">It&apos;s a Match!</h2>
            <p className="text-muted-foreground">
              You and <span className="font-semibold text-foreground">{matchUser.name}</span> (
              {matchUser.nickname}) liked each other. Time to schedule your fight.
            </p>
            <div className="flex w-full flex-col gap-2">
              <Button
                onClick={() => {
                  setMatchUser(null);
                  refresh();
                }}
              >
                Keep swiping
              </Button>
              <Button variant="outline" onClick={() => setMatchUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}