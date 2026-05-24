import { Button } from "@interview-battlefield/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@interview-battlefield/ui/components/card";
import { CreditCard, Database, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="grid gap-5">
      <section className="rounded-lg border bg-card/90 p-6 shadow-[0_18px_60px_rgb(0_0_0/0.18)]">
        <p className="text-sm font-semibold text-primary">Admin panel</p>
        <h1 className="mt-2 text-3xl font-black tracking-normal">PrepNexo control room</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Manage question inventory, monetization, and launch operations from one separate admin surface.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="size-5 text-primary" /> Question bank</CardTitle>
            <CardDescription>Add DSA, frontend, backend, system design, and company-tagged questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/questions">Open questions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="size-5 text-primary" /> Billing plans</CardTitle>
            <CardDescription>Update the Pro plan pricing, interval, and feature list.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/billing">Open plans</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /> Access rule</CardTitle>
          <CardDescription>Admin routes are still backed by the same auth service, but only users with role ADMIN can use them.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
