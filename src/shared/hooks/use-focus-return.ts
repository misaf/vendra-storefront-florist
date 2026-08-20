"use client";

import { useCallback, useRef } from "react";

/**
 * Returns keyboard focus to whatever opened an overlay once it closes.
 *
 * Radix restores focus to its own `*Trigger`, but overlays opened from state —
 * a button that flips `open`, a keyboard shortcut, a toast action — have no
 * trigger for it to find, so closing drops focus on `<body>` and a keyboard
 * user restarts from the top of the page (WCAG 2.4.3).
 *
 * `capture()` must run in the same handler that opens the overlay, before
 * focus moves inside it; an effect keyed on `open` runs too late.
 */
export function useFocusReturn() {
  const openerRef = useRef<HTMLElement | null>(null);

  const capture = useCallback(() => {
    if (typeof document === "undefined") return;
    const active = document.activeElement;
    openerRef.current = active instanceof HTMLElement ? active : null;
  }, []);

  const onCloseAutoFocus = useCallback((event: Event) => {
    const opener = openerRef.current;
    // A stale node (its page section re-rendered away) is left to Radix.
    if (opener && opener.isConnected) {
      event.preventDefault();
      opener.focus();
    }
  }, []);

  return { capture, onCloseAutoFocus };
}
