import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder-product.png";
  if (path.startsWith("http")) return path;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return `${apiUrl}${path}`;
}
