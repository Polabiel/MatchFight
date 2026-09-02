"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@acme/ui/button";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "action";

type ButtonSize = "default" | "sm" | "lg" | "icon";

function SubmitButton({
  variant,
  size,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}

export function SignInButton({
  variant,
  size,
  formAction,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  formAction: () => Promise<void>;
}) {
  return (
    <form action={formAction}>
      <SubmitButton variant={variant} size={size} />
    </form>
  );
}
