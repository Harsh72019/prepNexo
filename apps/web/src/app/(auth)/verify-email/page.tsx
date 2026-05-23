import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";

export default function VerifyEmailPage() {
  return (
    <AuthCard title="Verify email" subtitle="Confirm your email so your account can receive interview reports.">
      <VerifyEmailPanel />
    </AuthCard>
  );
}
