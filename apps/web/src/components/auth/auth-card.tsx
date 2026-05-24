"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Code2, Network, Sparkles, Trophy, Zap } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen overflow-hidden bg-background lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
      <section className="relative hidden min-h-screen overflow-hidden border-r bg-[radial-gradient(circle_at_28%_22%,hsl(var(--primary)/0.18),transparent_28%),linear-gradient(145deg,hsl(var(--card)),hsl(var(--secondary)/0.7)_52%,hsl(var(--background)))] px-10 py-10 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--foreground)/0.06)_1px,transparent_1px),linear-gradient(0deg,hsl(var(--foreground)/0.045)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(110deg,black,transparent_82%)]" />
        <motion.div
          className="absolute left-[13%] top-[31%] h-64 w-64 rounded-full border border-primary/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-[19%] top-[37%] h-40 w-40 rounded-full border border-accent/35"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10">
          <div className="inline-flex h-20 items-center rounded-lg border bg-background/78 px-3 shadow-[0_18px_50px_hsl(var(--primary)/0.18)] backdrop-blur-xl">
            <span className="relative h-14 w-44 overflow-hidden rounded-md">
              <Image src="/brand/logo.png" alt="PrepNexo logo" fill sizes="176px" className="object-cover" priority />
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-12 max-w-xl"
          >
            <p className="inline-flex items-center gap-2 rounded-md border bg-background/72 px-3 py-2 text-sm font-semibold text-primary shadow-sm">
              <Sparkles className="size-4" />
              AI interview growth arena
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[1.02] tracking-normal xl:text-6xl">
              Learn faster. Compete harder. Walk in ready.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
              A pressure-built space for coding rounds, DSA battles, system design, and AI feedback that turns prep into momentum.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex min-h-[360px] items-center justify-center [perspective:1200px]">
          <motion.div
            className="relative h-[330px] w-[560px] [transform-style:preserve-3d]"
            animate={{ rotateX: [58, 62, 58], rotateZ: [-8, -4, -8] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-x-8 bottom-2 h-44 rounded-[50%] border border-foreground/10 bg-foreground/[0.03] blur-[1px] [transform:rotateX(70deg)]" />
            <motion.div
              className="absolute left-[205px] top-[86px] grid size-32 place-items-center rounded-lg border border-primary/45 bg-background/88 shadow-[0_28px_90px_hsl(var(--primary)/0.3)] backdrop-blur-xl [transform:translateZ(96px)]"
              animate={{ y: [-8, 8, -8], rotateY: [0, 12, 0] }}
              transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="grid size-20 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[0_16px_40px_hsl(var(--primary)/0.32)]">
                <BrainCircuit className="size-9" />
              </div>
            </motion.div>

            {[
              { icon: Code2, label: "Live round", value: "45:00", className: "left-8 top-7 [transform:translateZ(52px)_rotateY(-14deg)]" },
              { icon: Trophy, label: "Arena rank", value: "#18", className: "right-10 top-4 [transform:translateZ(64px)_rotateY(16deg)]" },
              { icon: Network, label: "Design", value: "Scale", className: "left-20 bottom-12 [transform:translateZ(44px)_rotateY(-18deg)]" },
              { icon: Zap, label: "Readiness", value: "82%", className: "right-16 bottom-16 [transform:translateZ(76px)_rotateY(12deg)]" }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  className={`absolute w-36 rounded-lg border bg-background/86 p-4 shadow-[0_18px_60px_rgb(0_0_0/0.18)] backdrop-blur-xl ${item.className}`}
                  animate={{ y: [0, index % 2 === 0 ? -14 : 14, 0] }}
                  transition={{ duration: 4.8 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Icon className="size-5 text-primary" />
                  <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-2xl font-black tracking-normal">{item.value}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3 text-sm">
          {["Realtime coding", "AI interviewer", "System battles"].map((item) => (
            <div key={item} className="rounded-lg border bg-background/72 p-4 font-semibold text-muted-foreground shadow-sm backdrop-blur-xl">{item}</div>
          ))}
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md rounded-lg border bg-card/92 p-6 shadow-tactical backdrop-blur-xl"
        >
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="relative h-14 w-40 overflow-hidden rounded-lg border bg-background">
              <Image src="/brand/logo.png" alt="PrepNexo logo" fill sizes="160px" className="object-cover" priority />
            </span>
          </div>
          <h2 className="text-2xl font-semibold tracking-normal">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </motion.div>
      </section>
    </main>
  );
}
