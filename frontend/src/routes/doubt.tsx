import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RippleButton } from "@/components/RippleButton";
import { SectionHeader } from "@/components/SectionHeader";
import { callApi } from "@/lib/api";
import { Send, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/doubt")({
  head: () => ({
    meta: [
      { title: "Doubt Solver — AI Study OS" },
      { name: "description", content: "Ask any doubt; get step-by-step explanations in English or Hinglish." },
    ],
  }),
  component: DoubtPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function DoubtPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hey 👋 Ask me any doubt — math, science, history. I'll walk you through step-by-step." },
  ]);
  const [input, setInput] = useState("");
  const [hinglish, setHinglish] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const data = await callApi<{ answer: string }>("/api/doubt", {
        messages: next,
        hinglish,
      });
      setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `> Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="nm-flat p-6 flex flex-col h-[calc(100vh-10rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Doubt Solver
          </h2>
          <button
            onClick={() => setHinglish((h) => !h)}
            className={`nm-button px-3 py-1.5 text-xs font-semibold ${hinglish ? "text-primary" : "text-muted-foreground"}`}
          >
            {hinglish ? "Hinglish: ON" : "Hinglish: OFF"}
          </button>
        </div>

        {/* Chat messages */}
        <div ref={scrollRef} className="flex-1 nm-inset p-5 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-[fade-in-up_0.3s_both]`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "nm-flat-sm text-foreground"
                    : "nm-flat-sm text-foreground/90"
                }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:font-display prose-strong:text-primary">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="nm-flat-sm px-4 py-3 text-sm flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> thinking…
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="mt-4 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={hinglish ? "Apna doubt yahaan likho…" : "Type your doubt and press Enter…"}
            className="nm-input flex-1 px-4 py-3 text-sm"
          />
          <RippleButton variant="primary" onClick={send} disabled={loading} className="flex items-center gap-2">
            <Send className="h-4 w-4" /> Send
          </RippleButton>
        </div>
      </div>
    </AppShell>
  );
}
