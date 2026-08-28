import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ProfileEditForm } from "./_components/profile-edit-form";

export default function ProfileEditPage() {
  prefetch(trpc.profile.getMe.queryOptions());

  return (
    <HydrateClient>
      <ProfileEditForm />
    </HydrateClient>
  );
}
