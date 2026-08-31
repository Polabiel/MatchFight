import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { trpc } from "~/utils/api";

const roles = [
  { value: "fighter", label: "Fighter" },
  { value: "judge", label: "Judge" },
  { value: "both", label: "Both" },
] as const;

export default function ProfileEdit() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const profileQuery = useQuery(trpc.profile.getMe.queryOptions());
  const profile = profileQuery.data;

  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [role, setRole] = useState<string>(profile?.role ?? "fighter");
  const [weightClass, setWeightClass] = useState<string>(
    profile?.weightClass ?? "",
  );
  const [wins, setWins] = useState(String(profile?.wins ?? 0));
  const [losses, setLosses] = useState(String(profile?.losses ?? 0));
  const [location, setLocation] = useState(profile?.location ?? "");

  const update = useMutation(
    trpc.profile.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.profile.pathFilter());
        router.back();
      },
    }),
  );

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  const isEditMode = !!profile;

  const handleSubmit = () => {
    if (!nickname.trim()) return;
    update.mutate({
      nickname: nickname.trim(),
      bio: bio || undefined,
      role: role as "fighter" | "judge" | "both",
      weightClass: (weightClass || undefined) as
        | "flyweight"
        | "bantamweight"
        | "featherweight"
        | "lightweight"
        | "welterweight"
        | "middleweight"
        | "light_heavyweight"
        | "heavyweight"
        | undefined,
      wins: parseInt(wins, 10) || 0,
      losses: parseInt(losses, 10) || 0,
      location: location || undefined,
    });
  };

  return (
    <SafeAreaView className="bg-background flex-1">
      <Stack.Screen
        options={{ title: isEditMode ? "Edit Profile" : "Create Profile" }}
      />
      <ScrollView className="bg-background flex-1 p-6">
        <View className="gap-6 p-4">
          <Text className="text-headline-lg">
            {isEditMode ? "Edit Profile" : "Create Profile"}
          </Text>

          <View className="gap-4">
            <Text className="text-label-bold">Nickname *</Text>
            <TextInput
              className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-12 rounded-none border-2 bg-transparent px-4"
              value={nickname}
              onChangeText={setNickname}
              placeholder="Enter your nickname"
            />
          </View>

          <View className="gap-4">
            <Text className="text-label-bold">Bio</Text>
            <TextInput
              className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-24 rounded-none border-2 bg-transparent px-4"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              multiline
            />
          </View>

          <View className="gap-4">
            <Text className="text-label-bold">Role</Text>
            <View className="flex-row gap-2">
              {roles.map((r) => {
                const active = role === r.value;
                return (
                  <Pressable
                    key={r.value}
                    onPress={() => setRole(r.value)}
                    className={`rounded-none px-3 py-2 ${
                      active ? "bg-foreground" : "bg-muted"
                    }`}
                  >
                    <Text
                      className={`text-label-sm ${
                        active ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {r.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="gap-4">
            <Text className="text-label-bold">Weight Class</Text>
            <TextInput
              className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-12 rounded-none border-2 bg-transparent px-4"
              value={weightClass}
              onChangeText={setWeightClass}
              placeholder="e.g. lightweight, heavyweight"
              autoCapitalize="none"
            />
            <Text className="text-body-md text-muted-foreground">
              flyweight, bantamweight, featherweight, lightweight, welterweight,
              middleweight, light_heavyweight, heavyweight
            </Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-label-bold">Wins</Text>
              <TextInput
                className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-12 rounded-none border-2 bg-transparent px-4"
                value={wins}
                onChangeText={setWins}
                keyboardType="number-pad"
              />
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-label-bold">Losses</Text>
              <TextInput
                className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-12 rounded-none border-2 bg-transparent px-4"
                value={losses}
                onChangeText={setLosses}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View className="gap-4">
            <Text className="text-label-bold">Location</Text>
            <TextInput
              className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-12 rounded-none border-2 bg-transparent px-4"
              value={location}
              onChangeText={setLocation}
              placeholder="City, Country"
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={update.isPending || !nickname.trim()}
            className="bg-primary text-primary-foreground h-12 px-6 text-label-bold rounded-none flex items-center justify-center"
          >
            <Text className="text-label-bold">
              {update.isPending
                ? "Saving..."
                : isEditMode
                  ? "Update Profile"
                  : "Create Profile"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}