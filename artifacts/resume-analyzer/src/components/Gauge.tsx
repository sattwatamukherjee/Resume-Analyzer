import React from "react";
import { cn, getScoreColor, getScoreGradient } from "@/lib/utils";

interface GaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  animate?: boolean;
}

export function Gauge({ score, size = 180, strokeWidth = 14, className, animate = true }: GaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Use a 3/4 circle (270 degrees)
  const arcLength = circumference * 0.75;
  const gapLength = circumference * 0.25;
  
  // Calculate offset to start at bottom left
  const offset = circumference * 0.625;
  
  // Calculate progress
  const progress = (score / 100) * arcLength;
  
  const scoreColor = getScoreColor(score).replace("text-", "");
  
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-135deg]">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-secondary"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeDashoffset="0"
          strokeLinecap="round"
        />
        
        {/* Progress track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className={cn(getScoreColor(score), "transition-all duration-1000 ease-out")}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeDashoffset={animate ? arcLength - progress : arcLength} // animate from 0
          strokeLinecap="round"
          style={{ strokeDashoffset: animate ? undefined : arcLength - progress }}
        />
      </svg>
      
      {/* Score Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
        <span className={cn("text-5xl font-bold font-mono tracking-tighter", getScoreColor(score))}>
          {score}
        </span>
        <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-1">
          ATS SCORE
        </span>
      </div>
    </div>
  );
}
