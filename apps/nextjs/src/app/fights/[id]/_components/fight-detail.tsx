"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { Button } from "@acme/ui/button";
import { Field, FieldContent, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import { useSession } from "~/auth/hooks";
import { useTRPC } from "~/trpc/react";

const statusLabels: Record<string, string> = {
  pending: "PENDING",
  scheduled: "CONFIRMADA",
  completed: "CONCLUÍDA",
  cancelled: "CANCELADA",
};

function weightLabel(w: string | null) {
  if (!w) return null;
  return w.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FightDetail({ fightId }: { fightId: string }) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const [showPropose, setShowPropose] = useState(false);
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const { data: fight } = useSuspenseQuery(
    trpc.fight.byId.queryOptions({ fightId }),
  );

  const invalidate = () =>
    void queryClient.invalidateQueries(trpc.fight.pathFilter());

  const propose = useMutation(
    trpc.fight.propose.mutationOptions({
      onSuccess: () => {
        toast.success("Proposal sent");
        setShowPropose(false);
        setLocation("");
        setScheduledAt("");
        void invalidate();
      },
      onError: (e) => toast.error(e.message || "Failed to propose"),
    }),
  );

  const confirm = useMutation(
    trpc.fight.confirm.mutationOptions({
      onSuccess: () => {
        toast.success("Fight confirmed");
        void invalidate();
      },
      onError: (e) => toast.error(e.message || "Failed to confirm"),
    }),
  );

  const acceptJudge = useMutation(
    trpc.fight.acceptJudge.mutationOptions({
      onSuccess: () => {
        toast.success("You are now the judge");
        void invalidate();
      },
      onError: (e) => toast.error(e.message || "Failed to accept"),
    }),
  );

  const complete = useMutation(
    trpc.fight.complete.mutationOptions({
      onSuccess: () => {
        toast.success("Fight completed");
        void invalidate();
      },
      onError: (e) => toast.error(e.message || "Failed to complete"),
    }),
  );

  const cancel = useMutation(
    trpc.fight.cancel.mutationOptions({
      onSuccess: () => {
        toast.success("Fight cancelled");
        void invalidate();
      },
      onError: (e) => toast.error(e.message || "Failed to cancel"),
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
      toast.error("Please choose a date and time");
      return;
    }
    propose.mutate({
      fightId,
      location: location || "TBD",
      lat: 0,
      lng: 0,
      scheduledAt: new Date(scheduledAt).toISOString(),
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-display-lg">Luta</h1>
        {/* Status chip - no red to avoid multiple red elements; red reserved for confirm button */}
        <span className="bg-foreground text-background text-label-sm rounded-none px-3 py-1">
          {statusLabels[fight.status] ?? fight.status.toUpperCase()}
        </span>
      </div>

      {/* Fighters */}
      <div className="border-border bg-background grid grid-cols-[1fr_auto_1fr] items-center gap-6 border-t p-6">
        {[fight.fighter1, fight.fighter2].map((fighter) => (
          <div
            key={fighter.id}
            className="flex flex-col items-center gap-4 text-center"
          >
            {fighter.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fighter.image}
                alt={fighter.name}
                className="border-border h-10 w-10 rounded-none border object-cover"
              />
            ) : (
              <div className="bg-foreground text-background flex h-10 w-10 items-center justify-center rounded-none">
                {fighter.name.charAt(0)}
              </div>
            )}
            <p className="text-headline-md">{fighter.name}</p>
            {fighter.nickname && (
              <p className="text-body-md text-muted-foreground">
                "{fighter.nickname}"
              </p>
            )}
          </div>
        ))}
        <span className="text-display-lg">VS</span>
      </div>

      {/* Details */}
      <div className="border-border bg-background space-y-4 border-t p-6">
        <div className="flex justify-between">
          <span className="text-label-bold">LOCAL</span>
          <span className="text-body-md">{fight.location ?? "TBD"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-label-bold">DATA/HORÁRIO</span>
          <span className="text-body-md">
            {fight.scheduledAt
              ? new Date(fight.scheduledAt).toLocaleString()
              : "TBD"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-label-bold">JUIZ</span>
          <span className="text-body-md">
            {fight.judge ? fight.judge.name : "Não atribuído"}
          </span>
        </div>
        {fight.winnerId && (
          <div className="flex justify-between">
            <span className="text-label-bold">Vencedor</span>
            <span className="text-body-md">
              {fight.winnerId === fight.fighter1Id
                ? fight.fighter1.name
                : fight.fighter2.name}
            </span>
          </div>
        )}
        {fight.judge?.nickname && (
          <div className="flex justify-between">
            <span className="text-label-bold">Apelido do Juiz</span>
            <span className="text-body-md">
              {weightLabel(fight.judge.nickname)}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {isParticipant && fight.status !== "completed" && (
        <div className="border-border bg-background space-y-6 border-t p-6">
          {/* Pending: propose / confirm / accept judge / cancel */}
          {fight.status === "pending" && (
            <>
              {!hasProposal && (isFighter1 || isFighter2) && (
                <Button
                  className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
                  onClick={() => setShowPropose((v) => !v)}
                >
                  Propor detalhes da luta
                </Button>
              )}

              {showPropose && (
                <form onSubmit={handlePropose} className="space-y-6">
                  <Field>
                    <FieldLabel>LOCAL</FieldLabel>
                    <FieldContent>
                      <Input
                        type="text"
                        placeholder="Academia / Cidade"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border-border bg-background focus:bg-muted focus:border-border text-body-md h-12 rounded-none border-2 px-4"
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>DATA & HORÁRIO</FieldLabel>
                    <FieldContent>
                      <Input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        required
                        className="border-border bg-background focus:bg-muted focus:border-border text-body-md h-12 rounded-none border-2 px-4"
                      />
                    </FieldContent>
                  </Field>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={propose.isPending}
                      className="bg-foreground text-background border-foreground hover:bg-background hover:text-foreground text-label-bold h-12 border-2 px-6"
                    >
                      {propose.isPending ? "Enviando..." : "Enviar proposta"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPropose(false)}
                      className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}

              {hasProposal && !isProposer && (isFighter1 || isFighter2) && (
                <Button
                  className="bg-primary text-primary-foreground border-primary hover:bg-foreground hover:border-foreground text-label-bold h-12 border-2 px-6"
                  onClick={() => confirm.mutate({ fightId })}
                  disabled={confirm.isPending}
                >
                  {confirm.isPending ? "Confirmando..." : "Confirmar luta"}
                </Button>
              )}

              {!fight.judge && (
                <Button
                  variant="outline"
                  onClick={() => acceptJudge.mutate({ fightId })}
                  disabled={acceptJudge.isPending}
                  className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
                >
                  {acceptJudge.isPending ? "Aceitando..." : "Aceitar como juiz"}
                </Button>
              )}
            </>
          )}

          {/* Scheduled: complete / cancel */}
          {fight.status === "scheduled" && (
            <div className="border-border bg-background space-y-6 border-t p-6">
              <div className="flex flex-wrap gap-3">
                {fight.fighter1Id && fight.fighter2Id && (
                  <>
                    <Button
                      variant="outline"
                      className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
                      onClick={() =>
                        complete.mutate({ fightId, winnerId: fight.fighter1Id })
                      }
                      disabled={complete.isPending}
                    >
                      {complete.isPending
                        ? "Completando..."
                        : `${fight.fighter1.name} vence`}
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
                      onClick={() =>
                        complete.mutate({ fightId, winnerId: fight.fighter2Id })
                      }
                      disabled={complete.isPending}
                    >
                      {complete.isPending
                        ? "Completando..."
                        : `${fight.fighter2.name} vence`}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => cancel.mutate({ fightId })}
                disabled={cancel.isPending}
                className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
              >
                {cancel.isPending ? "Cancelando..." : "Cancelar luta"}
              </Button>
            </div>
          )}

          {/* Pending/scheduled: cancel */}
          {(fight.status === "pending" || fight.status === "scheduled") && (
            <div className="border-border bg-background space-y-6 border-t p-6">
              <Button
                variant="outline"
                onClick={() => cancel.mutate({ fightId })}
                disabled={cancel.isPending}
                className="bg-background border-foreground text-foreground hover:bg-foreground hover:text-background text-label-bold h-12 border-2 px-6"
              >
                {cancel.isPending ? "Cancelando..." : "Cancelar luta"}
              </Button>
            </div>
          )}
        </div>
      )}

      {!isParticipant && (
        <p className="border-border bg-background border-t p-4 text-center text-sm">
          Você não é participante desta luta.
        </p>
      )}

      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/fights/${fightId}/chat`)}
        >
          💬 Chat
        </Button>
        <Button variant="outline" onClick={() => router.push("/fights")}>
          ← Back to fights
        </Button>
      </div>
    </div>
  );
}
