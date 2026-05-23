import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Choose a new password" subtitle="Use the recovery link from your email to set a new password.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
