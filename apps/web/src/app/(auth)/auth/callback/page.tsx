"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@interview-battlefield/ui/components/skeleton";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    async function hydrate() {
      const accessToken = params.get("accessToken");
      const refreshToken = params.get("refreshToken");
      if (!accessToken || !refreshToken) {
        router.replace("/login");
        return;
      }

      try {
        const user = await authApi.me(accessToken);
        setSession({ user: user.data, accessToken, refreshToken });
        router.replace("/dashboard");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not complete Google sign in");
        router.replace("/login");
      }
    }

    void hydrate();
  }, [params, router, setSession]);

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6">
        <p className="text-sm font-medium text-primary">Completing sign in</p>
        <Skeleton className="mt-4 h-3 w-full" />
      </div>
    </main>
  );
}
