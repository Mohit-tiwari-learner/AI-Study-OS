import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Mic, FileText, CalendarRange, MessageCircleQuestion, ArrowRight, Sparkles, Zap, Shield, Instagram, Twitter, Linkedin } from "lucide-react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef, lazy, Suspense } from "react";
import ParticleText from "@/components/ui/ParticleText";

const RobotCanvas = lazy(() => import("@/components/RobotModel"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Study OS — Your AI-Powered Study Companion" },
      { name: "description", content: "Voice-to-notes, AI summaries, smart study plans, and instant doubt solving — all in one beautiful OS for students." },
    ],
  }),
  component: HeroPage,
});

/* ── Feature cards data ────────────────────────────────────────── */
const features = [
  {
    icon: Mic,
    title: "Voice → Notes",
    desc: "Speak or paste your lecture — get structured, beautiful notes in seconds.",
    color: "text-indigo",
    gradient: "from-indigo/10 to-violet/10",
  },
  {
    icon: FileText,
    title: "Summary & Quiz",
    desc: "Turn any content into crisp summaries, key points, and exam questions.",
    color: "text-emerald",
    gradient: "from-emerald/10 to-indigo/10",
  },
  {
    icon: CalendarRange,
    title: "Study Planner",
    desc: "Generate day-wise study plans from your syllabus and deadlines.",
    color: "text-violet",
    gradient: "from-violet/10 to-rose/10",
  },
  {
    icon: MessageCircleQuestion,
    title: "Doubt Solver",
    desc: "Ask any doubt — get step-by-step explanations in English or Hinglish.",
    color: "text-rose",
    gradient: "from-rose/10 to-indigo/10",
  },
];

const stats = [
  { value: "10K+", label: "Notes created" },
  { value: "5K+", label: "Doubts solved" },
  { value: "98%", label: "Accuracy" },
  { value: "4.9★", label: "User rating" },
];

/* ── Footer Links data ────────────────────────────────────────── */
const footerLinks = [
  { label: "ABOUT US", href: "#" },
  { label: "CONTACT", href: "#" },
  { label: "PRIVACY POLICY", href: "#" },
  { label: "TERMS OF SERVICE", href: "#" },
];

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

