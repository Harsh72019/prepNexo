import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthCard title="Create your account" subtitle="Build your technical interview training profile.">
      <RegisterForm />
    </AuthCard>
  );
}
