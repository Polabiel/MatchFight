"use client";

import Link from "next/link";
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
        toast.success("Profile updated successfully");
        void queryClient.invalidateQueries({ queryKey: ["profile"] });
        void router.push("/profile");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update profile");
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
      toast.error("Nickname is required");
      return;
    }

    void mutation.mutate(data);
  };

  const isEditMode = !!profile;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Profile" : "Create Profile"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditMode
            ? "Update your profile information"
            : "Get started by creating your profile"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field>
          <FieldLabel>Nickname</FieldLabel>
          <FieldContent>
            <Input
              type="text"
              placeholder="Enter your nickname"
              defaultValue={profile?.nickname ?? ""}
              name="nickname"
              required
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Bio</FieldLabel>
          <FieldContent>
            <textarea
              defaultValue={profile?.bio ?? ""}
              name="bio"
              placeholder="Tell us about yourself..."
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 block w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
              rows={4}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Role</FieldLabel>
          <FieldContent>
            <select
              defaultValue={profile?.role ?? "fighter"}
              name="role"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 block w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
            >
              <option value="fighter">Fighter</option>
              <option value="judge">Judge</option>
              <option value="both">Both</option>
            </select>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Weight Class (optional)</FieldLabel>
          <FieldContent>
            <select
              defaultValue={profile?.weightClass ?? ""}
              name="weightClass"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 block w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
            >
              <option value="">Select weight class</option>
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
          <FieldLabel>Wins</FieldLabel>
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
          <FieldLabel>Losses</FieldLabel>
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
          <FieldLabel>Location (optional)</FieldLabel>
          <FieldContent>
            <Input
              type="text"
              defaultValue={profile?.location ?? ""}
              name="location"
              placeholder="City, Country"
            />
          </FieldContent>
        </Field>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Saving..."
              : isEditMode
                ? "Update Profile"
                : "Create Profile"}
          </Button>

          <Link href="/profile" className="button button-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