/* ── Page component ───────────────────────────────────────────── */
function HeroPage() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  // Slowly assemble the particles as we reach the bottom
  const assemblyProgress = useTransform(scrollYProgress, [0.1, 0.8], [0, 1]);

  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      <AuthModal isOpen={authModalOpen} onOpenChange={setAuthModalOpen} />
      
      {/* ── 3D Robot — follows cursor across entire page ──────── */}
      <Suspense fallback={null}>
        <RobotCanvas />
      </Suspense>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="nm-flat-sm p-2 animate-[float_4s_ease-in-out_infinite]">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display font-semibold text-base">AI Study OS</span>
          </div>
          {user ? (
            <Link
              to="/dashboard"
              className="nm-button px-5 py-2.5 text-sm font-semibold text-primary flex items-center gap-2"
            >
              Open App <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="nm-button px-5 py-2.5 text-sm font-semibold text-primary flex items-center gap-2"
            >
              Sign In <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </nav>

      {/* ── Hero section ──────────────────────────────────────── */}
      <section className="relative pt-24 pb-32 px-6">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/8 via-violet/5 to-transparent blur-3xl pointer-events-none" />


        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 status-badge mb-8 animate-[fade-in-up_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Powered by Gemini AI</span>
          </div>

          {/* Headline */}
          <h1 className="nm-text-3d font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.08] tracking-tighter py-2 animate-[fade-in-up_0.6s_cubic-bezier(0.34,1.56,0.64,1)_0.1s_both]">
            Study smarter, <br className="hidden sm:block" />
            not harder
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-[fade-in-up_0.6s_cubic-bezier(0.34,1.56,0.64,1)_0.2s_both]">
            Your AI-powered study companion that converts voice to notes, generates summaries & quizzes, builds study plans, and solves doubts instantly.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fade-in-up_0.6s_cubic-bezier(0.34,1.56,0.64,1)_0.3s_both]">
            {user ? (
              <Link
                to="/dashboard"
                className="nm-button px-8 py-4 text-base font-semibold text-primary-foreground flex items-center gap-2.5 group"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Zap className="h-4.5 w-4.5" />
                Go to Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="nm-button px-8 py-4 text-base font-semibold text-primary-foreground flex items-center gap-2.5 group"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Zap className="h-4.5 w-4.5" />
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
            <a
              href="#features"
              className="nm-button px-8 py-4 text-base font-semibold text-foreground/80 flex items-center gap-2"
            >
              See Features
            </a>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto animate-[fade-in-up_0.6s_cubic-bezier(0.34,1.56,0.64,1)_0.5s_both]">
            {stats.map((s, i) => (
              <div key={i} className="nm-flat p-4 text-center">
                <p className="text-2xl sm:text-3xl font-display font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features section ──────────────────────────────────── */}
      <section id="features" className="py-32 px-6 relative overflow-hidden">
        {/* Background Decorative Shapes */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 nm-flat rounded-full opacity-30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 nm-inset rounded-full opacity-30 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="status-badge mb-4 inline-flex items-center gap-2"
            >
              <Zap className="h-3 w-3 text-primary animate-pulse" /> Feature Suite
            </motion.div>
            <h2 className="nm-text-3d font-display font-black text-3xl sm:text-5xl md:text-6xl tracking-tight mt-6 leading-tight">
              Master your syllabus <br className="hidden sm:block" /> with AI precision
            </h2>
            <p className="mt-6 text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
              Four revolutionary tools designed to automate the boring parts of studying, so you can focus on learning.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={{ y: -8 }}
                className="nm-flat p-10 group relative overflow-hidden flex flex-col md:flex-row items-start gap-8 hover:shadow-[12px_12px_24px_rgba(0,0,0,0.05),-12px_-12px_24px_rgba(255,255,255,0.8)] transition-all duration-500"
              >
                {/* Floating Glow */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />

                <div className="relative shrink-0">
                  <div className={`nm-flat p-5 inline-flex rounded-2xl bg-gradient-to-br ${f.gradient} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <f.icon className={`h-8 w-8 ${f.color} drop-shadow-sm`} />
                  </div>
                </div>

                <div className="relative flex-1">
                  <h3 className="font-display font-bold text-2xl tracking-tight mb-3 group-hover:text-primary transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base mb-6">
                    {f.desc}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
                    Explore Tool <ArrowRight className="h-3 w-3" />
                  </div>
                </div>

                {/* Decorative index */}
                <span className="absolute bottom-6 right-8 text-7xl font-display font-black text-foreground/[0.03] pointer-events-none group-hover:text-primary/5 transition-colors">
                  0{i + 1}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA section ───────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="nm-flat p-10 sm:p-14 text-center relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-violet/5 blur-3xl pointer-events-none" />

            <div className="relative">
              <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
                Ready to transform your study game?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                Jump into your AI-powered workspace — no signup required during beta.
              </p>
              {user ? (
                <Link
                  to="/dashboard"
                  className="nm-button mt-8 inline-flex px-8 py-4 text-base font-semibold text-primary-foreground items-center gap-2.5 group"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Brain className="h-4.5 w-4.5" />
                  Open Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="nm-button mt-8 inline-flex px-8 py-4 text-base font-semibold text-primary-foreground items-center gap-2.5 group"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Brain className="h-4.5 w-4.5" />
                  Join Now Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Premium Footer ────────────────────────────────────── */}
      <footer ref={footerRef} className="pt-24 bg-background relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Big Headline */}
          <h2 className="font-display font-bold text-4xl sm:text-6xl md:text-8xl tracking-tighter text-center mb-16">
            YOUR ACADEMIC JOURNEY,<br />COMPLETELY OPTIMIZED.
          </h2>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border/30">
            {footerLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className={`flex items-center justify-center py-10 px-4 text-xs font-bold tracking-[0.2em] hover:bg-muted/50 transition-colors border-border/30 ${
                  i < 3 ? "md:border-r border-b md:border-b-0" : ""
                } ${i === 0 ? "border-r" : ""} ${i === 1 ? "md:border-r border-b" : ""} ${i === 2 ? "border-r" : ""}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Particle Text Section */}
          <div className="h-[30vh] sm:h-[40vh] md:h-[50vh] w-full relative">
            <ParticleText text="STUDY OS" progress={assemblyProgress} />
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/30 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
            <div className="flex items-center gap-4">
              <div className="nm-flat-sm p-1.5 bg-foreground text-background rounded-full">
                <Brain className="h-3 w-3" />
              </div>
              <p>© 2026 AI STUDY OS. ALL RIGHTS RESERVED.</p>
            </div>

            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Instagram className="h-3 w-3" /> INSTAGRAM
              </a>
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Twitter className="h-3 w-3" /> TWITTER
              </a>
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Linkedin className="h-3 w-3" /> LINKEDIN
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
