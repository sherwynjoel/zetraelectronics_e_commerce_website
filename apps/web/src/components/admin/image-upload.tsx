"use client";

import { useId, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { ProductImage } from "@/components/ui/product-image";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function ImageUpload({ value, onChange, label = "Product photo" }: { value: string; onChange(url: string): void; label?: string }) {
  const { token } = useAuthStore();
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);

  const upload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch(`${API_URL}/products/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-ink-2" id={`${id}-label`}>
        {label}
      </span>
      <div className="flex flex-wrap items-start gap-4">
        {value ? (
          <div className="relative size-36 overflow-hidden rounded-[var(--radius-tile)] bg-[var(--plate)]">
            <ProductImage src={value} alt="Current product photo" sizes="144px" className="p-2" />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove photo"
              className="glass glass-thin absolute right-2 top-2 grid size-8 place-items-center rounded-full text-danger"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ) : null}
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            upload(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "grid h-36 min-w-48 flex-1 cursor-pointer place-items-center rounded-[var(--radius-tile)] border-2 border-dashed border-line px-4 text-center transition-colors hover:border-brand hover:bg-brand-soft",
            over && "border-brand bg-brand-soft",
          )}
        >
          {uploading ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-brand">
              <Spinner className="size-4" label="Uploading" /> Uploading…
            </span>
          ) : (
            <span className="grid justify-items-center gap-1.5">
              <ImagePlus className="size-6 text-brand" aria-hidden />
              <span className="text-sm font-semibold text-ink">{value ? "Replace photo" : "Drop a photo or click to upload"}</span>
              <span className="text-xs text-ink-3">PNG, JPG or WebP, up to 5 MB</span>
            </span>
          )}
          <input
            id={id}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="sr-only"
            aria-labelledby={`${id}-label`}
            onChange={(e) => upload(e.target.files?.[0])}
            disabled={uploading}
          />
        </label>
      </div>
      {error && <p className="text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}
