"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const cols = Math.floor(w / (waveWidth || 50)) + 1;
    const yPositions = Array(cols).fill(0);

    const draw = () => {
      ctx.fillStyle = backgroundFill || "rgba(0, 0, 0, 0.01)";
      ctx.fillRect(0, 0, w, h);

      yPositions.forEach((y, i) => {
        const color = colors ? colors[i % colors.length] : `hsl(${i * 2}, 100%, 50%)`;
        ctx.fillStyle = color;
        ctx.fillRect(i * (waveWidth || 50), y, waveWidth || 50, 3);

        if (y > h + Math.random() * 10000) {
          yPositions[i] = 0;
        } else {
          yPositions[i] = y + 3;
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [colors, waveWidth, backgroundFill]);

  return (
    <div className={cn("relative", containerClassName)}>
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0", className)}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};