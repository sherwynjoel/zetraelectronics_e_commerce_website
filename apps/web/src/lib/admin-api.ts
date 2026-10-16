"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { fetchAllPages, PAGE_SIZE } from "@/lib/paging";

class SignedOut extends Error {}

/**
 * Authenticated admin GET with loading/error state; a 401/403 signs out and returns to login.
 * With `allPages`, a list endpoint is read 100 rows at a time until every row has arrived.
 */
export function useAdminGet<T>(path: string | null, { allPages = false }: { allPages?: boolean } = {}) {
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
      const get = async (url: string) => {
        const res = await fetch(`${API_URL}${url}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401 || res.status === 403) throw new SignedOut();
        if (!res.ok) throw new Error(`The server returned ${res.status}`);
        return res.json();
      };
      if (allPages) {
        const sep = path.includes("?") ? "&" : "?";
        const rows = await fetchAllPages<{ id: number }>(async (page) => get(`${path}${sep}limit=${PAGE_SIZE}&page=${page}`));
        setData(rows as T);
      } else {
        setData(await get(path));
      }
    } catch (e) {
      if (e instanceof SignedOut) {
        logout();
        router.push("/login?next=/admin");
        return;
      }
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [path, token, logout, router, allPages]);

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
