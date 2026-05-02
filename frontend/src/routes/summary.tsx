import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RippleButton } from "@/components/RippleButton";
import { SectionHeader } from "@/components/SectionHeader";
import { MarkdownOutput } from "@/components/MarkdownOutput";
import { callApi } from "@/lib/api";
import { FileText, Loader2, ListChecks, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Summary & Quiz — AI Study OS" },
      { name: "description", content: "Turn any notes into a crisp summary, key points, and 5 exam questions." },
    ],
  }),
  component: SummaryPage,
});

interface Result {
  summary: string;
  keyPoints: string[];
  questions: string[];
}

function SummaryPage() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const run = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    setErr("");
    setResult(null);
    try {
      const data = await callApi<Result>("/api/summary", { notes });
      setResult(data);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input panel */}
        <section className="nm-flat p-6 lg:col-span-2 space-y-4">
          <SectionHeader title="Paste your notes" />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste lecture notes, chapter content, or any study material…"
            className="nm-input w-full h-72 p-4 text-sm resize-none"
          />
          <RippleButton variant="primary" onClick={run} disabled={loading} className="flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {loading ? "Thinking…" : "Generate summary + quiz"}
          </RippleButton>
          {err && <p className="text-xs text-rose">{err}</p>}
        </section>

        {/* Output panels */}
        <section className="lg:col-span-3 space-y-6">
          <div className="nm-flat p-6">
            <SectionHeader
              title="Summary"
              badge="tl;dr"
              icon={<FileText className="h-4 w-4 text-primary" />}
            />
            <MarkdownOutput
              content={result?.summary ?? ""}
              placeholder="Your summary will appear here."
              className="min-h-[6rem]"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="nm-flat p-6">
              <SectionHeader
                title="Key points"
                icon={<ListChecks className="h-4 w-4 text-emerald" />}
              />
              <ul className="space-y-2 text-sm">
                {(result?.keyPoints ?? []).map((k, i) => (
                  <li key={i} className="nm-flat-sm p-3 animate-[fade-in-up_0.4s_both]" style={{ animationDelay: `${i * 60}ms` }}>
                    {k}
                  </li>
                ))}
                {!result && <li className="text-muted-foreground italic text-sm">Bullet points appear here.</li>}
              </ul>
            </div>

            <div className="nm-flat p-6">
              <SectionHeader
                title="Exam questions"
                icon={<HelpCircle className="h-4 w-4 text-violet" />}
              />
              <ol className="space-y-2 text-sm list-decimal list-inside">
                {(result?.questions ?? []).map((q, i) => (
                  <li key={i} className="nm-flat-sm p-3 animate-[fade-in-up_0.4s_both]" style={{ animationDelay: `${i * 80}ms` }}>
                    {q}
                  </li>
                ))}
                {!result && <li className="text-muted-foreground italic text-sm list-none">5 questions appear here.</li>}
              </ol>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
