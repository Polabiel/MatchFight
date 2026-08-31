"use client";

import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useSession } from "~/auth/hooks";
import { useTRPC } from "~/trpc/react";

const statusLabels: Record<string, string> = {
  pending: "PENDING",
  scheduled: "CONFIRMADA",
  completed: "CONCLUÍDA",
  cancelled: "CANCELADA",
};

function FightCard({
  id,
  fighter1,
  fighter2,
  status,
  scheduledAt,
  location,
}: {
  id: string;
  fighter1: { id: string; name: string; image: string | null };
  fighter2: { id: string; name: string; image: string | null };
  status: string;
  scheduledAt: Date | null;
  location: string | null;
}) {
  const scheduled = scheduledAt
    ? new Date(scheduledAt).toLocaleString()
    : "Data TBD";

  // Status chip - no red to avoid multiple red elements; red reserved for confirm button in detail
  const statusClass =
    "bg-foreground text-background px-3 py-1 text-label-sm rounded-none";

  return (
    <Link href={`/fights/${id}`} className="border-border border-b py-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {fighter1.image ? (
              <img
                src={fighter1.image}
                alt={fighter1.name}
                className="border-border h-10 w-10 rounded-none border object-cover"
              />
            ) : (
              <div className="bg-foreground text-background flex h-10 w-10 items-center justify-center rounded-none">
                {fighter1.name.charAt(0)}
              </div>
            )}
            <p className="text-headline-md">{fighter1.name}</p>
          </div>
          <span className="text-muted-foreground">vs</span>
          <div className="flex items-center gap-3">
            {fighter2.image ? (
              <img
                src={fighter2.image}
                alt={fighter2.name}
                className="border-border h-10 w-10 rounded-none border object-cover"
              />
            ) : (
              <div className="bg-foreground text-background flex h-10 w-10 items-center justify-center rounded-none">
                {fighter2.name.charAt(0)}
              </div>
            )}
            <p className="text-headline-md">{fighter2.name}</p>
          </div>
        </div>
        <div className="text-body-md flex items-center gap-2">
          {location && <span>📍 {location}</span>}
          <span>🗓 {scheduled}</span>
        </div>
        <div className="mt-2 self-end">
          <span className={statusClass}>
            {statusLabels[status] ?? status.toUpperCase()}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FightsList() {
  const trpc = useTRPC();
  const { session } = useSession();

  const { data: myFights } = useSuspenseQuery(trpc.fight.my.queryOptions());
  const { data: judgeFights } = useSuspenseQuery(
    trpc.fight.forJudge.queryOptions(),
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 p-6 sm:space-y-12 sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-display-lg">Lutas</h1>
      </div>

      {/* Judge available fights */}
      {judgeFights.length > 0 && (
        <section className="space-y-6 sm:space-y-8">
          <h2 className="text-headline-lg">
            Disponível para arbitrar{" "}
            <span className="text-label-sm">({judgeFights.length})</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            {judgeFights.map((fight) => (
              <FightCard
                key={fight.id}
                id={fight.id}
                fighter1={fight.fighter1}
                fighter2={fight.fighter2}
                status={fight.status}
                scheduledAt={fight.scheduledAt}
                location={fight.location}
              />
            ))}
          </div>
        </section>
      )}

      {/* My fights */}
      <section className="space-y-6 sm:space-y-8">
        <h2 className="text-headline-lg">
          Suas lutas <span className="text-label-sm">({myFights.length})</span>
        </h2>
        {myFights.length === 0 ? (
          <div className="border-border flex flex-col items-center gap-6 border p-10 text-center">
            <div className="text-headline-lg">🥊</div>
            <p className="text-headline-md">Nenhuma luta ainda</p>
            <p className="text-body-md max-w-md">
              Deslize, combine e marque seu primeiro combate.
            </p>
            <Link
              href="/swipe"
              className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
            >
              Encontrar oponentes
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            {myFights.map((fight) => (
              <FightCard
                key={fight.id}
                id={fight.id}
                fighter1={fight.fighter1}
                fighter2={fight.fighter2}
                status={fight.status}
                scheduledAt={fight.scheduledAt}
                location={fight.location}
              />
            ))}
          </div>
        )}
      </section>

      {session?.user && (
        <p className="sr-only">Signed in as {session.user.name}</p>
      )}
    </div>
  );
}
