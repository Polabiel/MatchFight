"use client";

import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useSession } from "~/auth/hooks";
import { useTRPC } from "~/trpc/react";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  scheduled: "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
  cancelled: "bg-red-500/10 text-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

function FightCard({
  id,
  fighter1Name,
  fighter2Name,
  status,
  scheduledAt,
  location,
}: {
  id: string;
  fighter1Name: string;
  fighter2Name: string;
  status: string;
  scheduledAt: Date | null;
  location: string | null;
}) {
  const scheduled = scheduledAt
    ? new Date(scheduledAt).toLocaleString()
    : "Date TBD";

  return (
    <Link
      href={`/fights/${id}`}
      className="border-border bg-card hover:bg-accent/50 flex flex-col gap-3 rounded-2xl border p-5 shadow-sm transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">
          {fighter1Name} <span className="text-muted-foreground">vs</span>{" "}
          {fighter2Name}
        </span>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            statusStyles[status] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {statusLabels[status] ?? status}
        </span>
      </div>
      <div className="text-muted-foreground flex flex-col gap-1 text-sm">
        {location && <span>📍 {location}</span>}
        <span>🗓 {scheduled}</span>
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
    <div className="mx-auto w-full max-w-3xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Fights</h1>
      </div>

      {/* Judge available fights */}
      {judgeFights.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Available to officiate{" "}
            <span className="text-muted-foreground text-sm font-normal">
              ({judgeFights.length})
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {judgeFights.map((fight) => (
              <FightCard
                key={fight.id}
                id={fight.id}
                fighter1Name={fight.fighter1.name}
                fighter2Name={fight.fighter2.name}
                status={fight.status}
                scheduledAt={fight.scheduledAt}
                location={fight.location}
              />
            ))}
          </div>
        </section>
      )}

      {/* My fights */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Your fights{" "}
          <span className="text-muted-foreground text-sm font-normal">
            ({myFights.length})
          </span>
        </h2>
        {myFights.length === 0 ? (
          <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
            <div className="text-4xl">🥊</div>
            <p className="font-semibold">No fights yet</p>
            <p className="text-muted-foreground max-w-md text-sm">
              Swipe and match with other fighters to schedule your first fight.
            </p>
            <Link
              href="/swipe"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold"
            >
              Find opponents
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {myFights.map((fight) => (
              <FightCard
                key={fight.id}
                id={fight.id}
                fighter1Name={fight.fighter1.name}
                fighter2Name={fight.fighter2.name}
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
