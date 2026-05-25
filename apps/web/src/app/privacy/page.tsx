import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "PrepNexo privacy policy for account, interview practice, analytics, and billing data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground md:px-6">
      <article className="mx-auto max-w-3xl rounded-lg border bg-card/80 p-6 shadow-sm">
        <Link href="/" className="text-sm font-semibold text-primary">
          PrepNexo
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-normal">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: May 26, 2026
        </p>
        <div className="mt-8 grid gap-5 text-sm leading-7 text-muted-foreground">
          <p>
            PrepNexo is an interview preparation web application. We collect the
            information needed to create accounts, authenticate users, run mock
            interviews, save practice attempts, show analytics, and process
            subscriptions.
          </p>
          <section>
            <h2 className="text-lg font-bold text-foreground">
              Information we collect
            </h2>
            <p className="mt-2">
              We may collect your name, email address, authentication provider
              profile, onboarding preferences, practice attempts, question
              progress, billing status, and product usage signals such as
              streaks, scores, and completed sessions.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground">
              How we use information
            </h2>
            <p className="mt-2">
              We use this information to provide PrepNexo features, personalize
              practice recommendations, protect accounts, process payments,
              improve product quality, and send account-related communication.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground">
              Payments and third parties
            </h2>
            <p className="mt-2">
              Payments are processed by Razorpay. Google OAuth may be used for
              sign in. AI feedback may be generated through configured AI
              providers. We do not sell personal information.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground">Contact</h2>
            <p className="mt-2">
              For privacy or account questions, contact{" "}
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
