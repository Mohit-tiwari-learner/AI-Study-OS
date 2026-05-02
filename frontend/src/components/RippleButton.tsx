import { ButtonHTMLAttributes, MouseEvent, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary";
}

export function RippleButton({ className, variant = "default", onClick, children, ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = ref.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const span = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      span.className = "ripple-span";
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${e.clientX - rect.left - size / 2}px`;
      span.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(span);
      setTimeout(() => span.remove(), 650);
    }
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      className={cn(
        "nm-button px-5 py-2.5 text-sm font-semibold",
        variant === "primary" && "text-primary",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
