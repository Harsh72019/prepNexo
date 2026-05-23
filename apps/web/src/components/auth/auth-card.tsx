"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden border-r bg-card/60 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="inline-flex h-16 items-center rounded-md border bg-background/70 px-2 shadow-sm">
            <span className="relative h-12 w-36 overflow-hidden rounded-md">
              <Image src="/brand/logo.png" alt="PrepNexo logo" fill sizes="144px" className="object-cover" />
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-20 max-w-xl"
          >
            <p className="text-sm font-medium text-primary">AI interview command center</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-normal">
              Practice under pressure, improve with precision.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Live coding rounds, DSA contests, system design simulations, and a feedback loop built for serious candidates.
            </p>
          </motion.div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
          <div className="rounded-lg border bg-background/70 p-4">Realtime coding</div>
          <div className="rounded-lg border bg-background/70 p-4">AI interviewer</div>
          <div className="rounded-lg border bg-background/70 p-4">Readiness score</div>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md rounded-lg border bg-card p-6 shadow-tactical"
        >
          <h2 className="text-2xl font-semibold tracking-normal">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </motion.div>
      </section>
    </main>
  );
}
