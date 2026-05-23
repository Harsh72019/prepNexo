"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@interview-battlefield/ui/components/button";
import { Field } from "@interview-battlefield/ui/components/field";
import { Input } from "@interview-battlefield/ui/components/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLogin } from "@/hooks/use-auth";
import { env } from "@/lib/env";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const login = useLogin();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit((values) => login.mutate(values))}>
      <Field id="email" label="Email" error={form.formState.errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </Field>
      <Field id="password" label="Password" error={form.formState.errors.password?.message}>
        <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
      </Field>
      <Button type="submit" loading={login.isPending}>Enter arena</Button>
      <Button asChild variant="outline" type="button">
        <a href={`${env.authServiceUrl}/api/auth/google`}>Continue with Google</a>
      </Button>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <Link className="hover:text-foreground" href="/forgot-password">Forgot password?</Link>
        <Link className="hover:text-foreground" href="/register">Create account</Link>
      </div>
    </form>
  );
}
