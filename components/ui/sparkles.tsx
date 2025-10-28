"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const SparklesCore = ({
  id,
  background,
  minSize,
  maxSize,
  particleDensity,
  className,
  particleColor,
}: {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      const density = particleDensity || 100;
      
      for (let i = 0; i < density; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * ((maxSize || 2) - (minSize || 1)) + (minSize || 1),
          duration: Math.random() * 20 + 10,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, [particleDensity, minSize, maxSize]);

  return (
    <div className={cn("absolute inset-0", className)} style={{ background }}>
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particleColor || "#8B5CF6",
            borderRadius: "50%",
            animation: `sparkle ${particle.duration}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
};