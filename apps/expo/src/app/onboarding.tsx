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
  const [currentStep, setCurrentStep] = useState<number>(0);
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
      },
    }),
  );

  // Handle welcome carousel navigation
  const handleCarouselNext = () => {
    if (carouselIndex < 2) {
      setCarouselIndex(carouselIndex + 1);
    } else {
      setCurrentStep(1);
    }
  };

  const handleCarouselSkip = () => {
    setCurrentStep(1);
  };

  // Handle profile wizard navigation
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    // Validate current step before moving to next
    if (currentStep === 1) {
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

  const isLastCarouselSlide = carouselIndex === carouselSlides.length - 1;

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
                  className={`h-2 w-2 rounded-none ${
                    carouselIndex === index ? "bg-foreground" : "bg-muted"
                  }`}
                />
              ))}
            </View>

            {/* Slide content */}
            <View className="items-center gap-4">
              <Text className="text-headline-lg">
                {carouselSlides[carouselIndex]?.title}
              </Text>
              <Text className="text-body-md text-muted-foreground max-w-xs text-center">
                {carouselSlides[carouselIndex]?.description}
              </Text>
            </View>

            {/* Navigation buttons */}
            <View className="w-full flex-row items-center justify-between px-6">
              <Pressable onPress={handleCarouselSkip}>
                <Text className="text-label-bold text-muted-foreground">
                  Skip
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCarouselNext}
                className="bg-primary text-primary-foreground border-primary text-label-bold flex h-12 items-center justify-center rounded-none border-2 px-6"
              >
                <Text className="text-label-bold text-primary-foreground">
                  {isLastCarouselSlide ? "Create profile" : "Next"}
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
                      key={step.title}
                      className={`flex-1 border-b-2 ${
                        index <= currentStep - 2
                          ? "border-foreground"
                          : "border-muted"
                      }`}
                    />
                  ))}
                </View>
                <View className="mt-2 flex-row gap-2">
                  {wizardSteps.map((step, index) => (
                    <Text
                      key={step.title}
                      className={`text-label-sm ${
                        index <= currentStep - 2
                          ? "text-foreground"
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
                  <Text className="text-headline-lg">Who are you?</Text>
                  <Text className="text-body-md text-muted-foreground mb-6">
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
                          className={`flex-1 items-center justify-center gap-2 rounded-none border-2 p-4 ${
                            selected
                              ? "bg-foreground border-foreground"
                              : "bg-background border-foreground"
                          }`}
                        >
                          <Text
                            className={`text-label-bold text-center ${
                              selected ? "text-background" : "text-foreground"
                            }`}
                          >
                            {roleOption.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Text className="text-headline-lg">Your Identity</Text>
                  <Text className="text-body-md text-muted-foreground mb-6">
                    Choose your nickname and weight class
                  </Text>

                  <View className="gap-4">
                    <View className="gap-2">
                      <Text className="text-label-bold text-foreground">
                        Nickname *
                      </Text>
                      <TextInput
                        className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-12 rounded-none border-2 bg-transparent px-4"
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder="Enter your nickname"
                        autoCapitalize="none"
                        maxLength={64}
                      />
                    </View>

                    {(role === "fighter" || role === "both") && (
                      <View className="gap-2">
                        <Text className="text-label-bold text-foreground">
                          Weight Class
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {weightClasses.map((wc) => {
                            const selected = weightClass === wc.value;
                            return (
                              <Pressable
                                key={wc.value}
                                onPress={() => setWeightClass(wc.value)}
                                className={`rounded-none px-3 py-1 ${
                                  selected ? "bg-foreground" : "bg-muted"
                                }`}
                              >
                                <Text
                                  className={`text-label-sm ${
                                    selected
                                      ? "text-background"
                                      : "text-foreground"
                                  }`}
                                >
                                  {wc.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </View>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <Text className="text-headline-lg">Your Record</Text>
                  <Text className="text-body-md text-muted-foreground mb-6">
                    Add your fight record and location
                  </Text>

                  <View className="gap-4">
                    <View className="flex-row gap-3">
                      <View className="flex-1 gap-2">
                        <Text className="text-label-bold text-foreground">
                          Wins
                        </Text>
                        <TextInput
                          className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-12 rounded-none border-2 bg-transparent px-4"
                          value={wins}
                          onChangeText={setWins}
                          keyboardType="number-pad"
                          placeholder="0"
                        />
                      </View>
                      <View className="flex-1 gap-2">
                        <Text className="text-label-bold text-foreground">
                          Losses
                        </Text>
                        <TextInput
                          className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-12 rounded-none border-2 bg-transparent px-4"
                          value={losses}
                          onChangeText={setLosses}
                          keyboardType="number-pad"
                          placeholder="0"
                        />
                      </View>
                    </View>

                    <View className="gap-2">
                      <Text className="text-label-bold text-foreground">
                        Location
                      </Text>
                      <TextInput
                        className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-12 rounded-none border-2 bg-transparent px-4"
                        value={location}
                        onChangeText={setLocation}
                        placeholder="City, Country"
                        maxLength={128}
                      />
                    </View>
                  </View>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <Text className="text-headline-lg">Your Bio</Text>
                  <Text className="text-body-md text-muted-foreground mb-6">
                    Tell us about yourself (optional)
                  </Text>

                  <View className="gap-4">
                    <TextInput
                      className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md h-32 rounded-none border-2 bg-transparent px-4"
                      value={bio}
                      onChangeText={setBio}
                      placeholder="Tell us about your fighting style, goals, or anything else..."
                      multiline
                      maxLength={500}
                    />
                  </View>
                </>
              )}

              {currentStep === 5 && (
                <>
                  <Text className="text-headline-lg">Almost done!</Text>
                  <Text className="text-body-md text-muted-foreground mb-6">
                    Review your profile before submitting
                  </Text>

                  <View className="border-border bg-card gap-4 rounded-none border p-6">
                    <View className="flex-row justify-between">
                      <Text className="text-label-bold text-foreground">
                        Role
                      </Text>
                      <Text className="text-body-md text-foreground">
                        {role === "fighter"
                          ? "Fighter"
                          : role === "judge"
                            ? "Judge"
                            : "Both"}
                      </Text>
                    </View>

                    {nickname ? (
                      <View className="flex-row justify-between">
                        <Text className="text-label-bold text-foreground">
                          Nickname
                        </Text>
                        <Text className="text-body-md text-foreground">
                          {nickname}
                        </Text>
                      </View>
                    ) : null}

                    {(role === "fighter" || role === "both") && weightClass ? (
                      <View className="flex-row justify-between">
                        <Text className="text-label-bold text-foreground">
                          Weight Class
                        </Text>
                        <Text className="text-body-md text-foreground">
                          {
                            weightClasses.find((wc) => wc.value === weightClass)
                              ?.label
                          }
                        </Text>
                      </View>
                    ) : null}

                    <View className="flex-row justify-between">
                      <Text className="text-label-bold text-foreground">
                        Record
                      </Text>
                      <Text className="text-body-md text-foreground">
                        {parseInt(wins, 10) || 0}-{parseInt(losses, 10) || 0}
                      </Text>
                    </View>

                    {location ? (
                      <View className="flex-row justify-between">
                        <Text className="text-label-bold text-foreground">
                          Location
                        </Text>
                        <Text className="text-body-md text-foreground">
                          {location}
                        </Text>
                      </View>
                    ) : null}

                    {bio ? (
                      <View className="gap-2">
                        <Text className="text-label-bold text-foreground">
                          Bio
                        </Text>
                        <Text className="text-body-md text-muted-foreground">
                          {bio}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </>
              )}
            </ScrollView>

            {/* Navigation buttons */}
            <View className="border-border bg-background border-t p-6">
              <View className="flex-row items-center justify-between">
                {currentStep > 1 ? (
                  <Pressable onPress={handleBack}>
                    <Text className="text-label-bold text-muted-foreground">
                      Back
                    </Text>
                  </Pressable>
                ) : (
                  <View />
                )}
                {currentStep < 5 ? (
                  <Pressable
                    onPress={handleNext}
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground border-primary text-label-bold flex h-12 items-center justify-center rounded-none border-2 px-6"
                  >
                    <Text className="text-label-bold text-primary-foreground">
                      {currentStep === 4 ? "Review" : "Next"}
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleSubmit}
                    disabled={updateProfile.isPending || isLoading}
                    className="bg-primary text-primary-foreground border-primary text-label-bold flex h-12 items-center justify-center rounded-none border-2 px-6"
                  >
                    <Text className="text-label-bold text-primary-foreground">
                      {updateProfile.isPending
                        ? "Creating..."
                        : "Create Profile"}
                    </Text>
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
