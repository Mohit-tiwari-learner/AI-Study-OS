import { Link, useRouterState } from "@tanstack/react-router";
import { Brain, LayoutDashboard, Mic, FileText, CalendarRange, MessageCircleQuestion } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/notes", label: "Voice → Notes", icon: Mic },
  { to: "/summary", label: "Summary & Quiz", icon: FileText },
  { to: "/planner", label: "Study Planner", icon: CalendarRange },
  { to: "/doubt", label: "Doubt Solver", icon: MessageCircleQuestion },
] as const;

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col p-5 gap-5">
      {/* Brand */}
      <Link to="/" className="nm-flat p-4 flex items-center gap-3 group hover:scale-[0.99] transition-transform active:scale-[0.97]">
        <div className="nm-flat-sm p-2.5 animate-[float_4s_ease-in-out_infinite]">
          <Brain className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <p className="font-display font-semibold text-base leading-none">AI Study OS</p>
          <p className="label-text mt-1">v1.0 · MVP</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = path === to;
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                active
                  ? "nm-inset text-primary"
                  : "text-foreground/70 hover:text-primary hover:translate-x-1"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Pro tip */}
      <div className="mt-auto nm-flat p-4 text-xs text-muted-foreground">
        <p className="font-display text-foreground font-semibold">Pro tip</p>
        <p className="mt-1">Press ⌘K to focus search anywhere.</p>
      </div>
    </aside>
  );
}
