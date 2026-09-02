import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ProfileView } from "./_components/profile-view";

export default function ProfilePage() {
  prefetch(trpc.profile.getMe.queryOptions());

  return (
    <HydrateClient>
      <ProfileView />
    </HydrateClient>
  );
}
