import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { trpc } from "~/utils/api";
import { authClient } from "~/utils/auth";

const weightClasses = [
  { value: "", label: "All" },
  { value: "flyweight", label: "Flyweight" },
  { value: "bantamweight", label: "Bantamweight" },
  { value: "featherweight", label: "Featherweight" },
  { value: "lightweight", label: "Lightweight" },
  { value: "welterweight", label: "Welterweight" },
  { value: "middleweight", label: "Middleweight" },
  { value: "light_heavyweight", label: "Light Heavyweight" },
  { value: "heavyweight", label: "Heavyweight" },
] as const;

function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // Check if user is authenticated but has no profile (first time)
  const profileQuery = useQuery({
    ...trpc.profile.getMe.queryOptions(),
    enabled: !!session,
  });

  const isFirstTime =
    !!session && !profileQuery.isLoading && !profileQuery.data;

  useEffect(() => {
    if (isFirstTime) {
      router.replace("/onboarding");
    }
  }, [isFirstTime, router]);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center gap-6 p-6">
        <Text className="text-display-lg">
          Match<Text className="text-primary">Fight</Text>
        </Text>
        <Text className="text-body-md text-muted-foreground text-center">
          Find your next opponent. Swipe, match, fight.
        </Text>
        <Pressable
          onPress={() =>
            authClient.signIn.social({ provider: "discord", callbackURL: "/" })
          }
          className="bg-primary text-primary-foreground border-primary text-label-bold flex h-12 items-center justify-center border-2 px-6"
        >
          <Text className="text-label-bold">Sign in with Discord</Text>
        </Pressable>
      </View>
    );
  }

  // If authenticated but no profile, redirect to onboarding
  if (isFirstTime) {
    return null; // Avoid flash while useEffect performs the redirect
  }

  return <>{children}</>;
}

