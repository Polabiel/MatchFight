import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { PublicProfileView } from "./_components/public-profile-view";

export default async function PublicProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  prefetch(trpc.profile.getByUser.queryOptions({ userId: id }));

  return (
    <HydrateClient>
      <PublicProfileView userId={id} />
    </HydrateClient>
  );
}
