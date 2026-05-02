import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pencil,
  RotateCcw,
  Trash2,
  Sparkles,
  Download,
  Maximize2,
  Minimize2,
  Brain,
  Lightbulb,
  MessageSquare,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { analyzeWhiteboard } from "@/lib/whiteboard-ai";
import { toast } from "sonner";

/* ── Stroke type for undo history ─────────────────────────── */
interface Point {
  x: number;
  y: number;
}
interface Stroke {
  points: Point[];
  color: string;
  radius: number;
}

export function AIWhiteboard() {
  const { onboardingData } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [brushColor, setBrushColor] = useState("#3b82f6");
  const [brushRadius, setBrushRadius] = useState(4);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Drawing state
  const isDrawing = useRef(false);
  const currentStroke = useRef<Point[]>([]);
  const strokes = useRef<Stroke[]>([]);
  const [strokeCount, setStrokeCount] = useState(0); // triggers re-render for undo button state

  const colors = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Emerald", value: "#10b981" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Ink", value: "#1e293b" },
  ];

  /* ── Canvas sizing ──────────────────────────────────────── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Redraw all strokes after resize
    redrawAll();
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas, isExpanded]);

  /* ── Redraw helper ──────────────────────────────────────── */
  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    strokes.current.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.radius * 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, []);

  /* ── Pointer helpers ────────────────────────────────────── */
  const getPos = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    currentStroke.current = [getPos(e)];
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    const pos = getPos(e);
    currentStroke.current.push(pos);

    // Draw the latest segment immediately for responsiveness
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pts = currentStroke.current;
    if (pts.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushRadius * 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const onPointerUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentStroke.current.length > 1) {
      strokes.current.push({
        points: [...currentStroke.current],
        color: brushColor,
        radius: brushRadius,
      });
      setStrokeCount(strokes.current.length);
    }
    currentStroke.current = [];
  };

  /* ── Actions ────────────────────────────────────────────── */
  const handleUndo = () => {
    strokes.current.pop();
    setStrokeCount(strokes.current.length);
    redrawAll();
  };

  const handleClear = () => {
    strokes.current = [];
    setStrokeCount(0);
    redrawAll();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleAIAnalyze = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL("image/png");

    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const result = await analyzeWhiteboard(data, onboardingData);
      setAiResult(result);
      toast.success("AI Analysis Complete!");
    } catch {
      toast.error("AI Analysis failed. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      className={cn(
        "relative nm-flat rounded-2xl overflow-hidden transition-all duration-500 bg-white/50 dark:bg-black/10 flex flex-col md:flex-row",
        isExpanded ? "fixed inset-4 z-[100] h-auto" : "h-[600px]",
      )}
    >
      {/* Sidebar - AI Results (Desktop) */}
      {aiResult && !isExpanded && (
        <div className="w-full md:w-80 border-r border-border/50 p-6 overflow-y-auto animate-in slide-in-from-left duration-500">
          <div className="flex items-center gap-2 mb-6 text-violet">
            <Brain className="h-5 w-5" />
            <h4 className="font-display font-bold">AI Analysis</h4>
          </div>

          <div className="space-y-6">
            <div className="nm-inset p-4 rounded-xl text-xs leading-relaxed italic">
              &ldquo;{aiResult.summary}&rdquo;
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Lightbulb className="h-3 w-3" /> Key Concepts
              </p>
              <div className="flex flex-wrap gap-2">
                {aiResult.concepts?.map((c: string) => (
                  <span key={c} className="px-2 py-1 nm-flat-sm text-[10px] rounded-md text-primary">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-3 w-3" /> Hinglish Summary
              </p>
              <div className="nm-flat-sm p-4 rounded-xl text-xs text-muted-foreground leading-relaxed">
                {aiResult.hinglish}
              </div>
            </div>

            {/* Practice Questions */}
            {aiResult.questions?.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Brain className="h-3 w-3" /> Practice Questions
                </p>
                <ul className="space-y-2">
                  {aiResult.questions.map((q: string, idx: number) => (
                    <li key={idx} className="text-[11px] p-2 nm-inset-sm rounded-lg text-foreground/80">
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Flashcards */}
            {aiResult.flashcards?.length > 0 && (
              <div className="space-y-3 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Zap className="h-3 w-3" /> Flashcards
                </p>
                <div className="grid gap-2">
                  {aiResult.flashcards.map((card: any, idx: number) => (
                    <div
                      key={idx}
                      className="nm-flat-sm p-3 rounded-lg text-center group/card cursor-pointer hover:bg-primary/5 transition-colors"
                    >
                      <p className="text-[10px] font-bold text-primary mb-1">{card.front}</p>
                      <p className="text-[11px] text-muted-foreground opacity-0 group-hover/card:opacity-100 transition-opacity">
                        {card.back}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 relative" ref={containerRef}>
        {/* Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 p-2 nm-flat-sm bg-background/80 backdrop-blur-md rounded-xl">
          <div className="flex items-center gap-1 pr-2 border-r border-border/50">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => setBrushColor(c.value)}
                className={cn(
                  "w-6 h-6 rounded-full transition-transform hover:scale-110 active:scale-95",
                  brushColor === c.value && "ring-2 ring-primary ring-offset-2",
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>

          <button
            onClick={() => setBrushRadius(brushRadius === 4 ? 12 : 4)}
            className={cn("p-2 nm-button rounded-lg", brushRadius > 4 && "text-primary")}
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button onClick={handleUndo} disabled={strokeCount === 0} className="p-2 nm-button rounded-lg disabled:opacity-30">
            <RotateCcw className="h-4 w-4" />
          </button>

          <button onClick={handleClear} className="p-2 nm-button rounded-lg text-rose">
            <Trash2 className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-border/50 mx-1" />

          <button
            disabled={isAnalyzing}
            onClick={handleAIAnalyze}
            className={cn(
              "p-2 nm-button rounded-lg flex items-center gap-2 text-xs font-bold text-violet",
              isAnalyzing && "animate-pulse",
            )}
          >
            <Sparkles className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
            <span className="hidden sm:inline">{isAnalyzing ? "THINKING..." : "AI ASSIST"}</span>
          </button>
        </div>

        {/* Control Buttons */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 nm-button rounded-lg bg-background/80"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button onClick={handleDownload} className="p-2 nm-button rounded-lg bg-background/80">
            <Download className="h-4 w-4" />
          </button>
        </div>

        {/* Native HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          className="cursor-crosshair w-full h-full touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />

        {/* Placeholder for Sticky Notes */}
        <div className="absolute bottom-4 left-4 pointer-events-none opacity-50">
          <div className="nm-flat p-4 bg-yellow-100/80 -rotate-3 w-32 h-32 flex items-center justify-center text-center">
            <p className="text-[10px] font-mono text-yellow-800">Drag notes here (Beta)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
