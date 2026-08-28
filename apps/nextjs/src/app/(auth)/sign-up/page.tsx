"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";
import { Field, FieldContent, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { Separator } from "@acme/ui/separator";
import { toast } from "@acme/ui/toast";

import { authClient } from "~/auth/client";
import { useSession } from "~/auth/hooks";

export default function SignUpPage() {
  const router = useRouter();
  const { isPending: sessionPending } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (!sessionPending) {
    // Note: We can't redirect here directly in render, but we'll handle it in useEffect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = (await authClient.signUp.email({
        email,
        password,
        name,
      })) as unknown as { error?: { message?: string } | null };

      if (result.error) {
        const errorMessage =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to create account. Please try again.";
        throw new Error(errorMessage);
      }

      // Redirect to profile edit page for onboarding
      router.push("/profile/edit");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again.";
      toast.error(message);
      console.error("Sign up error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="mb-6 text-center text-3xl font-bold">
        Create your MatchFight account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field>
          <FieldLabel>Name</FieldLabel>
          <FieldContent>
            <Input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Email</FieldLabel>
          <FieldContent>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Password</FieldLabel>
          <FieldContent>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
              minLength={6}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Confirm Password</FieldLabel>
          <FieldContent>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              required
              minLength={6}
            />
          </FieldContent>
        </Field>

        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="space-y-4 text-center">
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <a
            href="/sign-in"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </a>
        </p>

        <Separator orientation="horizontal" className="my-4">
          <span className="text-muted-foreground px-2 text-sm">or</span>
        </Separator>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => authClient.signIn.social({ provider: "discord" })}
          disabled={isSubmitting}
        >
          Sign up with Discord
        </Button>
      </div>
    </>
  );
}
