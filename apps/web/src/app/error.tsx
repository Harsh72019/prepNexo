"use client";

import { Button } from "@interview-battlefield/ui/components/button";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-tactical">
        <p className="text-sm font-medium text-destructive">Mission interrupted</p>
        <h1 className="mt-2 text-2xl font-semibold">Something went sideways.</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-6" onClick={reset}>Retry</Button>
      </section>
    </main>
  );
}
