"use client";

import { useEffect, useRef, useState } from "react";
import { getStorageItem, setStorageItem } from "@/shared/lib/storage";

/**
 * State backed by localStorage. To stay hydration-safe, the first render — on the
 * server and during the client's hydration pass — always uses `defaultValue`, so
 * the markup matches. The persisted value is adopted from `key` in an effect
 * after mount, then written back on every subsequent change. (Reading storage in
 * the `useState` initializer instead would diverge the hydration render from the
 * server and throw a hydration mismatch.)
 *
 * The adopt-then-write decision is tracked per key rather than once per mount:
 * with a single `hydrated` flag, changing `key` wrote the *outgoing* key's value
 * under the incoming one instead of loading what was stored there.
 */
export function usePersistentState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  const defaultRef = useRef(defaultValue);
  const loadedKey = useRef<string | null>(null);

  useEffect(() => {
    if (loadedKey.current !== key) {
      loadedKey.current = key;
      setValue(getStorageItem<T>(key, defaultRef.current));
      return;
    }
    setStorageItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
