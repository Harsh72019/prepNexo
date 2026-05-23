"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@interview-battlefield/ui/components/button";
import { Field } from "@interview-battlefield/ui/components/field";
import { Input } from "@interview-battlefield/ui/components/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authApi } from "@/lib/api";

const schema = z.object({
  password: z.string().min(10, "Use at least 10 characters")
});

type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { password: "" } });

  async function submit(values: FormValues) {
    await authApi.resetPassword({ token, password: values.password });
    toast.success("Password updated. You can log in now.");
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
      <Field id="password" label="New password" error={form.formState.errors.password?.message}>
        <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
      </Field>
      <Button type="submit" loading={form.formState.isSubmitting} disabled={!token}>Update password</Button>
      <Button asChild variant="link" type="button">
        <Link href="/login">Back to login</Link>
      </Button>
    </form>
  );
}