function SwipeCard() {
  const queryClient = useQueryClient();
  const [weightClass, setWeightClass] = useState<
    (typeof weightClasses)[number]["value"] | undefined
  >(undefined);
  const [index, setIndex] = useState(0);
  const [matched, setMatched] = useState<{
    name: string;
    nickname: string;
    fightId: string;
  } | null>(null);

  const candidatesQuery = useQuery(
    trpc.swipe.candidates.queryOptions({
      weightClass: weightClass === "" ? undefined : weightClass,
    }),
  );

  const like = useMutation(
    trpc.swipe.like.mutationOptions({
      onSuccess: (data) => {
        const candidate = candidatesQuery.data?.[index];
        if (data.matched && data.fightId && candidate) {
          setMatched({
            name: candidate.name,
            nickname: candidate.nickname,
            fightId: data.fightId,
          });
        } else {
          setIndex((i) => i + 1);
        }
      },
    }),
  );

  const pass = useMutation(
    trpc.swipe.pass.mutationOptions({
      onSuccess: () => setIndex((i) => i + 1),
    }),
  );

  const candidates = candidatesQuery.data ?? [];
  const current = candidates[index];

  if (candidatesQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (candidatesQuery.isError) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-body-md text-destructive text-center">
          Failed to load candidates
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* Weight filter chips */}
      <View className="flex-row flex-wrap gap-2">
        {weightClasses.map((wc) => {
          const active = (weightClass ?? "") === wc.value;
          return (
            <Pressable
              key={wc.value}
              onPress={() => {
                setWeightClass(wc.value || undefined);
                setIndex(0);
              }}
              className={`rounded-none px-3 py-1 ${
                active ? "bg-primary" : "bg-muted"
              }`}
            >
              <Text
                className={`text-label-sm ${
                  active ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {wc.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!current ? (
        <View className="flex-1 items-center justify-center gap-4 p-6">
          <Text className="text-headline-lg">LUTAR</Text>
          <Text className="text-headline-lg">No more candidates</Text>
          <Text className="text-body-md text-muted-foreground text-center">
            You've seen everyone in this weight class.
          </Text>
          <Pressable
            onPress={() => {
              setIndex(0);
              void queryClient.invalidateQueries(
                trpc.swipe.candidates.pathFilter(),
              );
            }}
            className="bg-background border-foreground text-foreground text-label-bold flex h-12 items-center justify-center rounded-none border-2 px-6"
          >
            <Text className="text-label-bold">Refresh</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View className="border-border bg-card w-full overflow-hidden rounded-none border">
            <View className="bg-muted h-48 w-full overflow-hidden">
              {current.image ? (
                <Image
                  source={{ uri: current.image }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-full items-center justify-center">
                  <Text className="text-headline-lg">LUTAR</Text>
                </View>
              )}
            </View>

            <View className="gap-3 p-5">
              {current.bio ? (
                <Text className="text-body-md text-muted-foreground">
                  {current.bio}
                </Text>
              ) : null}
              <View className="flex-row flex-wrap gap-2">
                {current.weightClass ? (
                  <View className="bg-primary text-primary-foreground text-label-sm rounded-none px-3 py-1">
                    {current.weightClass
                      .replace("_", " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </View>
                ) : null}
                <View className="bg-foreground text-background text-label-sm rounded-none px-3 py-1">
                  {current.wins}-{current.losses}
                </View>
                {current.location ? (
                  <View className="bg-foreground text-background text-label-sm rounded-none px-3 py-1">
                    LOCAL {current.location}
                  </View>
                ) : null}
              </View>

              <View className="mt-2 flex-row items-center justify-center gap-6">
                <Pressable
                  onPress={() => pass.mutate({ targetId: current.id })}
                  disabled={pass.isPending || like.isPending}
                  className="bg-background border-foreground text-foreground flex h-12 w-12 items-center justify-center rounded-none border-2"
                >
                  <Text>✕</Text>
                </Pressable>
                <Pressable
                  onPress={() => like.mutate({ targetId: current.id })}
                  disabled={pass.isPending || like.isPending}
                  className="bg-foreground text-background flex h-12 w-12 items-center justify-center rounded-none"
                >
                  <Text>✓</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Match modal */}
          {matched ? (
            <View className="bg-foreground/50 absolute inset-0 z-50 items-center justify-center p-4">
              <View className="border-border bg-card w-full max-w-sm items-center gap-4 rounded-none border p-8">
                <View className="bg-foreground flex h-16 w-16 items-center justify-center rounded-none">
                  <Text className="text-background text-label-bold">MATCH</Text>
                </View>
                <Text className="text-headline-lg">It's a Match!</Text>
                <Text className="text-body-md text-muted-foreground text-center">
                  You and <Text className="text-body-md">{matched.name}</Text> (
                  {matched.nickname}) liked each other.
                </Text>
                <Link
                  href={`/fights/${matched.fightId}`}
                  className="bg-background border-foreground text-foreground text-label-bold flex h-12 items-center justify-center rounded-none border-2 px-6"
                >
                  <Text className="text-label-bold">View fight</Text>
                </Link>
                <Pressable onPress={() => setMatched(null)}>
                  <Text className="text-body-md text-muted-foreground">
                    Keep swiping
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </>
      )}
    </>
  );
}

export default function Index() {
  return (
    <SafeAreaView className="bg-background flex-1">
      <Stack.Screen options={{ title: "Find your opponent" }} />
      <View className="bg-background flex-1 gap-4 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-display-lg">
            Match<Text className="text-primary">Fight</Text>
          </Text>
          <View className="flex-row gap-4">
            <Link href="/fights">
              <Text className="text-body-md text-foreground">Fights</Text>
            </Link>
            <Link href="/profile">
              <Text className="text-body-md text-foreground">Profile</Text>
            </Link>
          </View>
        </View>
        <AuthGate>
          <SwipeCard />
        </AuthGate>
      </View>
    </SafeAreaView>
  );
}
