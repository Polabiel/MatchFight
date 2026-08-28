import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
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

  const isFirstTime = !!session && !profileQuery.isLoading && !profileQuery.data;

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
        <Text className="text-5xl font-extrabold">
          Match<span className="text-primary">Fight</span>
        </Text>
        <Text className="text-muted-foreground text-center">
          Find your next opponent. Swipe, match, fight.
        </Text>
        <Pressable
          onPress={() =>
            authClient.signIn.social({ provider: "discord", callbackURL: "/" })
          }
          className="bg-primary flex items-center rounded-md px-6 py-3"
        >
          <Text className="text-primary-foreground font-semibold">
            Sign in with Discord
          </Text>
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
        <Text className="text-destructive text-center">
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
              className={`rounded-full px-3 py-1 ${
                active ? "bg-primary" : "bg-muted"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
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
          <Text className="text-4xl">🥊</Text>
          <Text className="text-xl font-bold">No more candidates</Text>
          <Text className="text-muted-foreground text-center">
            You've seen everyone in this weight class.
          </Text>
          <Pressable
            onPress={() => {
              setIndex(0);
              void queryClient.invalidateQueries(
                trpc.swipe.candidates.pathFilter(),
              );
            }}
            className="bg-muted rounded-md px-4 py-2"
          >
            <Text className="font-medium">Refresh</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View className="border-border bg-card w-full overflow-hidden rounded-2xl border shadow-lg">
            <View className="bg-muted h-64 w-full">
              {current.image ? (
                <Text className="text-muted-foreground p-4 text-sm">
                  {current.name}
                </Text>
              ) : null}
              <View className="h-full items-center justify-center">
                <Text className="text-6xl">🥊</Text>
              </View>
              <View className="absolute inset-x-0 bottom-0 bg-black/70 p-4">
                <Text className="text-2xl font-bold text-white">
                  {current.name}
                </Text>
                <Text className="text-sm text-white/90">
                  "{current.nickname}"
                </Text>
              </View>
            </View>

            <View className="gap-3 p-5">
              {current.bio ? (
                <Text className="text-muted-foreground text-sm">
                  {current.bio}
                </Text>
              ) : null}
              <View className="flex-row flex-wrap gap-2">
                {current.weightClass ? (
                  <Text className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {current.weightClass
                      .replace("_", " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Text>
                ) : null}
                <Text className="bg-muted rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {current.wins}-{current.losses}
                </Text>
                {current.location ? (
                  <Text className="bg-muted rounded-full px-2.5 py-0.5 text-xs font-medium">
                    📍 {current.location}
                  </Text>
                ) : null}
              </View>

              <View className="mt-2 flex-row items-center justify-center gap-8">
                <Pressable
                  onPress={() => pass.mutate({ targetId: current.id })}
                  disabled={pass.isPending || like.isPending}
                  className="bg-muted h-14 w-14 items-center justify-center rounded-full"
                >
                  <Text className="text-xl">✕</Text>
                </Pressable>
                <Pressable
                  onPress={() => like.mutate({ targetId: current.id })}
                  disabled={pass.isPending || like.isPending}
                  className="bg-primary h-14 w-14 items-center justify-center rounded-full"
                >
                  <Text className="text-primary-foreground text-xl">✓</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Match modal */}
      {matched ? (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/70 p-4">
          <View className="border-border bg-card w-full max-w-sm items-center gap-4 rounded-2xl border p-8">
            <Text className="text-6xl">🎉</Text>
            <Text className="text-3xl font-extrabold">It's a Match!</Text>
            <Text className="text-muted-foreground text-center">
              You and{" "}
              <Text className="text-foreground font-semibold">
                {matched.name}
              </Text>{" "}
              ({matched.nickname}) liked each other.
            </Text>
            <Link
              href={`/fights/${matched.fightId}`}
              className="bg-primary w-full items-center rounded-md py-2"
            >
              <Text className="text-primary-foreground font-semibold">
                View fight
              </Text>
            </Link>
            <Pressable onPress={() => setMatched(null)}>
              <Text className="text-muted-foreground">Keep swiping</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </>
  );
}

export default function Index() {
  return (
    <SafeAreaView className="bg-background flex-1">
      <Stack.Screen options={{ title: "Find your opponent" }} />
      <View className="bg-background h-full w-full gap-4 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-extrabold">
            Match<span className="text-primary">Fight</span>
          </Text>
          <View className="flex-row gap-4">
            <Link href="/fights">
              <Text className="text-primary font-medium">Fights</Text>
            </Link>
            <Link href="/profile">
              <Text className="text-primary font-medium">Profile</Text>
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
