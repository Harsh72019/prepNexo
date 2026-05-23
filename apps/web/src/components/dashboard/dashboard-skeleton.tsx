import { Skeleton } from "@interview-battlefield/ui/components/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-32" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </section>
    </div>
  );
}
