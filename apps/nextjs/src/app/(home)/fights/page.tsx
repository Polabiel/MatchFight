import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { FightsList } from "./_components/fights-list";

export default function FightsPage() {
  prefetch(trpc.fight.my.queryOptions());
  prefetch(trpc.fight.forJudge.queryOptions());

  return (
    <HydrateClient>
      <FightsList />
    </HydrateClient>
  );
}
