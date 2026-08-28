'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useSession } from '~/auth/hooks';
import { authClient } from '~/auth/client';
import { Button } from '@acme/ui/button';
import { Input } from '@acme/ui/input';
import { Field, FieldLabel, FieldContent } from '@acme/ui/field';
import { Separator } from '@acme/ui/separator';
import { toast } from '@acme/ui/toast';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPending: sessionPending } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl') ?? '/swipe';

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
        const errorMessage = typeof result.error.message === 'string'
          ? result.error.message
          : 'Failed to sign in. Please check your credentials and try again.';
        throw new Error(errorMessage);
      }

      // Redirect to callbackUrl or default to /swipe
      router.push(callbackUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in. Please try again.';
      toast.error(message);
      console.error('Sign in error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold text-center">
        Sign in to MatchFight
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field>
          <FieldLabel>
            Email
          </FieldLabel>
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
          <FieldLabel>
            Password
          </FieldLabel>
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
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a
            href="/sign-up"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </a>
        </p>

        <Separator orientation="horizontal" className="my-4">
          <span className="px-2 text-sm text-muted-foreground">
            or
          </span>
        </Separator>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => authClient.signIn.social({ provider: 'discord' })}
          disabled={isSubmitting}
        >
          Sign in with Discord
        </Button>

        <p className="text-sm text-muted-foreground">
          <a
            href="/forgot-password"
            className="font-medium text-primary hover:underline"
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