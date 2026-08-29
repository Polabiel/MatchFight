"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Field, FieldContent, FieldLabel } from "@acme/ui/field";

import { useTRPC } from "~/trpc/react";

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

const carouselSlides = [
  {
    title: "Descubra",
    description: "Encontre lutadores e juízes por categoria de peso",
  },
  {
    title: "Combine",
    description: "Interesse mútuo forma uma dupla, um juiz pode arbitrar",
  },
  {
    title: "Lute",
    description: "Agende local, data, regras — acompanhe o status até o resultado",
  },
];

const wizardSteps = [
  { title: "Função", description: "Quem é você?" },
  { title: "Identidade", description: "Apelido e categoria de peso" },
  { title: "Cartel", description: "Vitórias, derrotas e localização" },
  { title: "Bio", description: "Conte sobre você" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const trpc = useTRPC();
  const [currentStep, setCurrentStep] = useState(0);

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
        router.replace("/swipe");
      },
      onError: (error) => {
        console.error("Failed to create profile:", error);
      },
    })
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
      if (!isNaN(winsNum) && !isNaN(lossesNum) && winsNum >= 0 && lossesNum >= 0) {
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
    if (isNaN(winsNum) || isNaN(lossesNum) || winsNum < 0 || lossesNum < 0) return;

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

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {currentStep === 0 ? (
        // Welcome Carousel
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
          {/* Slide indicator dots */}
          <div className="flex gap-2">
            {carouselSlides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-none transition-colors ${
                  carouselIndex === index ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Slide content */}
          <div className="items-center gap-4 text-center max-w-2xl">
            <h1 className="text-headline-lg font-extrabold tracking-tight">
              {carouselSlides[carouselIndex]?.title ?? ""}
            </h1>
            <p className="text-body-md text-muted-foreground max-w-md">
              {carouselSlides[carouselIndex]?.description ?? ""}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex w-full max-w-2xl justify-between px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCarouselSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Pular
            </Button>
            <Button
              onClick={handleCarouselNext}
              className="w-full sm:w-auto"
              size="lg"
            >
              {carouselIndex === 2 ? "Criar perfil" : "Próximo"}
            </Button>
          </div>
        </div>
      ) : (
        // Profile Wizard
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="mx-auto max-w-xl">
              {/* Progress indicator */}
              <div className="mb-8">
                <div className="flex gap-2 mb-2">
                  {wizardSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`flex-1 h-1.5 rounded-none transition-colors ${
                        index < currentStep - 1
                          ? "bg-primary"
                          : index === currentStep - 1
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {wizardSteps.map((step, index) => (
                    <span
                      key={index}
                      className={`flex-1 text-center font-medium ${
                        index < currentStep - 1
                          ? "text-primary-foreground"
                          : index === currentStep - 1
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step content */}
              {currentStep === 1 && (
                <>
                  <h2 className="text-headline-lg mb-2 text-center">
                    Quem é você?
                  </h2>
                  <p className="text-muted-foreground text-center mb-8">
                    Selecione sua função para começar
                  </p>
                  <div className="flex gap-3">
                    {[
                      { value: "fighter", label: "Lutador", emoji: "🥊" },
                      { value: "judge", label: "Juiz", emoji: "👓" },
                      { value: "both", label: "Ambos", emoji: "🥊👓" },
                    ].map((roleOption) => {
                      const selected = role === roleOption.value;
                      return (
                        <Button
                          key={roleOption.value}
                          type="button"
                          variant={selected ? "default" : "outline"}
                          className="flex-1 flex-col gap-2 p-6 rounded-none border-2 transition-all"
                          onClick={() => setRole(roleOption.value as "fighter" | "judge" | "both")}
                        >
                          <span className="text-3xl">{roleOption.emoji}</span>
                          <span className="font-semibold text-lg">
                            {roleOption.label}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <h2 className="text-headline-lg mb-2 text-center">
                    Sua Identidade
                  </h2>
                  <p className="text-muted-foreground text-center mb-8">
                    Escolha seu apelido e categoria de peso
                  </p>

                  <div className="space-y-6">
                    <Field orientation="vertical">
                      <FieldLabel>
                        <Label className="text-label-bold">Apelido *</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="Digite seu apelido"
                          autoComplete="nickname"
                        />
                      </FieldContent>
                    </Field>

                    {(role === "fighter" || role === "both") && (
                      <Field orientation="vertical">
                        <FieldLabel>
                          <Label className="text-label-bold">Categoria de Peso</Label>
                        </FieldLabel>
                        <FieldContent>
                          <div className="flex flex-wrap gap-2">
                            {weightClasses.map((wc) => {
                              const selected = weightClass === wc.value;
                              return (
                                <Button
                                  key={wc.value}
                                  type="button"
                                  variant={selected ? "default" : "outline"}
                                  size="sm"
                                  className="rounded-none"
                                  onClick={() => setWeightClass(wc.value)}
                                >
                                  {wc.label}
                                </Button>
                              );
                            })}
                          </div>
                          <p className="text-muted-foreground text-xs mt-2">
                            flyweight, bantamweight, featherweight, lightweight,
                            welterweight, middleweight, light_heavyweight,
                            heavyweight
                          </p>
                        </FieldContent>
                      </Field>
                    )}
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <h2 className="text-headline-lg mb-2 text-center">
                    Seu Cartel
                  </h2>
                  <p className="text-muted-foreground text-center mb-8">
                    Adicione seu cartel de lutas e localização
                  </p>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Field orientation="vertical">
                        <FieldLabel>
                          <Label className="text-label-bold">Vitórias</Label>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            value={wins}
                            onChange={(e) => setWins(e.target.value)}
                            placeholder="0"
                            min="0"
                          />
                        </FieldContent>
                      </Field>
                      <Field orientation="vertical">
                        <FieldLabel>
                          <Label className="text-label-bold">Derrotas</Label>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            value={losses}
                            onChange={(e) => setLosses(e.target.value)}
                            placeholder="0"
                            min="0"
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    <Field orientation="vertical">
                      <FieldLabel>
                        <Label className="text-label-bold">Localização</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Cidade, País"
                        />
                      </FieldContent>
                    </Field>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <h2 className="text-headline-lg mb-2 text-center">
                    Sua Bio
                  </h2>
                  <p className="text-muted-foreground text-center mb-8">
                    Conte sobre você (opcional)
                  </p>

                  <div className="space-y-6">
                    <Field orientation="vertical">
                      <FieldContent>
                        <textarea
className="border-foreground bg-background text-foreground h-32 w-full min-w-0 rounded-none border-2 px-4 py-3 text-body-md outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground resize-none"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Conte sobre seu estilo de luta, objetivos ou qualquer outra coisa..."
                        />
                      </FieldContent>
                    </Field>
                  </div>
                </>
              )}

              {currentStep === 5 && (
                <>
                  <h2 className="text-headline-lg mb-2 text-center">
                    Quase lá!
                  </h2>
                  <p className="text-muted-foreground text-center mb-8">
                    Revise seu perfil antes de finalizar
                  </p>

                  <div className="bg-background border-border rounded-none border p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-medium">Função:</span>
                        <span className="font-medium">
                          {role === "fighter"
                            ? "Lutador"
                            : role === "judge"
                            ? "Juiz"
                            : "Ambos"}
                        </span>
                      </div>

                      {nickname && (
                        <div className="flex justify-between">
                          <span className="font-medium">Apelido:</span>
                          <span className="font-medium">{nickname}</span>
                        </div>
                      )}

                      {(role === "fighter" || role === "both") && weightClass && (
                        <div className="flex justify-between">
                          <span className="font-medium">Categoria de Peso:</span>
                          <span className="font-medium">
                            {weightClasses.find((wc) => wc.value === weightClass)?.label}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="font-medium">Cartel:</span>
                        <span className="font-medium">
                          {parseInt(wins, 10) || 0}-{parseInt(losses, 10) || 0}
                        </span>
                      </div>

                      {location && (
                        <div className="flex justify-between">
                          <span className="font-medium">Localização:</span>
                          <span className="font-medium">{location}</span>
                        </div>
                      )}

                      {bio && (
                        <div className="space-y-2">
                          <span className="font-medium">Bio:</span>
                          <p className="text-muted-foreground">{bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>

          {/* Navigation buttons */}
          <footer className="bg-background border-t border-border p-6">
            <div className="mx-auto max-w-xl flex justify-between">
              {currentStep > 1 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={updateProfile.isPending}
                >
                  Voltar
                </Button>
              )}
              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={updateProfile.isPending}
                  size="lg"
                >
                  {currentStep === 4 ? "Revisar" : "Próximo"}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={updateProfile.isPending}
                  size="lg"
                >
                  {updateProfile.isPending ? "Criando..." : "Finalizar"}
                </Button>
              )}
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}