'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTRPC } from '~/trpc/react';
import { Separator } from '@acme/ui/separator';

export function PublicProfileView({ userId }: { userId: string }) {
  const trpc = useTRPC();

  const { data: profile } = useSuspenseQuery(
    trpc.profile.getByUser.queryOptions({ userId })
  );

  if (!profile) {
    return (
      <div className="flex min-h-[24rem] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-lg">❓</span>
          </div>
        </div>
        <h1 className="mb-4 text-2xl font-bold">Profile not found</h1>
        <p className="mb-6 text-muted-foreground">
          The profile you're looking for doesn't exist or hasn't been created yet.
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
          <img
            src={profile.user.image ?? '/default-avatar.png'}
            alt={`${profile.user.name}'s avatar`}
            width={100}
            height={100}
            className="rounded-full border border-ring/20 object-cover"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{profile.user.name}</h1>
          <h2 className="text-xl font-semibold">{profile.nickname}</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {profile.role === 'fighter' ? 'Fighter' : profile.role === 'judge' ? 'Judge' : 'Both'}
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        {profile.bio && (
          <div>
            <h3 className="font-semibold mb-1">Bio</h3>
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
                  {profile.weightClass.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Record:</span>
              <span className="font-medium">{profile.wins}-{profile.losses}</span>
            </div>
            {profile.location && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{profile.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link href={`/swipe?target=${userId}`} className="button">
          Send Fight Request
        </Link>
      </div>
    </div>
  );
}