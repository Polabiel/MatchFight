import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { FightDetail } from "./_components/fight-detail";

export default async function FightDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  prefetch(trpc.fight.byId.queryOptions({ fightId: id }));

  return (
    <HydrateClient>
      <FightDetail fightId={id} />
    </HydrateClient>
  );
}