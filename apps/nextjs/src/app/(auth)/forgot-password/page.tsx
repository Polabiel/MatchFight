"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";
import { Field, FieldContent, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate sending reset link (no actual implementation yet)
      // In a real app, this would call an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setShowSuccess(true);
      setIsSubmitting(false);
    } catch (err) {
      toast.error("Failed to send reset link. Please try again.");
      console.error("Forgot password error:", err);
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-muted-foreground">
          We've sent a password reset link to {email}. Please check your inbox
          (and spam folder) for further instructions.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            router.push("/sign-in");
          }}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-center text-3xl font-bold">
        Forgot your password?
      </h1>
      <p className="text-muted-foreground mb-6 text-center">
        Enter your email address below and we'll send you a link to reset your
        password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field>
          <FieldLabel>Email address</FieldLabel>
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

        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending link..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        <a href="/sign-in" className="text-primary font-medium hover:underline">
          Back to sign in
        </a>
      </p>
    </>
  );
}
