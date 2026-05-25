import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact PrepNexo support.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground md:px-6">
      <section className="mx-auto max-w-3xl rounded-lg border bg-card/80 p-6 shadow-sm">
        <Link href="/" className="text-sm font-semibold text-primary">
          PrepNexo
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-normal">Contact</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          PrepNexo is an interview preparation platform for mock interviews, DSA
          practice, system design practice, and adaptive analytics.
        </p>
        <div className="mt-8 rounded-lg border bg-background/70 p-5">
          <p className="text-sm font-semibold text-foreground">Support email</p>
          <a
            className="mt-2 block text-primary"
            href="mailto:support@prepnexo.online"
          >
            support@prepnexo.online
          </a>
        </div>
      </section>
    </main>
  );
}
