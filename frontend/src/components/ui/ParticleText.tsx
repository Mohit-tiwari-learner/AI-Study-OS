"use client";

import { useEffect, useRef } from "react";
import { MotionValue } from "framer-motion";

interface ParticleTextProps {
  text: string;
  progress: MotionValue<number>;
}

class Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  scatterX: number;
  scatterY: number;
  color: string;
  size: number;
  ease: number;

  constructor(x: number, y: number, color: string, w: number, h: number) {
    this.originX = x;
    this.originY = y;

    // Start randomly scattered around the canvas
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * w * 0.8;
    this.scatterX = w / 2 + Math.cos(angle) * radius;
    this.scatterY = h / 2 + Math.sin(angle) * radius;

    this.x = this.scatterX;
    this.y = this.scatterY;

    this.color = color;
    // Tiny, premium particles
    this.size = Math.random() * 1.2 + 0.6;
    // Smooth, organic easing
    this.ease = 0.03 + Math.random() * 0.05;
  }

  update(progressValue: number, mouse: { x: number; y: number; radius: number }) {
    // Target position interpolates between scattered and assembled
    const targetX = this.scatterX + (this.originX - this.scatterX) * progressValue;
    const targetY = this.scatterY + (this.originY - this.scatterY) * progressValue;

    // Mouse repulsion (haptic interactivity)
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < mouse.radius) {
      const forceDirectionX = dx / distance;
      const forceDirectionY = dy / distance;
      const force = (mouse.radius - distance) / mouse.radius;
      // Repel
      this.x -= forceDirectionX * force * 15;
      this.y -= forceDirectionY * force * 15;
    }

    // Spring towards target
    this.x += (targetX - this.x) * this.ease;
    this.y += (targetY - this.y) * this.ease;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    // Removed shadowBlur because it absolutely kills canvas performance with thousands of particles
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

export default function ParticleText({ text, progress }: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(null);

  const progressRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 100 });

  useEffect(() => {
    // Subscribe to framer-motion scroll value
    const unsub = progress.onChange((v) => {
      progressRef.current = v;
    });
    return () => unsub();
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let particlesArray: Particle[] = [];

    const init = async () => {
      // Ensure fonts are loaded before reading pixel data
      await document.fonts.ready;

      // Handle high DPI displays for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const width = canvas.width;
      const height = canvas.height;

      // Get font family from CSS
      const computedStyle = window.getComputedStyle(canvas);
      const fontFamily = computedStyle.fontFamily;

      ctx.clearRect(0, 0, width, height);

      // Dynamically calculate font size so it perfectly fits the screen width
      let fontSize = 510 * dpr; // Start incredibly large for massive displays
      ctx.font = `700 ${fontSize}px ${fontFamily}`;

      // Measure how wide the text is
      const metrics = ctx.measureText(text);
      const maxWidth = width * 1.0; // Bleed off the edges (115% of width) for massive scale

      // If the text is too wide, scale the font size down proportionally
      if (metrics.width > maxWidth) {
        fontSize = fontSize * (maxWidth / metrics.width);
        ctx.font = `700 ${fontSize}px ${fontFamily}`;
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = computedStyle.color || "#181A1B";

      // Draw exactly in the center so the massive font doesn't clip the top edge
      ctx.fillText(text, width / 2, height / 2);

      const textCoordinates = ctx.getImageData(0, 0, width, height);
      ctx.clearRect(0, 0, width, height); // clear the text

      particlesArray = [];

      // Decrease step to make particles dense and solid.
      const step = dpr > 1 ? 5 : 3;

      for (let y = 0; y < textCoordinates.height; y += step) {
        for (let x = 0; x < textCoordinates.width; x += step) {
          // Check alpha channel
          const index = (y * width + x) * 4;
          const alpha = textCoordinates.data[index + 3];

          if (alpha > 128) {
            // Non-transparent pixel found
            const r = textCoordinates.data[index];
            const g = textCoordinates.data[index + 1];
            const b = textCoordinates.data[index + 2];
            const color = `rgba(${r}, ${g}, ${b}, 1)`;

            // Randomize size slightly for a gritty but solid premium feel
            const size = Math.random() * 2.0 + 1.0;
            const p = new Particle(x, y, color, width, height);
            p.size = size;

            particlesArray.push(p);
          }
        }
      }

      particlesRef.current = particlesArray;
    };

    init();

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pVal = progressRef.current;
      const mouse = mouseRef.current;

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.update(pVal, mouse);
        p.draw(ctx);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      init();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [text]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    mouseRef.current.x = (e.clientX - rect.left) * dpr;
    mouseRef.current.y = (e.clientY - rect.top) * dpr;
  };

  const handleMouseLeave = () => {
    mouseRef.current.x = -1000;
    mouseRef.current.y = -1000;
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        cursor: "default",
        fontFamily: "var(--font-syncopate), sans-serif",
        color: "var(--ink)",
      }}
    />
  );
}
