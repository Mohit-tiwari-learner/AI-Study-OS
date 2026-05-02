import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RippleButton } from "@/components/RippleButton";
import { SectionHeader } from "@/components/SectionHeader";
import { callApi } from "@/lib/api";
import { CalendarRange, Loader2 } from "lucide-react";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner — AI Study OS" },
      { name: "description", content: "Generate a day-wise study plan from your syllabus and deadline." },
    ],
  }),
  component: PlannerPage,
});

interface Day {
  day: number;
  date?: string;
  focus: string;
  tasks: string[];
}

function PlannerPage() {
  const [syllabus, setSyllabus] = useState("");
  const [deadline, setDeadline] = useState("");
  const [hours, setHours] = useState(2);
  const [plan, setPlan] = useState<Day[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const run = async () => {
    if (!syllabus.trim() || !deadline) return;
    setLoading(true);
    setErr("");
    setPlan([]);
    try {
      const data = await callApi<{ plan: Day[] }>("/api/planner", { syllabus, deadline, hoursPerDay: hours });
      setPlan(data.plan ?? []);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input panel */}
        <section className="nm-flat p-6 space-y-4">
          <SectionHeader title="Inputs" />

          <div className="space-y-2">
            <label className="label-text">Syllabus</label>
            <textarea
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              placeholder="e.g. Chapters: Kinematics, Laws of Motion, Work-Energy, Rotational dynamics…"
              className="nm-input w-full h-40 p-4 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="label-text">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="nm-input w-full p-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="label-text">Hours/day</label>
              <input
                type="number"
                min={1}
                max={12}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="nm-input w-full p-3 text-sm"
              />
            </div>
          </div>

          <RippleButton variant="primary" onClick={run} disabled={loading} className="flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarRange className="h-4 w-4" />}
            {loading ? "Planning…" : "Generate plan"}
          </RippleButton>
          {err && <p className="text-xs text-rose">{err}</p>}
        </section>

        {/* Output panel */}
        <section className="lg:col-span-2 nm-flat p-6">
          <SectionHeader
            title="Day-wise plan"
            badge={`${plan.length} days`}
          />
          {plan.length === 0 ? (
            <div className="nm-inset p-10 text-center text-sm text-muted-foreground italic">
              Your plan will appear here.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {plan.map((d, i) => (
                <div
                  key={i}
                  className="nm-flat-sm p-4 animate-[fade-in-up_0.4s_both]"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">Day {d.day}</span>
                    {d.date && <span className="text-xs text-muted-foreground">{d.date}</span>}
                  </div>
                  <p className="font-display font-semibold mt-1 text-primary">{d.focus}</p>
                  <ul className="mt-2 space-y-1 text-xs text-foreground/80 list-disc list-inside">
                    {d.tasks.map((t, j) => (
                      <li key={j}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
