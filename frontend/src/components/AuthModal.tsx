import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Chrome, Zap, ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ isOpen, onOpenChange }: AuthModalProps) {
  const { loginWithGoogle, loginAnonymously, loginWithEmail, registerWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome back!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantAccess = async () => {
    setLoading(true);
    try {
      await loginAnonymously();
      toast.success("Entering Study Space...");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Instant access failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields.");
    setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
        toast.success("Welcome back!");
      } else {
        await registerWithEmail(email, password);
        toast.success("Account created!");
      }
      onOpenChange(false);
    } catch (error: any) {
      const msg = error?.code === "auth/user-not-found"
        ? "No account found. Try signing up."
        : error?.code === "auth/wrong-password"
        ? "Incorrect password."
        : error?.code === "auth/email-already-in-use"
        ? "Email already registered. Try logging in."
        : error?.code === "auth/weak-password"
        ? "Password should be at least 6 characters."
        : "Authentication failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => { onOpenChange(o); if (!o) setShowEmail(false); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[420px] z-[101] outline-none">
          <div className="nm-flat p-8 sm:p-12 relative overflow-hidden text-center">
            {/* Design accents */}
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-violet/10 blur-3xl pointer-events-none" />

            <Dialog.Close className="absolute top-6 right-6 p-2 nm-button text-muted-foreground hover:text-foreground transition-transform hover:rotate-90">
              <X className="h-4 w-4" />
            </Dialog.Close>

            <div className="mb-8">
              <div className="h-14 w-14 nm-flat mx-auto flex items-center justify-center mb-4 text-primary animate-[float_4s_ease-in-out_infinite]">
                <Zap className="h-7 w-7 fill-primary/20" />
              </div>
              <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
                {showEmail ? (mode === "login" ? "Email Sign In" : "Create Account") : "Welcome"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {showEmail ? "Enter your details below" : "Choose how you'd like to enter."}
              </p>
            </div>

            {!showEmail ? (
              /* ── Quick access buttons ──────────────────────── */
              <div className="space-y-4">
                <button
                  onClick={handleInstantAccess}
                  disabled={loading}
                  className="w-full nm-button py-4 flex items-center justify-center gap-3 font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all group"
                  style={{ background: "var(--gradient-primary)", color: "white" }}
                >
                  <Zap className="h-5 w-5" />
                  {loading ? "Launching..." : "Enter Instant Space"}
                  <ArrowRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full nm-button py-3 flex items-center justify-center gap-4 text-sm font-semibold text-foreground/70 hover:text-primary transition-all"
                  >
                    <div className="nm-flat-sm p-1 rounded-full bg-white">
                      <Chrome className="h-4 w-4 text-[#4285F4]" />
                    </div>
                    Sign in with Google
                  </button>

                  <button
                    onClick={() => setShowEmail(true)}
                    className="w-full nm-button py-3 flex items-center justify-center gap-4 text-sm font-semibold text-foreground/70 hover:text-primary transition-all"
                  >
                    <Mail className="h-4 w-4" />
                    Sign in with Email
                  </button>
                </div>
              </div>
            ) : (
              /* ── Email / Password form ─────────────────────── */
              <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="label-text ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="nm-input w-full pl-11 pr-4 py-3 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-text ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="nm-input w-full pl-11 pr-4 py-3 text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full nm-button py-4 font-bold text-white mt-2"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
                </button>

                <div className="text-center mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                  <br />
                  <button
                    type="button"
                    onClick={() => setShowEmail(false)}
                    className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to all options
                  </button>
                </div>
              </form>
            )}

            <p className="mt-8 text-[10px] text-muted-foreground/60 leading-relaxed max-w-[240px] mx-auto">
              {showEmail ? "Your credentials are securely encrypted." : "Guest data is local. Sign in later to sync across devices."}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
