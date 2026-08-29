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
           <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-none">
             <span className="text-muted-foreground text-lg">👤</span>
           </div>
         </div>
         <h1 className="mb-4 text-headline-lg">No profile yet</h1>
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
<div className="border-2 border-foreground p-6 mb-8">
           <div className="text-display-lg">{profile.wins}-{profile.losses}</div>
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
        <div className="border-t pt-4">
          <h3 className="text-label-bold mb-2">Account</h3>
          <p className="text-body-md text-muted-foreground">Joined {joinedDate}</p>
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
