"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@interview-battlefield/ui/components/button";
import { Field } from "@interview-battlefield/ui/components/field";
import { Input } from "@interview-battlefield/ui/components/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRegister } from "@/hooks/use-auth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(10, "Use at least 10 characters")
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const register = useRegister();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" }
  });

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit((values) => register.mutate(values))}>
      <Field id="name" label="Name" error={form.formState.errors.name?.message}>
        <Input id="name" autoComplete="name" {...form.register("name")} />
      </Field>
      <Field id="email" label="Email" error={form.formState.errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </Field>
      <Field id="password" label="Password" error={form.formState.errors.password?.message}>
        <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
      </Field>
      <Button type="submit" loading={register.isPending}>Create account</Button>
      <p className="text-center text-sm text-muted-foreground">
        Already training? <Link className="text-primary hover:underline" href="/login">Log in</Link>
      </p>
    </form>
  );
}
