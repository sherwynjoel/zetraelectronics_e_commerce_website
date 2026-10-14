"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

/** Authenticated admin GET with loading/error state; a 401/403 signs out and returns to login. */
export function useAdminGet<T>(path: string | null) {
  const { token, logout } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!path || !token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) {
        logout();
        router.push("/login?next=/admin");
        return;
      }
      if (!res.ok) throw new Error(`The server returned ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [path, token, logout, router]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, setData, error, loading, reload: load };
}

/** Authenticated admin mutation; throws with the API message on failure. */
export async function adminSend<T = unknown>(token: string | null, path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
  if (!res.ok) {
    const msg = json && typeof json === "object" && "message" in json ? (json as { message: string | string[] }).message : null;
    throw new Error(Array.isArray(msg) ? msg.join(". ") : msg || `Request failed (${res.status})`);
  }
  return json as T;
}
