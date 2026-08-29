import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";

import { trpc } from "~/utils/api";

const weightClasses = [
  { value: "flyweight", label: "Flyweight" },
  { value: "bantamweight", label: "Bantamweight" },
  { value: "featherweight", label: "Featherweight" },
  { value: "lightweight", label: "Lightweight" },
  { value: "welterweight", label: "Welterweight" },
  { value: "middleweight", label: "Middleweight" },
  { value: "light_heavyweight", label: "Light Heavyweight" },
  { value: "heavyweight", label: "Heavyweight" },
] as const;

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Welcome carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Form state
  const [role, setRole] = useState<"fighter" | "judge" | "both" | null>(null);
  const [nickname, setNickname] = useState("");
  const [weightClass, setWeightClass] = useState<
    | "flyweight"
    | "bantamweight"
    | "featherweight"
    | "lightweight"
    | "welterweight"
    | "middleweight"
    | "light_heavyweight"
    | "heavyweight"
    | null
  >(null);
  const [wins, setWins] = useState("");
  const [losses, setLosses] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const updateProfile = useMutation(
    trpc.profile.update.mutationOptions({
      onSuccess: () => {
        setIsLoading(true);
        // Redirect to home after successful profile creation
        router.replace("/");
      },
      onError: (error) => {
        console.error("Failed to create profile:", error);
        // In a real app, you might want to show an error message
      },
    }),
  );

  // Handle welcome carousel navigation
  const handleCarouselNext = () => {
    if (carouselIndex < 2) {
      setCarouselIndex(carouselIndex + 1);
    } else {
      // Move to profile wizard
      setCurrentStep(1);
    }
  };

  const handleCarouselSkip = () => {
    // Skip to profile wizard
    setCurrentStep(1);
  };

  // Handle profile wizard navigation
  const handleBack = () => {
    if (currentStep === 0) {
      // On welcome carousel, go back would exit (but we don't allow exiting)
      // For now, stay on first step
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    // Validate current step before moving to next
    if (currentStep === 0) {
      // Welcome carousel - handled by carousel navigation
      handleCarouselNext();
    } else if (currentStep === 1) {
      // Role step
      if (role) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Identity step
      if (nickname.trim()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      // Record step
      const winsNum = parseInt(wins, 10);
      const lossesNum = parseInt(losses, 10);
      if (
        !isNaN(winsNum) &&
        !isNaN(lossesNum) &&
        winsNum >= 0 &&
        lossesNum >= 0
      ) {
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      // Bio step - move to submit
      setCurrentStep(5);
    }
  };

  const handleSubmit = () => {
    // Final validation before submitting
    if (!nickname.trim() || !role) return;

    const winsNum = wins ? parseInt(wins, 10) : 0;
    const lossesNum = losses ? parseInt(losses, 10) : 0;
    if (isNaN(winsNum) || isNaN(lossesNum) || winsNum < 0 || lossesNum < 0)
      return;

    updateProfile.mutate({
      nickname: nickname.trim(),
      bio: bio.trim() || undefined,
      role,
      weightClass:
        role === "fighter" || role === "both"
          ? (weightClass ?? undefined)
          : undefined,
      wins: winsNum,
      losses: lossesNum,
      location: location.trim() || undefined,
    });
  };

  // Welcome carousel content
  const carouselSlides = [
    {
      title: "Swipe",
      description: "Find fighters nearby and swipe to connect",
    },
    {
      title: "Match",
      description: "When you both like each other, it's a match!",
    },
    {
      title: "Fight",
      description: "Schedule fights and track your record",
    },
  ];

  // Progress steps for profile wizard
  const wizardSteps = [
    { title: "Role", description: "Who are you?" },
    { title: "Identity", description: "Nickname and weight class" },
    { title: "Record", description: "Wins, losses, and location" },
    { title: "Bio", description: "Tell us about yourself" },
  ];

  return (
    <SafeAreaView className="bg-background flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="bg-background flex-1">
        {currentStep === 0 ? (
          // Welcome Carousel
          <View className="flex-1 items-center justify-center gap-6 p-6">
            {/* Slide indicator dots */}
            <View className="flex-row gap-2">
              {carouselSlides.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    carouselIndex === index ? "bg-primary" : "bg-muted/50"
                  }`}
                />
              ))}
            </View>

            {/* Slide content */}
            <View className="items-center gap-4">
              {(() => {
                const slide = carouselSlides[carouselIndex] ?? {
                  title: "",
                  description: "",
                };
                return (
                  <>
                    <Text className="text-3xl font-extrabold tracking-tight">
                      {slide.title}
                    </Text>
                    <Text className="text-muted-foreground max-w-xs text-center text-lg">
                      {slide.description}
                    </Text>
                  </>
                );
              })()}
            </View>

            {/* Navigation buttons */}
            <View className="w-full flex-row justify-between px-6">
              <Pressable
                onPress={handleCarouselSkip}
                className="text-muted-foreground"
              >
                <Text className="font-medium">Skip</Text>
              </Pressable>
              <Pressable
                onPress={handleCarouselNext}
                className="bg-primary rounded-md px-4 py-2"
              >
                <Text className="text-primary-foreground font-semibold">
                  {carouselIndex === 2 ? "Create your profile" : "Next"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          // Profile Wizard
          <View className="flex-1">
            <ScrollView className="bg-background flex-1 p-6">
              {/* Progress indicator */}
              <View className="mb-6">
                <View className="flex-row gap-2">
                  {wizardSteps.map((step, index) => (
                    <View
                      key={index}
                      className={`flex-1 border-b-2 ${
                        index < currentStep - 1
                          ? "bg-primary"
                          : index === currentStep - 1
                            ? "bg-primary"
                            : "bg-muted/30"
                      }`}
                    />
                  ))}
                </View>
                <View className="text-muted-foreground mt-2 flex-row gap-2 text-xs">
                  {wizardSteps.map((step, index) => (
                    <Text
                      key={index}
                      className={`font-medium ${
                        index < currentStep - 1
                          ? "text-primary"
                          : index === currentStep - 1
                            ? "text-primary"
                            : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </Text>
                  ))}
                </View>
              </View>

              {/* Step content */}
              {currentStep === 1 && (
                <>
                  <Text className="mb-2 text-2xl font-bold">Who are you?</Text>
                  <Text className="text-muted-foreground mb-6 text-center">
                    Select your role to get started
                  </Text>
                  <View className="flex-row gap-4">
                    {[
                      { value: "fighter", label: "Fighter" },
                      { value: "judge", label: "Judge" },
                      { value: "both", label: "Both" },
                    ].map((roleOption) => {
                      const selected = role === roleOption.value;
                      return (
                        <Pressable
                          key={roleOption.value}
                          onPress={() =>
                            setRole(
                              roleOption.value as "fighter" | "judge" | "both",
                            )
                          }
                          className={`flex-1 items-center justify-center gap-2 rounded-2xl border p-4 ${
                            selected ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <View className="flex-row items-center gap-2">
                            {roleOption.value === "fighter" && (
                              <Text className="text-2xl">🥊</Text>
                            )}
                            {roleOption.value === "judge" && (
                              <Text className="text-2xl">👓</Text>
                            )}
                            {roleOption.value === "both" && (
                              <Text className="text-2xl">🥊👓</Text>
                            )}
                            <Text
                              className={`font-semibold ${
                                selected
                                  ? "text-primary-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {roleOption.label}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Text className="mb-2 text-2xl font-bold">Your Identity</Text>
                  <Text className="text-muted-foreground mb-6 text-center">
                    Choose your nickname and weight class
                  </Text>

                  <View className="gap-4">
                    <View className="gap-2">
                      <Text className="text-sm font-medium">Nickname *</Text>
                      <TextInput
                        className="border-input bg-background text-foreground rounded-md border px-3 py-2"
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder="Enter your nickname"
                        autoCapitalize="none"
                      />
                    </View>

                    {(role === "fighter" || role === "both") && (
                      <View className="gap-2">
                        <Text className="text-sm font-medium">
                          Weight Class
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {weightClasses.map((wc) => {
                            const selected = weightClass === wc.value;
                            return (
                              <Pressable
                                key={wc.value}
                                onPress={() => setWeightClass(wc.value)}
                                className={`rounded-full px-3 py-1 ${
                                  selected ? "bg-primary" : "bg-muted"
                                }`}
                              >
                                <Text
                                  className={`text-xs font-medium ${
                                    selected
                                      ? "text-primary-foreground"
                                      : "text-foreground"
                                  }`}
                                >
                                  {wc.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                        <Text className="text-muted-foreground mt-2 text-xs">
                          flyweight, bantamweight, featherweight, lightweight,
                          welterweight, middleweight, light_heavyweight,
                          heavyweight
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <Text className="mb-2 text-2xl font-bold">Your Record</Text>
                  <Text className="text-muted-foreground mb-6 text-center">
                    Add your fight record and location
                  </Text>

                  <View className="gap-4">
                    <View className="flex-row gap-3">
                      <View className="flex-1 gap-2">
                        <Text className="text-sm font-medium">Wins</Text>
                        <TextInput
                          className="border-input bg-background text-foreground rounded-md border px-3 py-2"
                          value={wins}
                          onChangeText={setWins}
                          keyboardType="number-pad"
                          placeholder="0"
                        />
                      </View>
                      <View className="flex-1 gap-2">
                        <Text className="text-sm font-medium">Losses</Text>
                        <TextInput
                          className="border-input bg-background text-foreground rounded-md border px-3 py-2"
                          value={losses}
                          onChangeText={setLosses}
                          keyboardType="number-pad"
                          placeholder="0"
                        />
                      </View>
                    </View>

                    <View className="gap-2">
                      <Text className="text-sm font-medium">Location</Text>
                      <TextInput
                        className="border-input bg-background text-foreground rounded-md border px-3 py-2"
                        value={location}
                        onChangeText={setLocation}
                        placeholder="City, Country"
                      />
                    </View>
                  </View>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <Text className="mb-2 text-2xl font-bold">Your Bio</Text>
                  <Text className="text-muted-foreground mb-6 text-center">
                    Tell us about yourself (optional)
                  </Text>

                  <View className="gap-4">
                    <View className="gap-2">
                      <TextInput
                        className="border-input bg-background text-foreground h-32 rounded-md border px-3 py-2"
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Tell us about your fighting style, goals, or anything else..."
                        multiline
                      />
                    </View>
                  </View>
                </>
              )}

              {currentStep === 5 && (
                <>
                  <Text className="mb-2 text-2xl font-bold">Almost done!</Text>
                  <Text className="text-muted-foreground mb-6 text-center">
                    Review your profile before submitting
                  </Text>

                  <View className="bg-card border-border rounded-2xl border p-6">
                    <View className="gap-4">
                      <View className="flex-row justify-between">
                        <Text className="font-medium">Role:</Text>
                        <Text className="font-medium">
                          {role === "fighter"
                            ? "Fighter"
                            : role === "judge"
                              ? "Judge"
                              : "Both"}
                        </Text>
                      </View>

                      {nickname && (
                        <View className="flex-row justify-between">
                          <Text className="font-medium">Nickname:</Text>
                          <Text className="font-medium">{nickname}</Text>
                        </View>
                      )}

                      {(role === "fighter" || role === "both") &&
                        weightClass && (
                          <View className="flex-row justify-between">
                            <Text className="font-medium">Weight Class:</Text>
                            <Text className="font-medium">
                              {
                                weightClasses.find(
                                  (wc) => wc.value === weightClass,
                                )?.label
                              }
                            </Text>
                          </View>
                        )}

                      <View className="flex-row justify-between">
                        <Text className="font-medium">Record:</Text>
                        <Text className="font-medium">
                          {parseInt(wins, 10) || 0}-{parseInt(losses, 10) || 0}
                        </Text>
                      </View>

                      {location && (
                        <View className="flex-row justify-between">
                          <Text className="font-medium">Location:</Text>
                          <Text className="font-medium">{location}</Text>
                        </View>
                      )}

                      {bio && (
                        <View className="gap-2">
                          <Text className="font-medium">Bio:</Text>
                          <Text className="text-muted-foreground">{bio}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            {/* Navigation buttons */}
            <View className="bg-background border-border border-t p-6">
              <View className="flex-row justify-between">
                {currentStep > 1 && (
                  <Pressable
                    onPress={handleBack}
                    className="text-muted-foreground"
                  >
                    <Text className="font-medium">Back</Text>
                  </Pressable>
                )}
                {currentStep < 5 ? (
                  <Pressable
                    onPress={handleNext}
                    disabled={isLoading}
                    className="bg-primary rounded-md px-4 py-2"
                  >
                    <Text className="text-primary-foreground font-semibold">
                      {currentStep === 4 ? "Review" : "Next"}
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleSubmit}
                    disabled={updateProfile.isPending || isLoading}
                    className="bg-primary rounded-md px-4 py-2"
                  >
                    {updateProfile.isPending ? (
                      <Text className="text-primary-foreground font-semibold">
                        Creating...
                      </Text>
                    ) : (
                      <Text className="text-primary-foreground font-semibold">
                        Create Profile
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
