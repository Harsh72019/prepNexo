import type { DashboardTopic } from "@interview-battlefield/types";

type ReadinessRadarProps = {
  topics: DashboardTopic[];
};

export function ReadinessRadar({ topics }: ReadinessRadarProps) {
  const size = 260;
  const center = size / 2;
  const radius = 96;
  const plotted = topics.slice(0, 6);
  const points = plotted.map((topic, index) => {
    const angle = (Math.PI * 2 * index) / plotted.length - Math.PI / 2;
    const distance = radius * (topic.proficiency / 100);
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      labelX: center + Math.cos(angle) * (radius + 26),
      labelY: center + Math.sin(angle) * (radius + 26),
      topic
    };
  });
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="aspect-square w-full max-w-[300px]" role="img" aria-label="Topic readiness radar">
        {[0.25, 0.5, 0.75, 1].map((ring) => (
          <circle key={ring} cx={center} cy={center} r={radius * ring} fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        ))}
        {points.map((point) => (
          <line key={point.topic.topic} x1={center} y1={center} x2={point.labelX} y2={point.labelY} stroke="hsl(var(--border))" strokeWidth="1" />
        ))}
        <polygon points={polygon} fill="hsl(var(--primary) / 0.22)" stroke="hsl(var(--primary))" strokeWidth="2" />
        {points.map((point) => (
          <g key={point.topic.topic}>
            <circle cx={point.x} cy={point.y} r="4" fill="hsl(var(--primary))" />
            <text x={point.labelX} y={point.labelY} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
              {point.topic.topic.length > 12 ? `${point.topic.topic.slice(0, 10)}...` : point.topic.topic}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
