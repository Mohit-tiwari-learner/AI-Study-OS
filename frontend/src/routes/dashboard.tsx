import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Terminal } from "@/components/Terminal";
import { AIWhiteboard } from "@/components/AIWhiteboard";
import { SectionHeader } from "@/components/SectionHeader";
import { BookOpen, Brain, Clock, Target, Sparkles, Inbox } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Study OS" },
      { name: "description", content: "Your study workspace at a glance: notes, focus time, plans and quizzes." },
    ],
  }),
  component: DashboardPage,
});

/* ── Per-user data helpers ────────────────────────────────────── */

interface UserStats {
  notesCaptured: number;
  quizzesGenerated: number;
  focusMinutes: number;
  planAdherence: number;
}

interface ActivityItem {
  iconName: string;
  title: string;
  meta: string;
  color: string;
}

const ICON_MAP: Record<string, any> = {
  Brain, BookOpen, Target, Sparkles, Clock,
};

const DEFAULT_STATS: UserStats = {
  notesCaptured: 0,
  quizzesGenerated: 0,
  focusMinutes: 0,
  planAdherence: 0,
};

function getStorageKey(uid: string, suffix: string) {
  return `studyos_${uid}_${suffix}`;
}

function loadUserStats(uid: string): UserStats {
  try {
    const raw = localStorage.getItem(getStorageKey(uid, "stats"));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { ...DEFAULT_STATS };
}

function saveUserStats(uid: string, stats: UserStats) {
  try {
    localStorage.setItem(getStorageKey(uid, "stats"), JSON.stringify(stats));
  } catch { /* ignore */ }
}

function loadUserActivity(uid: string): ActivityItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(uid, "activity"));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveUserActivity(uid: string, items: ActivityItem[]) {
  try {
    localStorage.setItem(getStorageKey(uid, "activity"), JSON.stringify(items));
  } catch { /* ignore */ }
}

/* ── Dashboard Page ───────────────────────────────────────────── */

function DashboardPage() {
  const { user } = useAuth();
  const [aiAssistEnabled, setAiAssistEnabled] = useState(false);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const onboarding = user?.onboardingData;

  // Load user-specific data whenever user changes
  useEffect(() => {
    if (user?.uid) {
      setStats(loadUserStats(user.uid));
      setActivity(loadUserActivity(user.uid));
    } else {
      // No user → reset to defaults
      setStats({ ...DEFAULT_STATS });
      setActivity([]);
    }
  }, [user?.uid]);

  // Persist stats when they change
  useEffect(() => {
    if (user?.uid) {
      saveUserStats(user.uid, stats);
    }
  }, [stats, user?.uid]);

  // Persist activity when it changes
  useEffect(() => {
    if (user?.uid) {
      saveUserActivity(user.uid, activity);
    }
  }, [activity, user?.uid]);

  const statusForStat = useCallback((val: number) => {
    if (val === 0) return "new";
    if (val < 10) return "starting";
    return "active";
  }, []);

  return (
    <AppShell>
      {/* Welcome Message */}
      <div className="mb-8 animate-[fade-in_0.6s_ease-out_both]">
        <h2 className="text-3xl font-display font-black tracking-tight text-foreground">
          {onboarding ? (
            <>Hi {user?.displayName?.split(" ")[0]}, let's plan your {onboarding.class} {onboarding.goal === "Exam Prep" ? "exams" : "studies"} 🎯</>
          ) : (
            <>Welcome to your Study Space</>
          )}
        </h2>
        <p className="text-muted-foreground mt-1 font-medium">
          {onboarding 
            ? `Tailoring AI for ${onboarding.subjects} · ${onboarding.learningStyle} mode active.`
            : "Your personal AI Study OS is ready."}
        </p>
      </div>

      {/* Stat cards — user-specific, starts at 0 for new users */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Notes captured" value={stats.notesCaptured} trend={stats.notesCaptured > 0 ? "Keep it up!" : "Start capturing"} status={statusForStat(stats.notesCaptured)} accent="indigo" />
        <StatCard icon={Brain} label="Quizzes generated" value={stats.quizzesGenerated} trend={stats.quizzesGenerated > 0 ? "Great progress!" : "Try a quiz"} status={statusForStat(stats.quizzesGenerated)} accent="violet" />
        <StatCard icon={Clock} label="Focus minutes" value={stats.focusMinutes} trend={stats.focusMinutes > 0 ? "Stay focused!" : "Start studying"} status={stats.focusMinutes > 60 ? "streak" : "new"} accent="emerald" />
        <StatCard icon={Target} label="Plan adherence" value={stats.planAdherence} trend={stats.planAdherence > 0 ? `${stats.planAdherence}% on track` : "Create a plan"} status={stats.planAdherence > 50 ? "on track" : "new"} accent="rose" />
      </div>

      {/* Activity + Pulse */}
      <div className="grid gap-6 mt-6 grid-cols-1 lg:grid-cols-3">
        <div className="nm-flat p-6 lg:col-span-2">
          <SectionHeader title="Recent activity" badge={activity.length > 0 ? "live" : "empty"} />
          {activity.length > 0 ? (
            <ul className="space-y-3">
              {activity.map((a, i) => {
                const IconComp = ICON_MAP[a.iconName] || Sparkles;
                return (
                  <li
                    key={i}
                    className="nm-flat-sm p-4 flex items-center gap-4 animate-[fade-in-up_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="nm-inset h-10 w-10 flex items-center justify-center">
                      <IconComp className={`h-4 w-4 ${a.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.meta}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="nm-inset h-14 w-14 flex items-center justify-center mb-4">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Start using Notes, Planner, or Doubt Solver to see your activity here.</p>
            </div>
          )}
        </div>

        <div className="nm-flat p-6 space-y-5">
          <SectionHeader title="System pulse" badge="healthy" badgeColor="text-emerald" />
          <ProgressBar label="Gemini latency" value={72} color="indigo" />
          <ProgressBar label="Memory cache" value={48} color="emerald" />
          <ProgressBar label="Token budget" value={91} color="violet" />
          <ProgressBar label="Session quality" value={84} color="rose" />
        </div>
      </div>

      {/* Interactive Whiteboard */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title="Interactive Whiteboard" badge="beta" badgeColor="text-violet" />
          <div className="flex items-center space-x-2">
            <Switch 
              id="ai-assist" 
              checked={aiAssistEnabled}
              onCheckedChange={setAiAssistEnabled}
            />
            <Label htmlFor="ai-assist" className="cursor-pointer text-xs font-bold text-muted-foreground">AI ASSIST</Label>
          </div>
        </div>

        <div className={cn(
          "transition-all duration-500",
          aiAssistEnabled ? "opacity-100 scale-100" : "opacity-40 grayscale-[0.5] scale-[0.98] pointer-events-none"
        )}>
          <AIWhiteboard />
        </div>
        
        {!aiAssistEnabled && (
          <p className="text-center text-xs text-muted-foreground animate-pulse">
            Toggle <b>AI ASSIST</b> to start sketching and using smart features.
          </p>
        )}
      </div>

      {/* Terminal */}
      <div className="mt-6">
        <Terminal />
      </div>
    </AppShell>
  );
}
