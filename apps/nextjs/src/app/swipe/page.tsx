import { redirect } from "next/navigation";

import { getCaller, HydrateClient, prefetch, trpc } from "~/trpc/server";
import { SwipeCandidates } from "./_components/swipe-candidates";

export default async function SwipePage() {
  const caller = await getCaller();
  const profile = await caller.profile.getMe();

  if (!profile) {
    redirect("/onboarding");
  }

  prefetch(trpc.swipe.candidates.queryOptions({}));

  return (
    <HydrateClient>
      <SwipeCandidates />
    </HydrateClient>
  );
}
