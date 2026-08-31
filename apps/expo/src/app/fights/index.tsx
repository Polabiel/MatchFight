import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { trpc } from "~/utils/api";

const statusStyles: Record<string, string> = {
  pending: "bg-foreground text-background",
  scheduled: "bg-foreground text-background",
  completed: "bg-foreground text-background",
  cancelled: "bg-foreground text-background",
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
      <Pressable className="border-border bg-card flex flex-col gap-2 rounded-none border p-5">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-headline-md">
            {fighter1Name} <Text className="text-muted-foreground">vs</Text>{" "}
            {fighter2Name}
          </Text>
          <Text
            className={`rounded-none px-3 py-1 text-label-sm ${style}`}
          >
            {statusLabels[status] ?? status}
          </Text>
        </View>
        <View className="gap-1">
          {location ? (
            <Text className="text-body-md text-muted-foreground">LOCAL {location}</Text>
          ) : null}
          <Text className="text-body-md text-muted-foreground">DATA {scheduled}</Text>
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
    <View className="gap-4">
      <Text className="text-headline-md">
        {title}{" "}
        <Text className="text-body-md text-muted-foreground">({fights.length})</Text>
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
      <View className="bg-background flex-1 gap-6 p-4">
        <Text className="text-headline-lg">Fights</Text>

        <FightSection
          title="Available to officiate"
          fights={judgeFights.data ?? []}
        />

        <View className="gap-4">
          <Text className="text-headline-md">
            Your fights{" "}
            <Text className="text-body-md text-muted-foreground">
              ({(myFights.data ?? []).length})
            </Text>
          </Text>
          {(myFights.data ?? []).length === 0 ? (
            <View className="border-border flex items-center gap-3 rounded-none border border-dashed p-8">
              <Text className="text-headline-lg">LUTAR</Text>
              <Text className="text-headline-lg">No fights yet</Text>
              <Text className="text-body-md text-muted-foreground text-center">
                Swipe and match with other fighters to schedule your first
                fight.
              </Text>
              <Link href="/" className="bg-primary text-primary-foreground h-12 px-6 text-label-bold rounded-none flex items-center justify-center">
                <Text className="text-label-bold">
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