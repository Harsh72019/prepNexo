"use client";

import { Button } from "@interview-battlefield/ui/components/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

export function VerifyEmailPanel() {
  const token = useSearchParams().get("token") ?? "";
  const [loading, setLoading] = useState(false);

  async function verify() {
    setLoading(true);
    try {
      await authApi.verifyEmail(token);
      toast.success("Email verified.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Button onClick={verify} loading={loading} disabled={!token}>Verify email</Button>
      <Button asChild variant="link">
        <Link href="/dashboard">Return to dashboard</Link>
      </Button>
    </div>
  );
}
