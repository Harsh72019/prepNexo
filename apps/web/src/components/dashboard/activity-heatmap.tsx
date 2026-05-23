import type { DashboardHeatmapDay } from "@interview-battlefield/types";
import { cn } from "@interview-battlefield/ui/lib/utils";

type ActivityHeatmapProps = {
  days: DashboardHeatmapDay[];
};

function intensity(sessions: number) {
  if (sessions <= 0) return "bg-muted";
  if (sessions === 1) return "bg-primary/35";
  if (sessions === 2) return "bg-primary/65";
  return "bg-primary";
}

export function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, index) => (
        <div
          key={`${day.date}-${index}`}
          className={cn("aspect-square rounded-md border border-border", intensity(day.sessions))}
          title={`${new Date(day.date).toLocaleDateString()}: ${day.sessions} sessions, ${day.minutes} minutes`}
        />
      ))}
    </div>
  );
}
