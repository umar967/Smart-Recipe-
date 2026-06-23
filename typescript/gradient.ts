import type { CSSProperties } from "react";

export function getRecipeGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = Math.abs((hash * 7 + 40) % 360);
  return `linear-gradient(135deg, hsl(${hue1}, 55%, 35%), hsl(${hue2}, 45%, 25%))`;
}

export function getRecipeGradientStyle(name: string): CSSProperties {
  return { background: getRecipeGradient(name) };
}
