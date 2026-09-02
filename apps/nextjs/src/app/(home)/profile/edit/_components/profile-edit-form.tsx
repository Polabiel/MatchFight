"use client";

import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { Button } from "@acme/ui/button";
import { Field, FieldContent, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";

export function ProfileEditForm() {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile } = useSuspenseQuery(trpc.profile.getMe.queryOptions());

  const mutation = useMutation(
    trpc.profile.update.mutationOptions({
      onSuccess: () => {
        toast.success("Perfil atualizado com sucesso");
        void queryClient.invalidateQueries({ queryKey: ["profile"] });
        void router.push("/profile");
      },
      onError: (error) => {
        toast.error(error.message || "Falha ao atualizar perfil");
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      nickname: formData.get("nickname") as string,
      bio: (formData.get("bio") as string) || undefined,
      role: formData.get("role") as "fighter" | "judge" | "both",
      weightClass: formData.get("weightClass") as
        | "flyweight"
        | "bantamweight"
        | "featherweight"
        | "lightweight"
        | "welterweight"
        | "middleweight"
        | "light_heavyweight"
        | "heavyweight"
        | undefined,
      wins: formData.get("wins") ? parseInt(formData.get("wins") as string) : 0,
      losses: formData.get("losses")
        ? parseInt(formData.get("losses") as string)
        : 0,
      location: (formData.get("location") as string) || undefined,
    };

    if (!data.nickname || data.nickname.trim() === "") {
      toast.error("Apelido é obrigatório");
      return;
    }

    void mutation.mutate(data);
  };

  const isEditMode = !!profile;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-headline-lg">
          {isEditMode ? "Editar Perfil" : "Criar Perfil"}
        </h1>
        <p className="text-body-md text-muted-foreground mt-2">
          {isEditMode
            ? "Atualize suas informações"
            : "Comece criando seu perfil"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-border space-y-6 border-2 p-6"
      >
        <Field>
          <FieldLabel className="text-label-bold">Apelido</FieldLabel>
          <FieldContent>
            <Input
              type="text"
              placeholder="Digite seu apelido"
              defaultValue={profile?.nickname ?? ""}
              name="nickname"
              required
              maxLength={64}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel className="text-label-bold">Bio</FieldLabel>
          <FieldContent>
            <textarea
              defaultValue={profile?.bio ?? ""}
              name="bio"
              placeholder="Conte sobre você..."
              maxLength={500}
              className="border-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-foreground text-body-md w-full resize-none rounded-none border-2 bg-transparent px-4 py-3 outline-none disabled:opacity-50"
              rows={4}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel className="text-label-bold">Função</FieldLabel>
          <FieldContent>
            <select
              defaultValue={profile?.role ?? "fighter"}
              name="role"
              className="border-foreground focus:bg-muted focus:border-foreground text-body-md h-12 w-full rounded-none border-2 bg-transparent px-4 outline-none"
            >
              <option value="fighter">Lutador</option>
              <option value="judge">Juiz</option>
              <option value="both">Ambos</option>
            </select>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel className="text-label-bold">
            Categoria de Peso (opcional)
          </FieldLabel>
          <FieldContent>
            <select
              defaultValue={profile?.weightClass ?? ""}
              name="weightClass"
              className="border-foreground focus:bg-muted focus:border-foreground text-body-md h-12 w-full rounded-none border-2 bg-transparent px-4 outline-none"
            >
              <option value="">Selecione a categoria</option>
              <option value="flyweight">Flyweight</option>
              <option value="bantamweight">Bantamweight</option>
              <option value="featherweight">Featherweight</option>
              <option value="lightweight">Lightweight</option>
              <option value="welterweight">Welterweight</option>
              <option value="middleweight">Middleweight</option>
              <option value="light_heavyweight">Light Heavyweight</option>
              <option value="heavyweight">Heavyweight</option>
            </select>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel className="text-label-bold">Vitórias</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              min="0"
              defaultValue={(profile?.wins ?? 0).toString()}
              name="wins"
              placeholder="0"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel className="text-label-bold">Derrotas</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              min="0"
              defaultValue={(profile?.losses ?? 0).toString()}
              name="losses"
              placeholder="0"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel className="text-label-bold">
            Localização (opcional)
          </FieldLabel>
          <FieldContent>
            <Input
              type="text"
              defaultValue={profile?.location ?? ""}
              name="location"
              placeholder="Cidade, País"
              maxLength={128}
            />
          </FieldContent>
        </Field>

        <div className="flex items-center gap-4">
          <Button type="submit" variant="action" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Salvando..."
              : isEditMode
                ? "Atualizar Perfil"
                : "Criar Perfil"}
          </Button>

          <Button variant="outline" onClick={() => router.push("/profile")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
