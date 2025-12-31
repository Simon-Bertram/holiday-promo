"use client";

import Link from "next/link";
import { Suspense } from "react";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVerifyMagicLink } from "@/hooks/use-verify-magic-link";
import { AUTH_CONFIG } from "@/lib/constants/auth";

/**
 * Magic link verification page
 *
 * This component handles the UI presentation only.
 * Business logic is delegated to the useVerifyMagicLink hook.
 * Wrapped in Suspense boundary to satisfy Next.js requirements for useSearchParams().
 */
export default function VerifyMagicLinkPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyMagicLinkContent />
    </Suspense>
  );
}

/**
 * Content component that uses useSearchParams() via useVerifyMagicLink hook
 * Must be wrapped in Suspense boundary per Next.js requirements
 */
function VerifyMagicLinkContent() {
  const { status, errorMessage, retry } = useVerifyMagicLink();

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "success") {
    return <SuccessState />;
  }

  return <ErrorState errorMessage={errorMessage} onRetry={retry} />;
}

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verifying your magic link</CardTitle>
          <CardDescription>
            Please wait while we verify your link...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Loader />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Success state component
 */
function SuccessState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verification successful!</CardTitle>
          <CardDescription>
            You&apos;ve been successfully signed in. Redirecting to your
            dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Loader />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Error state component
 */
interface ErrorStateProps {
  errorMessage: string | null;
  onRetry: () => void;
}

function ErrorState({ errorMessage, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verification failed</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            The magic link may have expired (links expire after{" "}
            {AUTH_CONFIG.MAGIC_LINK_EXPIRY_MINUTES} minutes) or has already been
            used.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={onRetry}>Try again</Button>
            <Button asChild variant="outline">
              <Link href="/login">Request a new magic link</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
