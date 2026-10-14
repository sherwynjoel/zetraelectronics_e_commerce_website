"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only after hydration, so persisted client stores can render safely. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
