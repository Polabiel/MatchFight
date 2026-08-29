"use client";

import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Separator } from "@acme/ui/separator";

import { useTRPC } from "~/trpc/react";

export function PublicProfileView({ userId }: { userId: string }) {
  const trpc = useTRPC();

  const { data: profile } = useSuspenseQuery(
    trpc.profile.getByUser.queryOptions({ userId }),
  );

  if (!profile) {
    return (
      <div className="flex min-h-[24rem] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-none">
            <span className="text-muted-foreground text-lg">❓</span>
          </div>
        </div>
        <h1 className="mb-4 text-headline-lg">Profile not found</h1>
        <p className="text-body-md text-muted-foreground mb-6">
          The profile you're looking for doesn't exist or hasn't been created
          yet.
        </p>
        <Link href="/profile" className="button button-outline">
          Back to your profile
        </Link>
      </div>
    );
  }

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
              className="w-full h-full object-cover border-foreground rounded-none"
            />
          ) : (
<div className="w-20 h-20 bg-foreground flex items-center justify-center text-background text-headline-md font-extrabold border border-foreground rounded-none">
               {profile.user.name?.substring(0, 2) || "JJ"}
             </div>
          )}
        </div>
        <div className="space-y-2">
          <h1 className="text-headline-lg">{profile.user.name}</h1>
          <p className="text-body-md text-muted-foreground">{profile.nickname}</p>
<span className="bg-foreground text-background px-3 py-1 text-label-bold">
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
            <h3 className="text-label-bold mb-1">Bio</h3>
            <p className="text-muted-foreground">{profile.bio}</p>
          </div>
        )}
<div className="space-y-2">
             <h3 className="text-label-bold">Details</h3>
             <div className="grid gap-2 text-sm">
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
      </div>

      <div className="flex justify-center">
        <Link href={`/swipe?target=${userId}`} className="button bg-primary text-primary-foreground border-2 border-primary hover:bg-foreground hover:border-foreground h-12 px-6 text-label-bold">
          Send Fight Request
        </Link>
      </div>
    </div>
  );
}
