import { Skeleton } from "@interview-battlefield/ui/components/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <Skeleton className="h-14 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    </main>
  );
}
