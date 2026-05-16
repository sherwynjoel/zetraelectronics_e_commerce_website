import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder-product.png";
  // Strip localhost/127.0.0.1 prefix — use relative path so Next.js rewrite proxies it to the API
  if (path.includes('localhost') || path.includes('127.0.0.1')) {
    const match = path.match(/\/uploads\/.*/);
    return match ? match[0] : "/placeholder-product.png";
  }
  if (path.startsWith("http")) return path;
  return path;
}
