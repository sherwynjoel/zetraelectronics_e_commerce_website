"use client";

import { create } from "zustand";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "error";
type Item = { id: number; title: string; description?: string; tone: Tone };

const useToasts = create<{ items: Item[]; push(i: Omit<Item, "id">): void; drop(id: number): void }>((set) => ({
  items: [],
  push: (i) => {
    const id = Date.now() + Math.random();
    set((s) => ({ items: [...s.items.slice(-3), { ...i, id }] }));
    setTimeout(
      () => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
      i.tone === "error" ? 7000 : 4000,
    );
  },
  drop: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export function toast(input: { title: string; description?: string; tone?: Tone }) {
  useToasts.getState().push({ tone: "info", ...input });
}
toast.success = (title: string, description?: string) => toast({ title, description, tone: "success" });
toast.error = (title: string, description?: string) => toast({ title, description, tone: "error" });

const icons = { info: Info, success: CheckCircle2, error: XCircle };
const tones = { info: "text-brand", success: "text-ok", error: "text-danger" };

function ToastCard({ t, onDrop }: { t: Item; onDrop(): void }) {
  const Icon = icons[t.tone];
  return (
    <div className="glass glass-thick pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[1.25rem] p-4 motion-safe:animate-[toast-in_.5s_var(--ease-spring)]">
      <Icon className={cn("mt-0.5 size-5 shrink-0", tones[t.tone])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{t.title}</p>
        {t.description && <p className="mt-0.5 text-sm text-ink-3">{t.description}</p>}
      </div>
      <button
        type="button"
        onClick={onDrop}
        aria-label="Dismiss notification"
        className="-m-1 rounded-full p-1.5 text-ink-3 transition-colors hover:text-ink"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function Toaster() {
  const { items, drop } = useToasts();
  const calm = items.filter((t) => t.tone !== "error");
  const errors = items.filter((t) => t.tone === "error");
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[90] flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:items-end">
      <div role="alert" className="contents">
        {errors.map((t) => (
          <ToastCard key={t.id} t={t} onDrop={() => drop(t.id)} />
        ))}
      </div>
      <div role="status" aria-live="polite" className="contents">
        {calm.map((t) => (
          <ToastCard key={t.id} t={t} onDrop={() => drop(t.id)} />
        ))}
      </div>
    </div>
  );
}
