import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { trpc } from "~/utils/api";
import { authClient } from "~/utils/auth";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  scheduled: "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
  cancelled: "bg-red-500/10 text-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function FightDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [showPropose, setShowPropose] = useState(false);
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const fightQuery = useQuery(trpc.fight.byId.queryOptions({ fightId: id }));

  const invalidate = () =>
    void queryClient.invalidateQueries(trpc.fight.pathFilter());

  const propose = useMutation(
    trpc.fight.propose.mutationOptions({
      onSuccess: () => {
        setShowPropose(false);
        setLocation("");
        setScheduledAt("");
        void invalidate();
      },
    }),
  );

  const confirm = useMutation(
    trpc.fight.confirm.mutationOptions({ onSuccess: () => void invalidate() }),
  );
  const acceptJudge = useMutation(
    trpc.fight.acceptJudge.mutationOptions({
      onSuccess: () => void invalidate(),
    }),
  );
  const complete = useMutation(
    trpc.fight.complete.mutationOptions({ onSuccess: () => void invalidate() }),
  );
  const cancel = useMutation(
    trpc.fight.cancel.mutationOptions({ onSuccess: () => void invalidate() }),
  );

  if (fightQuery.isLoading) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  const fight = fightQuery.data;
  if (!fight) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-muted-foreground">Fight not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const userId = session?.user.id;
  const isFighter1 = fight.fighter1Id === userId;
  const isFighter2 = fight.fighter2Id === userId;
  const isParticipant = isFighter1 || isFighter2 || fight.judgeId === userId;
  const hasProposal = fight.createdById !== null;
  const isProposer = fight.createdById === userId;
  const style = statusStyles[fight.status] ?? "bg-muted text-muted-foreground";

  const handlePropose = () => {
    if (!scheduledAt) return;
    propose.mutate({
      fightId: fight.id,
      location: location || "TBD",
      lat: 0,
      lng: 0,
      scheduledAt: new Date(scheduledAt).toISOString(),
    });
  };

  return (
    <SafeAreaView className="bg-background flex-1">
      <Stack.Screen options={{ title: "Fight" }} />
      <View className="bg-background h-full w-full gap-5 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-extrabold">Fight</Text>
          <Text className={`rounded-full px-3 py-1 text-sm font-medium ${style}`}>
            {statusLabels[fight.status] ?? fight.status}
          </Text>
        </View>

        {/* Fighters */}
        <View className="border-border bg-card flex-row items-center justify-center gap-6 rounded-2xl border p-6">
          {[fight.fighter1, fight.fighter2].map((fighter) => (
            <View key={fighter.id} className="items-center gap-2">
              <View className="bg-muted h-20 w-20 items-center justify-center rounded-full">
                <Text className="text-2xl">🥊</Text>
              </View>
              <Text className="font-semibold">{fighter.name}</Text>
              {fighter.nickname ? (
                <Text className="text-muted-foreground text-sm">
                  "{fighter.nickname}"
                </Text>
              ) : null}
            </View>
          ))}
          <Text className="text-2xl font-bold text-muted-foreground">VS</Text>
        </View>

        {/* Details */}
        <View className="border-border bg-card gap-2 rounded-2xl border p-5">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Location</Text>
            <Text className="font-medium">{fight.location ?? "TBD"}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Scheduled</Text>
            <Text className="font-medium">
              {fight.scheduledAt
                ? new Date(fight.scheduledAt).toLocaleString()
                : "TBD"}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Judge</Text>
            <Text className="font-medium">
              {fight.judge ? fight.judge.name : "Not assigned"}
            </Text>
          </View>
          {fight.winnerId ? (
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Winner</Text>
              <Text className="font-medium text-green-500">
                {fight.winnerId === fight.fighter1Id
                  ? fight.fighter1.name
                  : fight.fighter2.name}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        {isParticipant && fight.status !== "completed" ? (
          <View className="border-border bg-card gap-3 rounded-2xl border p-5">
            {fight.status === "pending" ? (
              <>
                {!hasProposal && (isFighter1 || isFighter2) ? (
                  <Pressable
                    onPress={() => setShowPropose((v) => !v)}
                    className="bg-primary items-center rounded-md py-2.5"
                  >
                    <Text className="font-semibold text-primary-foreground">
                      Propose fight details
                    </Text>
                  </Pressable>
                ) : null}

                {showPropose ? (
                  <View className="gap-3">
                    <TextInput
                      className="border-input bg-background text-foreground rounded-md border px-3 py-2"
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Location / Gym"
                    />
                    <TextInput
                      className="border-input bg-background text-foreground rounded-md border px-3 py-2"
                      value={scheduledAt}
                      onChangeText={setScheduledAt}
                      placeholder="YYYY-MM-DDTHH:mm"
                      autoCapitalize="none"
                    />
                    <Pressable
                      onPress={handlePropose}
                      disabled={propose.isPending}
                      className="bg-primary items-center rounded-md py-2.5"
                    >
                      <Text className="font-semibold text-primary-foreground">
                        {propose.isPending ? "Sending..." : "Send proposal"}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {hasProposal && !isProposer && (isFighter1 || isFighter2) ? (
                  <Pressable
                    onPress={() => confirm.mutate({ fightId: fight.id })}
                    disabled={confirm.isPending}
                    className="bg-primary items-center rounded-md py-2.5"
                  >
                    <Text className="font-semibold text-primary-foreground">
                      {confirm.isPending ? "Confirming..." : "Confirm fight"}
                    </Text>
                  </Pressable>
                ) : null}

                {!fight.judge ? (
                  <Pressable
                    onPress={() => acceptJudge.mutate({ fightId: fight.id })}
                    disabled={acceptJudge.isPending}
                    className="bg-muted items-center rounded-md py-2.5"
                  >
                    <Text className="font-medium">
                      {acceptJudge.isPending ? "Accepting..." : "Accept as judge"}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}

            {fight.status === "scheduled" ? (
              <>
                <View className="flex-row gap-2">
                  {fight.fighter1Id && fight.fighter2Id ? (
                    <>
                      <Pressable
                        onPress={() =>
                          complete.mutate({
                            fightId: fight.id,
                            winnerId: fight.fighter1Id,
                          })
                        }
                        disabled={complete.isPending}
                        className="bg-primary flex-1 items-center rounded-md py-2.5"
                      >
                        <Text className="font-semibold text-primary-foreground">
                          {fight.fighter1.name} wins
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          complete.mutate({
                            fightId: fight.id,
                            winnerId: fight.fighter2Id,
                          })
                        }
                        disabled={complete.isPending}
                        className="bg-primary flex-1 items-center rounded-md py-2.5"
                      >
                        <Text className="font-semibold text-primary-foreground">
                          {fight.fighter2.name} wins
                        </Text>
                      </Pressable>
                    </>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => cancel.mutate({ fightId: fight.id })}
                  disabled={cancel.isPending}
                  className="items-center rounded-md py-2.5"
                >
                  <Text className="text-destructive font-medium">
                    {cancel.isPending ? "Cancelling..." : "Cancel fight"}
                  </Text>
                </Pressable>
              </>
            ) : null}

            {(fight.status === "pending" || fight.status === "scheduled") ? (
              <Pressable
                onPress={() => cancel.mutate({ fightId: fight.id })}
                disabled={cancel.isPending}
                className="items-center rounded-md py-1"
              >
                <Text className="text-destructive">
                  {cancel.isPending ? "Cancelling..." : "Cancel fight"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {!isParticipant ? (
          <View className="border-border bg-card items-center rounded-2xl border p-4">
            <Text className="text-muted-foreground text-sm">
              You are not a participant in this fight.
            </Text>
          </View>
        ) : null}

        <View className="flex-row justify-center gap-4">
          <Link href={`/fights/${fight.id}/chat`} className="py-2">
            <Text className="text-primary font-medium">💬 Chat</Text>
          </Link>
          <Link href="/fights" className="py-2">
            <Text className="text-muted-foreground">← Back to fights</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
