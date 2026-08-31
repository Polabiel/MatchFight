"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@acme/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Separator } from "@acme/ui/separator";

import { useTRPC } from "~/trpc/react";

export function ProfileView() {
  const router = useRouter();
  const trpc = useTRPC();

  const { data: profile } = useSuspenseQuery(trpc.profile.getMe.queryOptions());

  if (!profile) {
    return (
      <div className="flex min-h-[24rem] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-none">
            <span className="text-muted-foreground text-body-lg">👤</span>
          </div>
        </div>
        <h1 className="text-headline-lg mb-4">No profile yet</h1>
        <p className="text-body-md text-muted-foreground mb-6 max-w-xl">
          Create your profile to get started on MatchFight. Add your nickname,
          bio, role, weight class and more to connect with other fighters and
          judges.
        </p>
        <Link href="/profile/edit" className="button">
          Create your profile
        </Link>
      </div>
    );
  }

  const createdDate = new Date(profile.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let joinedDate = "Just now";
  if (diffDays === 0) joinedDate = "Today";
  else if (diffDays === 1) joinedDate = "Yesterday";
  else if (diffDays < 7) joinedDate = `${diffDays} days ago`;
  else if (diffDays < 30) joinedDate = `${Math.ceil(diffDays / 7)} weeks ago`;
  else if (diffDays < 365)
    joinedDate = `${Math.ceil(diffDays / 30)} months ago`;
  else joinedDate = `${Math.ceil(diffDays / 365)} years ago`;

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0">
          {profile.user.image ? (
            <img
              src={profile.user.image}
              alt={`${profile.user.name}'s avatar`}
              width={100}
              height={100}
              className="border-foreground h-full w-full rounded-none object-cover"
            />
          ) : (
            <div className="bg-foreground text-background text-headline-md border-foreground flex h-20 w-20 items-center justify-center rounded-none border font-extrabold">
              {profile.user.name.substring(0, 2) || "JJ"}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h1 className="text-headline-lg">{profile.user.name}</h1>
          <p className="text-body-md text-muted-foreground">
            {profile.nickname}
          </p>
          <span className="bg-foreground text-background text-label-bold px-3 py-1">
            {profile.role === "fighter"
              ? "Fighter"
              : profile.role === "judge"
                ? "Judge"
                : "Both"}
          </span>
        </div>
        <div className="border-foreground mb-8 border-2 p-6">
          <div className="text-display-lg">
            {profile.wins}-{profile.losses}
          </div>
          <div className="text-label-bold">Record</div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        {profile.bio && (
          <div>
            <h3 className="text-label-bold mb-1">Bio</h3>
            <p className="text-muted-foreground">{profile.bio}</p>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-label-bold">Details</h3>
          <div className="grid gap-2 text-body-md">
            {profile.weightClass && (
              <div className="flex items-center gap-2">
                <span className="text-label-sm">Weight class:</span>
                <span className="text-headline-md">
                  {profile.weightClass
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-label-sm">Record:</span>
              <span className="text-headline-md">
                {profile.wins}-{profile.losses}
              </span>
            </div>
            {profile.location && (
              <div className="flex items-center gap-2">
                <span className="text-label-sm">Location:</span>
                <span className="text-headline-md">{profile.location}</span>
              </div>
            )}
          </div>
        </div>
        <div className="border-t pt-4">
          <h3 className="text-label-bold mb-2">Account</h3>
          <p className="text-body-md text-muted-foreground">
            Joined {joinedDate}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => router.push("/profile/edit")}
          className="h-12 px-6"
        >
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
