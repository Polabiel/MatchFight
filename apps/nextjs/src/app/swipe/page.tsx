import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { SwipeCandidates } from "./_components/swipe-candidates";

export default function SwipePage() {
  prefetch(trpc.swipe.candidates.queryOptions({}));

  return (
    <HydrateClient>
      <SwipeCandidates />
    </HydrateClient>
  );
}
