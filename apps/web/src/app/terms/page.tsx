import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "PrepNexo terms for using interview preparation features.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground md:px-6">
      <article className="mx-auto max-w-3xl rounded-lg border bg-card/80 p-6 shadow-sm">
        <Link href="/" className="text-sm font-semibold text-primary">
          PrepNexo
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-normal">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: May 26, 2026
        </p>
        <div className="mt-8 grid gap-5 text-sm leading-7 text-muted-foreground">
          <p>
            By using PrepNexo, you agree to use the service for legitimate
            interview preparation and learning. PrepNexo provides practice
            tools, AI feedback, DSA arena features, dashboards, and question
            libraries.
          </p>
          <section>
            <h2 className="text-lg font-bold text-foreground">Account use</h2>
            <p className="mt-2">
              You are responsible for keeping your account secure. Do not share
              credentials, abuse AI features, attack the platform, or use the
              service for deceptive or harmful activity.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground">
              Practice content
            </h2>
            <p className="mt-2">
              PrepNexo content is provided for education and practice. We do not
              guarantee job placement, interview outcomes, or employer-specific
              results.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground">Billing</h2>
            <p className="mt-2">
              Paid plans unlock additional preparation features under fair usage
              limits. Payments are handled by Razorpay and access begins after
              payment verification.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground">Contact</h2>
            <p className="mt-2">
              For support, contact{" "}
              <a className="text-primary" href="mailto:support@prepnexo.online">
                support@prepnexo.online
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
