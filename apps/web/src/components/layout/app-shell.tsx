"use client";

import { Button } from "@interview-battlefield/ui/components/button";
import { Skeleton } from "@interview-battlefield/ui/components/skeleton";
import { motion } from "framer-motion";
import { BarChart3, Bot, Code2, CreditCard, Flame, LayoutDashboard, LogOut, Moon, Network, Shield, Swords, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-auth";
import { useOnboardingStatus } from "@/hooks/use-onboarding";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@interview-battlefield/ui/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coding", label: "AI Interview", icon: Code2 },
  { href: "/dsa-arena", label: "DSA arena", icon: Swords },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/system-design", label: "System design", icon: Network },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-coach", label: "AI coach", icon: Bot },
  { href: "/billing", label: "Billing", icon: CreditCard }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { data: user, isLoading } = useCurrentUser();
  const onboarding = useOnboardingStatus();
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    if (pathname === "/onboarding") return;
    if (onboarding.data && !onboarding.data.completed) router.replace("/onboarding");
  }, [onboarding.data, pathname, router]);

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/72 px-3 py-3 shadow-[0_18px_55px_rgb(0_0_0/0.18)] backdrop-blur-2xl md:px-6">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="group flex min-w-0 items-center gap-3">
              <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border bg-card p-1.5 shadow-[0_14px_36px_hsl(var(--primary)/0.25)] sm:size-16">
                <Image src="/brand/logo.png" alt="PrepNexo logo" fill sizes="64px" className="object-contain transition-transform group-hover:scale-105" priority />
              </span>
              <span className="min-w-0">
                <span className="block text-base font-black tracking-normal text-foreground sm:text-lg">PrepNexo</span>
                <span className="hidden items-center gap-1 text-xs font-medium text-muted-foreground sm:flex">
                  <Zap className="size-3 text-primary" />
                  Learn. Compete. Grow.
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-2 rounded-lg border bg-card/62 px-3 py-2 text-sm shadow-sm lg:flex">
              <Flame className="size-4 text-primary" />
              <span className="font-semibold">{user?.name?.split(" ")[0] ?? "Candidate"}</span>
              <span className="text-muted-foreground">is in grind mode</span>
            </div>

            <div className="flex items-center gap-2">
              {isLoading ? <Skeleton className="hidden h-10 w-40 sm:block" /> : (
                <div className="hidden max-w-48 rounded-lg border bg-card/62 px-3 py-2 text-right text-xs shadow-sm sm:block">
                  <p className="truncate font-semibold">{user?.name ?? "Guest candidate"}</p>
                  <p className="truncate text-muted-foreground">{user?.email ?? "Not signed in"}</p>
                </div>
              )}
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
                <Moon className="size-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={logout} aria-label="Logout">
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>

          <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[...navItems, ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin", icon: Shield }, { href: "/admin/questions", label: "Questions", icon: Shield }, { href: "/admin/billing", label: "Plans", icon: CreditCard }] : [])].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex h-10 shrink-0 items-center gap-2 rounded-lg border border-transparent px-3 text-sm font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-border hover:bg-card/78 hover:text-foreground hover:shadow-sm",
                    active && "border-primary/35 bg-primary text-primary-foreground shadow-[0_12px_34px_hsl(var(--primary)/0.28)]"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto max-w-[1680px] px-3 py-5 md:px-6 lg:px-8"
      >
        {children}
      </motion.main>
    </div>
  );
}
