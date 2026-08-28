"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@acme/ui/button";
import { Field, FieldContent, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { Separator } from "@acme/ui/separator";
import { toast } from "@acme/ui/toast";

import { authClient } from "~/auth/client";
import { useSession } from "~/auth/hooks";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPending: sessionPending } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") ?? "/swipe";

  // Redirect if already authenticated
  if (!sessionPending) {
    // Note: We can't redirect here directly in render, but we'll handle it in useEffect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = (await authClient.signIn.email({
        email,
        password,
      })) as unknown as { error?: { message?: string } | null };

      if (result.error) {
        const errorMessage =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to sign in. Please check your credentials and try again.";
        throw new Error(errorMessage);
      }

      // Redirect to callbackUrl or default to /swipe
      router.push(callbackUrl);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please try again.";
      toast.error(message);
      console.error("Sign in error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="mb-6 text-center text-3xl font-bold">
        Sign in to MatchFight
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            />
          </FieldContent>
        </Field>

        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="space-y-4 text-center">
        <p className="text-muted-foreground text-sm">
          Don't have an account?{" "}
          <a
            href="/sign-up"
            className="text-primary font-medium hover:underline"
          >
            Sign up
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
          Sign in with Discord
        </Button>

        <p className="text-muted-foreground text-sm">
          <a
            href="/forgot-password"
            className="text-primary font-medium hover:underline"
          >
            Forgot password?
          </a>
        </p>
      </div>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
