import { LucideIcon } from "lucide-react";
import { Counter } from "./Counter";

interface Props {
  icon: LucideIcon;
  label: string;
  value: number;
  trend: string;
  status: string;
  accent?: "indigo" | "emerald" | "rose" | "violet";
}

const accentText: Record<string, string> = {
  indigo: "text-indigo",
  emerald: "text-emerald",
  rose: "text-rose",
  violet: "text-violet",
};

export function StatCard({ icon: Icon, label, value, trend, status, accent = "indigo" }: Props) {
  return (
    <div className="nm-flat p-6 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="nm-flat-sm p-3 animate-[float_4s_ease-in-out_infinite]">
          <Icon className={`h-5 w-5 ${accentText[accent]}`} />
        </div>
        <span className="status-badge">{status}</span>
      </div>

      <div className="mt-5">
        <p className="label-text">{label}</p>
        <p className="mt-1.5 text-3xl">
          <Counter value={value} />
        </p>
        <p className="mt-1.5 text-xs font-medium text-emerald">{trend}</p>
      </div>
    </div>
  );
}
