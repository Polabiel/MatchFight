'use client';

import { useMutation, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTRPC } from '~/trpc/react';
import { useSession } from '~/auth/hooks';
import { Button } from '@acme/ui/button';
import { Field, FieldLabel, FieldContent } from '@acme/ui/field';
import { Input } from '@acme/ui/input';
import { toast } from '@acme/ui/toast';

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  scheduled: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function weightLabel(w: string | null) {
  if (!w) return null;
  return w.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FightDetail({ fightId }: { fightId: string }) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const [showPropose, setShowPropose] = useState(false);
  const [location, setLocation] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const { data: fight } = useSuspenseQuery(
    trpc.fight.byId.queryOptions({ fightId }),
  );

  const invalidate = () =>
    void queryClient.invalidateQueries(trpc.fight.pathFilter());

  const propose = useMutation(
    trpc.fight.propose.mutationOptions({
      onSuccess: () => {
        toast.success('Proposal sent');
        setShowPropose(false);
        setLocation('');
        setScheduledAt('');
        void invalidate();
      },
      onError: (e) => toast.error(e.message || 'Failed to propose'),
    }),
  );

  const confirm = useMutation(
    trpc.fight.confirm.mutationOptions({
      onSuccess: () => {
        toast.success('Fight confirmed');
        void invalidate();
      },
      onError: (e) => toast.error(e.message || 'Failed to confirm'),
    }),
  );

  const acceptJudge = useMutation(
    trpc.fight.acceptJudge.mutationOptions({
      onSuccess: () => {
        toast.success('You are now the judge');
        void invalidate();
      },
      onError: (e) => toast.error(e.message || 'Failed to accept'),
    }),
  );

  const complete = useMutation(
    trpc.fight.complete.mutationOptions({
      onSuccess: () => {
        toast.success('Fight completed');
        void invalidate();
      },
      onError: (e) => toast.error(e.message || 'Failed to complete'),
    }),
  );

  const cancel = useMutation(
    trpc.fight.cancel.mutationOptions({
      onSuccess: () => {
        toast.success('Fight cancelled');
        void invalidate();
      },
      onError: (e) => toast.error(e.message || 'Failed to cancel'),
    }),
  );

  const userId = session?.user.id;
  const isFighter1 = fight.fighter1Id === userId;
  const isFighter2 = fight.fighter2Id === userId;
  const isParticipant = isFighter1 || isFighter2 || fight.judgeId === userId;
  const hasProposal = fight.createdById !== null;
  const isProposer = fight.createdById === userId;

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) {
      toast.error('Please choose a date and time');
      return;
    }
    propose.mutate({
      fightId,
      location: location || 'TBD',
      lat: 0,
      lng: 0,
      scheduledAt: new Date(scheduledAt).toISOString(),
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Fight</h1>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            statusStyles[fight.status] ?? 'bg-muted text-muted-foreground'
          }`}
        >
          {statusLabels[fight.status] ?? fight.status}
        </span>
      </div>

      {/* Fighters */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl border border-border bg-card p-6">
        {[fight.fighter1, fight.fighter2].map((fighter) => (
          <div
            key={fighter.id}
            className="flex flex-col items-center gap-2 text-center"
          >
            {fighter.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fighter.image}
                alt={fighter.name}
                className="h-20 w-20 rounded-full border border-ring/20 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl">
                🥊
              </div>
            )}
            <span className="font-semibold">{fighter.name}</span>
            {fighter.nickname && (
              <span className="text-sm text-muted-foreground">
                "{fighter.nickname}"
              </span>
            )}
          </div>
        ))}
        <span className="text-2xl font-bold text-muted-foreground">VS</span>
      </div>

      {/* Details */}
      <div className="space-y-2 rounded-2xl border border-border bg-card p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Location</span>
          <span className="font-medium">{fight.location ?? 'TBD'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Scheduled</span>
          <span className="font-medium">
            {fight.scheduledAt
              ? new Date(fight.scheduledAt).toLocaleString()
              : 'TBD'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Judge</span>
          <span className="font-medium">
            {fight.judge ? fight.judge.name : 'Not assigned'}
          </span>
        </div>
        {fight.winnerId && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Winner</span>
            <span className="font-medium text-green-500">
              {fight.winnerId === fight.fighter1Id
                ? fight.fighter1.name
                : fight.fighter2.name}
            </span>
          </div>
        )}
        {fight.judge && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Judge nickname</span>
            <span className="font-medium">
              {weightLabel(fight.judge.nickname)}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {isParticipant && fight.status !== 'completed' && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
          {/* Pending: propose / confirm / accept judge / cancel */}
          {fight.status === 'pending' && (
            <>
              {!hasProposal && (isFighter1 || isFighter2) && (
                <Button onClick={() => setShowPropose((v) => !v)}>
                  Propose fight details
                </Button>
              )}

              {showPropose && (
                <form onSubmit={handlePropose} className="space-y-4">
                  <Field>
                    <FieldLabel>Location</FieldLabel>
                    <FieldContent>
                      <Input
                        type="text"
                        placeholder="Gym / City"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Date &amp; time</FieldLabel>
                    <FieldContent>
                      <Input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        required
                      />
                    </FieldContent>
                  </Field>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={propose.isPending}
                    >
                      {propose.isPending ? 'Sending...' : 'Send proposal'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPropose(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {hasProposal && !isProposer && (isFighter1 || isFighter2) && (
                <Button
                  onClick={() => confirm.mutate({ fightId })}
                  disabled={confirm.isPending}
                >
                  {confirm.isPending ? 'Confirming...' : 'Confirm fight'}
                </Button>
              )}

              {!fight.judge && (
                <Button
                  variant="outline"
                  onClick={() => acceptJudge.mutate({ fightId })}
                  disabled={acceptJudge.isPending}
                >
                  {acceptJudge.isPending ? 'Accepting...' : 'Accept as judge'}
                </Button>
              )}
            </>
          )}

          {/* Scheduled: complete / cancel */}
          {fight.status === 'scheduled' && (
            <>
              <div className="flex flex-wrap gap-2">
                {fight.fighter1Id && fight.fighter2Id && (
                  <>
                    <Button
                      onClick={() =>
                        complete.mutate({ fightId, winnerId: fight.fighter1Id })
                      }
                      disabled={complete.isPending}
                    >
                      {complete.isPending
                        ? 'Completing...'
                        : `${fight.fighter1.name} wins`}
                    </Button>
                    <Button
                      onClick={() =>
                        complete.mutate({ fightId, winnerId: fight.fighter2Id })
                      }
                      disabled={complete.isPending}
                    >
                      {complete.isPending
                        ? 'Completing...'
                        : `${fight.fighter2.name} wins`}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => cancel.mutate({ fightId })}
                disabled={cancel.isPending}
              >
                {cancel.isPending ? 'Cancelling...' : 'Cancel fight'}
              </Button>
            </>
          )}

          {/* Pending/scheduled: cancel */}
          {(fight.status === 'pending' || fight.status === 'scheduled') && (
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => cancel.mutate({ fightId })}
              disabled={cancel.isPending}
            >
              {cancel.isPending ? 'Cancelling...' : 'Cancel fight'}
            </Button>
          )}
        </div>
      )}

      {!isParticipant && (
        <p className="rounded-2xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
          You are not a participant in this fight.
        </p>
      )}

      <div className="flex justify-center gap-4">
        <Button variant="ghost" onClick={() => router.push(`/fights/${fightId}/chat`)}>
          💬 Chat
        </Button>
        <Button variant="ghost" onClick={() => router.push('/fights')}>
          ← Back to fights
        </Button>
      </div>
    </div>
  );
}
