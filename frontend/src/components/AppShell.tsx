import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";
import { Lock, Zap, Chrome, ArrowRight } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, loginWithGoogle, loginAnonymously } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const handleInstantAccess = async () => {
    setIsLaunching(true);
    try {
      await loginAnonymously();
    } finally {
      setIsLaunching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 nm-flat rounded-full animate-spin border-t-2 border-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing OS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      <AuthModal isOpen={authModalOpen} onOpenChange={setAuthModalOpen} />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 px-5 lg:px-8 pt-6 pb-10 overflow-auto">
          {!user ? (
            <div className="h-[70vh] flex items-center justify-center">
              <div className="nm-flat max-w-md w-full p-10 text-center animate-[fade-in-up_0.6s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                <div className="h-16 w-16 nm-flat mx-auto flex items-center justify-center mb-6 text-primary">
                  <Zap className="h-8 w-8 fill-primary/20" />
                </div>
                <h2 className="text-2xl font-display font-bold tracking-tight">Ready to Study?</h2>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  Enter your workspace instantly. No accounts or 2FA required.
                </p>
                
                <button
                  onClick={handleInstantAccess}
                  disabled={isLaunching}
                  className="nm-button mt-10 w-full py-4 flex items-center justify-center gap-3 font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all group"
                  style={{ background: "var(--gradient-primary)", color: "white" }}
                >
                  <Zap className="h-5 w-5" />
                  {isLaunching ? "Launching OS..." : "Enter Instant Space"}
                  <ArrowRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                <div className="mt-8 pt-6 border-t border-border/30">
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.2em]"
                  >
                    Or Sign in with Google to Sync
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-[fade-in-up_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
