import { Button } from "@interview-battlefield/ui/components/button";
import {
  ArrowRight,
  BarChart3,
  Code2,
  Network,
  Swords,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PrepNexo - Train for Real Technical Interviews",
  description:
    "PrepNexo helps candidates train for real technical interviews with AI mock interviews, daily DSA arena battles, system design practice, and adaptive analytics.",
  alternates: {
    canonical: "/",
  },
};

const features = [
  {
    title: "AI mock interviews",
    description:
      "Company-style rounds with timed questions, no-paste discipline, verdicts, follow-ups, and improvement signals.",
    icon: Code2,
  },
  {
    title: "Daily DSA arena",
    description:
      "Compete in live ranked rooms, solve adaptive questions, climb standings, and build a daily prep habit.",
    icon: Swords,
  },
  {
    title: "System design lab",
    description:
      "Build architecture canvases, connect components, inject failures, and get practical AI critique.",
    icon: Network,
  },
  {
    title: "Adaptive dashboard",
    description:
      "Track readiness, weak topics, streaks, attempts, and what to practice next without noisy vanity metrics.",
    icon: BarChart3,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PrepNexo",
  alternateName: "prepnexo",
  url: "https://prepnexo.online",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description:
    "PrepNexo helps software engineering candidates train for real technical interviews with AI mock interviews, DSA arena battles, system design practice, and adaptive analytics.",
  image: "https://prepnexo.online/brand/logo.png",
  brand: {
    "@type": "Brand",
    name: "PrepNexo",
    url: "https://prepnexo.online",
  },
  offers: [
    {
      "@type": "Offer",
      name: "PrepNexo Free",
      price: "0",
      priceCurrency: "INR",
    },
    {
      "@type": "Offer",
      name: "PrepNexo Pro",
      price: "399",
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "399",
        priceCurrency: "INR",
        billingDuration: "P1M",
      },
    },
    {
      "@type": "Offer",
      name: "PrepNexo Pro Yearly",
      price: "2999",
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "2999",
        priceCurrency: "INR",
        billingDuration: "P1Y",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="border-b bg-background/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="PrepNexo home"
          >
            <span className="relative grid size-12 place-items-center overflow-hidden rounded-lg border bg-card p-1.5 shadow-[0_12px_34px_hsl(var(--primary)/0.22)]">
              <Image
                src="/brand/logo.png"
                alt="PrepNexo logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </span>
            <span>
              <span className="block text-lg font-black tracking-normal">
                PrepNexo
              </span>
              <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                Learn. Compete. Grow.
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="arena-surface border-b">
        <div className="mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-semibold text-primary">
              <Zap className="size-4" />
              Train for real technical interviews
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-normal md:text-6xl">
              PrepNexo helps you train for real technical interviews.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Practice AI mock interviews, compete in the daily DSA arena,
              improve system design, and understand exactly what to work on
              next.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Create free account
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-2xl font-black">1/day</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  free AI interview
                </p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-2xl font-black">Live</p>
                <p className="mt-1 text-sm text-muted-foreground">DSA arena</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-2xl font-black">₹399</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pro monthly
                </p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4 sm:col-span-3">
                <p className="text-2xl font-black">₹2999/year</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Best value for serious prep with fair-usage AI interviews
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card/78 p-4 shadow-[0_28px_90px_rgb(0_0_0/0.24)]">
            <div className="rounded-md border bg-background/70 p-4">
              <div className="flex items-center justify-between gap-3 border-b pb-4">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    Today&apos;s prep room
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-normal">
                    Google DSA Round
                  </h2>
                </div>
                <div className="rounded-md border bg-background px-3 py-2 text-sm font-semibold">
                  42:18
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  [
                    "AI interviewer",
                    "Verdict, approach, complexity, follow-up",
                  ],
                  ["DSA arena", "4 adaptive questions with live rankings"],
                  ["System design", "Canvas critique with failure injection"],
                  ["Dashboard", "Readiness, weak topics, streaks"],
                ].map(([title, detail], index) => (
                  <div
                    key={title}
                    className="grid grid-cols-[36px_1fr] gap-3 rounded-md border bg-background/60 p-3"
                  >
                    <div className="grid size-9 place-items-center rounded-md bg-primary/10 text-sm font-black text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-muted-foreground">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-primary">Why PrepNexo</p>
          <h2 className="mt-2 text-3xl font-black tracking-normal md:text-4xl">
            AI mock interviews, DSA battles, and system design practice in one
            loop.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-lg border bg-card/78 p-5"
              >
                <Icon className="size-6 text-primary" />
                <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 md:flex-row md:items-center md:px-6">
          <div>
            <p className="text-sm font-semibold text-primary">PrepNexo</p>
            <h2 className="mt-2 text-2xl font-black tracking-normal">
              Start training for real technical interviews today.
            </h2>
          </div>
          <Button asChild size="lg">
            <Link href="/register">
              Join PrepNexo
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground md:px-6">
        <p>
          PrepNexo - AI interview prep, DSA arena, system design practice, and
          adaptive analytics.
        </p>
      </footer>
    </main>
  );
}
