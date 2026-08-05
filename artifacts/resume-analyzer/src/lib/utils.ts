import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score < 50) return "text-score-red";
  if (score < 70) return "text-score-amber";
  if (score < 85) return "text-score-blue";
  return "text-score-green";
}

export function getScoreBgColor(score: number): string {
  if (score < 50) return "bg-score-red";
  if (score < 70) return "bg-score-amber";
  if (score < 85) return "bg-score-blue";
  return "bg-score-green";
}

export function getScoreGradient(score: number): string {
  if (score < 50) return "from-score-red to-red-400";
  if (score < 70) return "from-score-amber to-amber-400";
  if (score < 85) return "from-score-blue to-blue-400";
  return "from-score-green to-emerald-400";
}
