import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RippleButton } from "@/components/RippleButton";
import { SectionHeader } from "@/components/SectionHeader";
import { MarkdownOutput } from "@/components/MarkdownOutput";
import { callApi } from "@/lib/api";
import { Mic, MicOff, Sparkles, Loader2 } from "lucide-react";

import { useTrackActivity } from "@/hooks/useTrackActivity";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Voice → Notes — AI Study OS" },
      { name: "description", content: "Speak or paste your lecture; get structured, beautiful notes." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  
  const { incrementStat, addActivity } = useTrackActivity();

  useEffect(() => {
    const SR =
      (typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    rec.onresult = (e: any) => {
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        finalText += e.results[i][0].transcript;
      }
      setText((t) => (t ? t + " " : "") + finalText);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, []);

  const toggleMic = () => {
    if (!recRef.current) {
      alert("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }
    if (listening) {
      recRef.current.stop();
      setListening(false);
    } else {
      recRef.current.start();
      setListening(true);
    }
  };

  const generate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setNotes("");
    try {
      const data = await callApi<{ notes: string }>("/api/notes", { text });
      setNotes(data.notes);
      
      // Update dashboard stats
      incrementStat("notesCaptured", 1);
      addActivity({
        iconName: "BookOpen",
        title: "Notes structured from input",
        color: "text-emerald",
      });
      
    } catch (e: any) {
      setNotes(`> Error reaching backend.\n\n${e.message}\n\nMake sure the Express server is running on http://localhost:5000`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input panel */}
        <section className="nm-flat p-6 space-y-4">
          <SectionHeader
            title="Capture"
            badge={listening ? "● recording" : "idle"}
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Speak with the mic, or paste your lecture transcript here…"
            className="nm-input w-full h-64 p-4 text-sm resize-none placeholder:text-muted-foreground"
          />
          <div className="flex gap-3">
            <RippleButton onClick={toggleMic} className="flex items-center gap-2">
              {listening ? <MicOff className="h-4 w-4 text-rose" /> : <Mic className="h-4 w-4 text-primary" />}
              {listening ? "Stop" : "Speak"}
            </RippleButton>
            <RippleButton variant="primary" onClick={generate} disabled={loading} className="flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Structuring…" : "Structure notes"}
            </RippleButton>
            <RippleButton onClick={() => { setText(""); setNotes(""); }}>Clear</RippleButton>
          </div>
        </section>

        {/* Output panel */}
        <section className="nm-flat p-6">
          <SectionHeader title="Smart notes" badge="gemini" badgeColor="text-emerald" />
          <MarkdownOutput
            content={notes}
            placeholder="Your structured notes will appear here…"
          />
        </section>
      </div>
    </AppShell>
  );
}
