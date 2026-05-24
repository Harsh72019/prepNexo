"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@interview-battlefield/ui/components/button";
import { Field } from "@interview-battlefield/ui/components/field";
import { Input } from "@interview-battlefield/ui/components/input";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

export function AdminLoginClient() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  async function submit(values: FormValues) {
    try {
      const response = await authApi.login(values);
      if (response.data.user.role !== "ADMIN") {
        toast.error("This account does not have admin access.");
        return;
      }
      setSession(response.data);
      toast.success("Admin access granted.");
      router.push("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Admin login failed");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_20%_18%,hsl(var(--primary)/0.18),transparent_28%),linear-gradient(145deg,hsl(var(--background)),hsl(var(--secondary)/0.55))] px-4 py-10">
      <section className="w-full max-w-md rounded-lg border bg-card/94 p-6 shadow-[0_24px_90px_rgb(0_0_0/0.22)] backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">PrepNexo Admin</p>
            <h1 className="text-2xl font-black tracking-normal">Control room login</h1>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
          <Field id="admin-email" label="Admin email" error={form.formState.errors.email?.message}>
            <Input id="admin-email" type="email" autoComplete="email" {...form.register("email")} />
          </Field>
          <Field id="admin-password" label="Password" error={form.formState.errors.password?.message}>
            <Input id="admin-password" type="password" autoComplete="current-password" {...form.register("password")} />
          </Field>
          <Button type="submit" loading={form.formState.isSubmitting}>
            <ShieldCheck className="size-4" />
            Enter admin panel
          </Button>
        </form>

        <div className="mt-5 flex justify-between text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-foreground">User login</Link>
          <Link href="/" className="hover:text-foreground">Back to site</Link>
        </div>
      </section>
    </main>
  );
}
