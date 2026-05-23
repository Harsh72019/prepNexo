import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Reset password" subtitle="Enter your email and we will send recovery instructions.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
