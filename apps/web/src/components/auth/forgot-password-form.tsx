"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@interview-battlefield/ui/components/button";
import { Field } from "@interview-battlefield/ui/components/field";
import { Input } from "@interview-battlefield/ui/components/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authApi } from "@/lib/api";

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  async function submit(values: FormValues) {
    await authApi.forgotPassword(values.email);
    toast.success("If an account exists, reset instructions are on the way.");
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
      <Field id="email" label="Email" error={form.formState.errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </Field>
      <Button type="submit" loading={form.formState.isSubmitting}>Send reset link</Button>
      <Button asChild variant="link" type="button">
        <Link href="/login">Back to login</Link>
      </Button>
    </form>
  );
}
