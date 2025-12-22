"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Error boundary for the signup page
 * Catches errors in the sign-up form and provides recovery options
 * Following Next.js error handling best practices
 */
export default function SignUpError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Signup page error:", error);
    }

    // TODO: In production, log to error tracking service (e.g., Sentry)
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle as="h1" className="text-destructive">
            Something went wrong
          </CardTitle>
          <CardDescription>
            We encountered an error while loading the sign-up page. Please try
            again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-md bg-muted p-4">
              <p className="font-mono text-muted-foreground text-xs">
                {error.message}
              </p>
              {error.digest ? (
                <p className="mt-2 font-mono text-muted-foreground text-xs">
                  Error ID: {String(error.digest)}
                </p>
              ) : null}
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button
              onClick={() => {
                window.location.href = "/";
              }}
              variant="outline"
            >
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
