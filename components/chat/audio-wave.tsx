"use client";

import { useEffect, useState } from "react";

interface AudioWaveProps {
  isActive?: boolean;
  barCount?: number;
  className?: string;
}

export function AudioWave({
  isActive = false,
  barCount = 5,
  className = ""
}: AudioWaveProps) {
  const [heights, setHeights] = useState<number[]>(
    Array(barCount).fill(20)
  );

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(barCount).fill(20));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array(barCount)
          .fill(0)
          .map(() => Math.random() * 80 + 20)
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-primary transition-all duration-150 ease-in-out"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}
