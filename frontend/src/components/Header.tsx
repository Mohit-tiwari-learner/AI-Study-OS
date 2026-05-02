import { Bell, Moon, Search, Sun, User, LogOut, Settings } from "lucide-react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import AuthModal from "./AuthModal";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/notes": "Voice → Notes",
  "/summary": "Summary & Quiz",
  "/planner": "Study Planner",
  "/doubt": "Doubt Solver",
};

export function Header() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const title = titles[path] ?? "AI Study OS";

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-30 h-18 px-5 lg:px-8 flex items-center gap-4 bg-background/70 backdrop-blur-xl">
      <AuthModal isOpen={authModalOpen} onOpenChange={setAuthModalOpen} />

      {/* Page title */}
      <div className="flex flex-col gap-1">
        <p className="label-text">Workspace</p>
        <h1 className="text-lg font-display font-semibold leading-none">{title}</h1>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 nm-input px-4 h-11 w-[280px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search notes, plans, doubts…"
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground">⌘K</kbd>
        </div>

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="nm-button h-11 w-11 flex items-center justify-center"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        <button
          aria-label="Notifications"
          className="nm-button h-11 w-11 flex items-center justify-center relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose" />
        </button>

        {user ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="nm-button h-11 px-2.5 flex items-center gap-2 group">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-foreground/80">
                  {user.displayName?.split(" ")[0] || "Account"}
                </span>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-[50] min-w-[180px] nm-flat p-2 mt-2 outline-none animate-in fade-in zoom-in-95 duration-200"
                align="end"
              >
                <div className="px-2 py-1.5 mb-1">
                  <p className="text-[10px] label-text uppercase">Account</p>
                  <p className="text-xs font-medium truncate">{user.email}</p>
                </div>
                <DropdownMenu.Separator className="h-px bg-border/50 my-1" />
                <DropdownMenu.Item className="flex items-center gap-2 px-2 py-2 text-xs font-medium rounded-lg hover:bg-muted cursor-pointer outline-none transition-colors">
                  <User className="h-3.5 w-3.5" /> Profile Settings
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-2 py-2 text-xs font-medium rounded-lg hover:bg-muted cursor-pointer outline-none transition-colors">
                  <Settings className="h-3.5 w-3.5" /> Workspace Config
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-border/50 my-1" />
                <DropdownMenu.Item
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 py-2 text-xs font-medium rounded-lg text-rose hover:bg-rose/5 cursor-pointer outline-none transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" /> Log Out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="nm-button h-11 px-5 flex items-center gap-2 text-xs font-bold text-primary"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
