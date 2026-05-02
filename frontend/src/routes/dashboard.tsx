import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Terminal } from "@/components/Terminal";
import { SectionHeader } from "@/components/SectionHeader";
import { BookOpen, Brain, Clock, Target, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Study OS" },
      { name: "description", content: "Your study workspace at a glance: notes, focus time, plans and quizzes." },
    ],
  }),
  component: DashboardPage,
});

const activity = [
  { icon: Brain, title: "Generated 5 quiz questions", meta: "Photosynthesis · 2m ago", color: "text-indigo" },
  { icon: BookOpen, title: "Notes structured from voice", meta: "Calculus L4 · 18m ago", color: "text-emerald" },
  { icon: Target, title: "Study plan updated", meta: "Physics Mid-term · 1h ago", color: "text-violet" },
  { icon: Sparkles, title: "Solved doubt (Hinglish)", meta: "Newton's 3rd law · 3h ago", color: "text-rose" },
];

function DashboardPage() {
  return (
    <AppShell>
      {/* Stat cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Notes captured" value={142} trend="+12% this week" status="active" accent="indigo" />
        <StatCard icon={Brain} label="Quizzes generated" value={37} trend="+5 today" status="ready" accent="violet" />
        <StatCard icon={Clock} label="Focus minutes" value={1280} trend="+8% vs last week" status="streak" accent="emerald" />
        <StatCard icon={Target} label="Plan adherence" value={86} trend="+4% boost" status="on track" accent="rose" />
      </div>

      {/* Activity + Pulse */}
      <div className="grid gap-6 mt-6 grid-cols-1 lg:grid-cols-3">
        <div className="nm-flat p-6 lg:col-span-2">
          <SectionHeader title="Recent activity" badge="live" />
          <ul className="space-y-3">
            {activity.map((a, i) => (
              <li
                key={i}
                className="nm-flat-sm p-4 flex items-center gap-4 animate-[fade-in-up_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="nm-inset h-10 w-10 flex items-center justify-center">
                  <a.icon className={`h-4 w-4 ${a.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.meta}</p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">#{1000 + i}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="nm-flat p-6 space-y-5">
          <SectionHeader title="Hardware pulse" badge="healthy" badgeColor="text-emerald" />
          <ProgressBar label="Gemini latency" value={72} color="indigo" />
          <ProgressBar label="Memory cache" value={48} color="emerald" />
          <ProgressBar label="Token budget" value={91} color="violet" />
          <ProgressBar label="Session quality" value={84} color="rose" />
        </div>
      </div>

      {/* Interactive Whiteboard */}
      <div className="mt-6 space-y-4">
        <SectionHeader title="Interactive Whiteboard" badge="beta" badgeColor="text-violet" />
        <div className="nm-flat h-64 sm:h-96 w-full rounded-2xl flex items-center justify-center bg-white/50 dark:bg-black/10 border-2 border-dashed border-border/50 relative overflow-hidden group">
          <div className="text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            <p className="text-muted-foreground font-medium">AI Whiteboard Canvas</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Start sketching or typing equations...</p>
          </div>
        </div>
        
        {/* Toggle Button Below Whiteboard */}
        <div className="flex items-center space-x-2 pt-2">
          <Switch id="ai-assist" />
          <Label htmlFor="ai-assist" className="cursor-pointer">Enable AI Real-time Assist</Label>
        </div>
      </div>

      {/* Terminal */}
      <div className="mt-6">
        <Terminal />
      </div>
    </AppShell>
  );
}
