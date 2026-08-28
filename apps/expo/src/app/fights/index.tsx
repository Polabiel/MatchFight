import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { trpc } from "~/utils/api";

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

function FightRow({
  id,
  fighter1Name,
  fighter2Name,
  status,
  scheduledAt,
  location,
}: {
  id: string;
  fighter1Name: string;
  fighter2Name: string;
  status: string;
  scheduledAt: Date | null;
  location: string | null;
}) {
  const scheduled = scheduledAt
    ? new Date(scheduledAt).toLocaleString()
    : "Date TBD";
  const style = statusStyles[status] ?? "bg-muted text-muted-foreground";

  return (
    <Link href={`/fights/${id}`} asChild>
      <Pressable className="border-border bg-card flex flex-col gap-2 rounded-2xl border p-5">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="font-semibold">
            {fighter1Name} <Text className="text-muted-foreground">vs</Text>{" "}
            {fighter2Name}
          </Text>
          <Text className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
            {statusLabels[status] ?? status}
          </Text>
        </View>
        <View className="gap-1">
          {location ? (
            <Text className="text-muted-foreground text-sm">📍 {location}</Text>
          ) : null}
          <Text className="text-muted-foreground text-sm">🗓 {scheduled}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

function FightSection({
  title,
  fights,
}: {
  title: string;
  fights: {
    id: string;
    status: string;
    scheduledAt: Date | null;
    location: string | null;
    fighter1: { name: string } | null;
    fighter2: { name: string } | null;
  }[];
}) {
  if (fights.length === 0) return null;
  return (
    <View className="gap-3">
      <Text className="text-lg font-semibold">
        {title}{" "}
        <Text className="text-muted-foreground text-sm">({fights.length})</Text>
      </Text>
      {fights.map((fight) => (
        <FightRow
          key={fight.id}
          id={fight.id}
          fighter1Name={fight.fighter1?.name ?? "Unknown"}
          fighter2Name={fight.fighter2?.name ?? "Unknown"}
          status={fight.status}
          scheduledAt={fight.scheduledAt}
          location={fight.location}
        />
      ))}
    </View>
  );
}

export default function Fights() {
  const myFights = useQuery(trpc.fight.my.queryOptions());
  const judgeFights = useQuery(trpc.fight.forJudge.queryOptions());

  if (myFights.isLoading || judgeFights.isLoading) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <Stack.Screen options={{ title: "Fights" }} />
      <View className="bg-background h-full w-full gap-6 p-4">
        <Text className="text-3xl font-extrabold">Fights</Text>

        <FightSection
          title="Available to officiate"
          fights={judgeFights.data ?? []}
        />

        <View className="gap-3">
          <Text className="text-lg font-semibold">
            Your fights{" "}
            <Text className="text-muted-foreground text-sm">
              ({(myFights.data ?? []).length})
            </Text>
          </Text>
          {(myFights.data ?? []).length === 0 ? (
            <View className="border-border flex items-center gap-3 rounded-2xl border border-dashed p-8">
              <Text className="text-4xl">🥊</Text>
              <Text className="font-semibold">No fights yet</Text>
              <Text className="text-muted-foreground text-center text-sm">
                Swipe and match with other fighters to schedule your first fight.
              </Text>
              <Link
                href="/"
                className="bg-primary mt-2 rounded-md px-4 py-2"
              >
                <Text className="font-semibold text-primary-foreground">
                  Find opponents
                </Text>
              </Link>
            </View>
          ) : (
            <FightSection title="" fights={myFights.data ?? []} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
