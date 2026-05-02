import { useEffect, useState } from "react";

const lines = [
  "> booting study-os v1.0.0...",
  "> loading gemini-pro adapter ✓",
  "> indexing 142 notes ✓",
  "> 5 quiz sessions ready ✓",
  "> ready. type 'help' for commands_",
];

export function Terminal() {
  const [shown, setShown] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setShown((s) => [...s, lines[i]]);
      i++;
      if (i >= lines.length) clearInterval(id);
    }, 300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="nm-inset p-5 font-mono text-xs leading-6">
      <div className="flex items-center gap-1.5 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose" />
        <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.78_0.16_85)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald" />
        <span className="ml-2 text-muted-foreground">study-os ~ terminal</span>
      </div>
      <div className="space-y-1">
        {shown.map((l, i) => (
          <div key={i} className="text-foreground/85">
            {l}
          </div>
        ))}
        <div className="inline-block w-2 h-3.5 bg-primary align-middle animate-[blink_1s_steps(2,start)_infinite]" />
      </div>
    </div>
  );
}
