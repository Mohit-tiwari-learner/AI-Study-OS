interface Props {
  label: string;
  value: number; // 0-100
  color?: "indigo" | "emerald" | "rose" | "violet";
}

const colorMap = {
  indigo: "from-indigo to-violet",
  emerald: "from-emerald to-indigo",
  rose: "from-rose to-violet",
  violet: "from-violet to-indigo",
} as const;

export function ProgressBar({ label, value, color = "indigo" }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-foreground/80">{label}</span>
        <span className="text-muted-foreground font-mono">{value}%</span>
      </div>
      <div className="nm-inset h-3 w-full overflow-hidden">
        <div
          className={`relative h-full rounded-lg bg-gradient-to-r ${colorMap[color]} transition-all duration-700`}
          style={{
            width: `${value}%`,
            filter: "drop-shadow(0 0 6px color-mix(in oklab, var(--primary) 40%, transparent))",
          }}
        >
          <div className="absolute inset-0 shimmer-bar" />
        </div>
      </div>
    </div>
  );
}
