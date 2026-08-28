"use client";

import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Separator } from "@acme/ui/separator";

import { useTRPC } from "~/trpc/react";

export function ProfileView() {
  const trpc = useTRPC();

  const { data: profile } = useSuspenseQuery(trpc.profile.getMe.queryOptions());

  if (!profile) {
    return (
      <div className="flex min-h-[24rem] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
            <span className="text-muted-foreground text-lg">👤</span>
          </div>
        </div>
        <h1 className="mb-4 text-2xl font-bold">No profile yet</h1>
        <p className="text-muted-foreground mb-6 max-w-xl">
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
          <img
            src={profile.user.image ?? "/default-avatar.png"}
            alt={`${profile.user.name}'s avatar`}
            width={100}
            height={100}
            className="border-ring/20 rounded-full border object-cover"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{profile.user.name}</h1>
          <h2 className="text-xl font-semibold">{profile.nickname}</h2>
          <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
            {profile.role === "fighter"
              ? "Fighter"
              : profile.role === "judge"
                ? "Judge"
                : "Both"}
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        {profile.bio && (
          <div>
            <h3 className="mb-1 font-semibold">Bio</h3>
            <p className="text-muted-foreground">{profile.bio}</p>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="font-semibold">Details</h3>
          <div className="grid gap-2 text-sm">
            {profile.weightClass && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Weight class:</span>
                <span className="font-medium">
                  {profile.weightClass
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Record:</span>
              <span className="font-medium">
                {profile.wins}-{profile.losses}
              </span>
            </div>
            {profile.location && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{profile.location}</span>
              </div>
            )}
          </div>
        </div>
        <div className="border-t pt-4">
          <h3 className="mb-2 font-semibold">Account</h3>
          <p className="text-muted-foreground text-sm">Joined {joinedDate}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Link href="/profile/edit" className="button button-outline">
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
