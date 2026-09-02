import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { trpc } from "~/utils/api";

function weightLabel(w: string | null) {
  if (!w) return null;
  return w.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Profile() {
  const profileQuery = useQuery(trpc.profile.getMe.queryOptions());

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  const profile = profileQuery.data;

  return (
    <SafeAreaView className="bg-background flex-1">
      <Stack.Screen options={{ title: "Profile" }} />
      <View className="bg-background flex-1 gap-6 p-4">
        <Text className="text-headline-lg">Profile</Text>

        {!profile ? (
          <View className="flex-1 items-center justify-center gap-4 p-6">
            <Text className="text-headline-lg">👤</Text>
            <Text className="text-headline-lg">No profile yet</Text>
            <Text className="text-body-md text-muted-foreground text-center">
              Create your profile to get started on MatchFight.
            </Text>
            <Link
              href="/profile/edit"
              className="bg-primary text-primary-foreground text-label-bold flex h-12 items-center justify-center rounded-none px-6"
            >
              <Text className="text-label-bold">Create your profile</Text>
            </Link>
          </View>
        ) : (
          <>
            <View className="flex-row items-center gap-4">
              <View className="bg-muted h-20 w-20 items-center justify-center rounded-none">
                <Text className="text-headline-lg">👤</Text>
              </View>
              <View className="gap-1">
                <Text className="text-headline-md">{profile.user.name}</Text>
                <Text className="text-body-lg font-semibold">
                  "{profile.nickname}"
                </Text>
                <View className="bg-foreground text-background text-label-sm rounded-none px-3 py-1">
                  {profile.role === "fighter"
                    ? "FIGHTER"
                    : profile.role === "judge"
                      ? "JUDGE"
                      : "BOTH"}
                </View>
              </View>
            </View>

            <View className="border-border bg-card gap-3 rounded-none border p-5">
              {profile.bio ? (
                <View className="gap-1">
                  <Text className="text-label-bold">Bio</Text>
                  <Text className="text-body-md text-muted-foreground">
                    {profile.bio}
                  </Text>
                </View>
              ) : null}
              <View className="gap-2">
                <Text className="text-label-bold">Details</Text>
                {profile.weightClass ? (
                  <View className="flex-row justify-between">
                    <Text className="text-body-md text-muted-foreground">
                      Weight class:
                    </Text>
                    <Text className="text-body-md">
                      {weightLabel(profile.weightClass)}
                    </Text>
                  </View>
                ) : null}
                <View className="flex-row justify-between">
                  <Text className="text-body-md text-muted-foreground">
                    Record:
                  </Text>
                  <Text className="text-body-md">
                    {profile.wins}-{profile.losses}
                  </Text>
                </View>
                {profile.location ? (
                  <View className="flex-row justify-between">
                    <Text className="text-body-md text-muted-foreground">
                      Location:
                    </Text>
                    <Text className="text-body-md">{profile.location}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Link
              href="/profile/edit"
              className="bg-background border-foreground text-foreground text-label-bold flex h-12 items-center justify-center rounded-none border-2 px-6"
            >
              <Text className="text-label-bold">Edit Profile</Text>
            </Link>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
