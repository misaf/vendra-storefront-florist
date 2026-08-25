"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FocusEvent as ReactFocusEvent } from "react";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";

type Translate = (key: string, values?: Record<string, string | number>) => string;

export interface SortOption<T extends string> {
  value: T;
  labelKey: string;
}

interface SortControlProps<T extends string> {
  options: ReadonlyArray<SortOption<T>>;
  active: T;
  /** The catalogue URL for a given order — sort stays addressable. */
  hrefFor: (value: T) => string;
  t: Translate;
}

/**
 * The catalogue's sort control: a disclosure that names the order in force and
 * reveals the others.
 *
 * Every option is a real link, so an order stays a shareable address and
 * `aria-current` marks the one in force. It is deliberately not an ARIA menu,
 * for the same reason `CategoryMenu` is not: `role="menu"` describes an
 * arrow-key-driven application widget that Tab exits, which is the wrong
 * contract for a short list of destinations.
 */
export function SortControl<T extends string>({
  options,
  active,
  hrefFor,
  t,
}: SortControlProps<T>) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeOption =
    options.find((option) => option.value === active) ?? options[0];

  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Choosing an order is a route change, so the panel must not survive it.
  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeAndRestoreFocus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeAndRestoreFocus]);

  /**
   * Tabbing past the last option is how a keyboard user says they are done. A
   * null `relatedTarget` is not — it is a click on the panel's own padding, or
   * focus leaving for the browser chrome — so it is left alone.
   */
  const handleFocusOut = (event: ReactFocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next) return;
    if (triggerRef.current?.contains(next)) return;
    if (panelRef.current?.contains(next)) return;
    setOpen(false);
  };

  return (
    <>
      {/* One compact control at every width. It used to split into a row of
          four pills above `lg` and this disclosure below it, which put the
          catalogue's least important control at its widest exactly where the
          results header has the most competing for the line — the design
          system gives sort a single small control pushed to the end of that
          row instead. Every option in the panel is still a real link, so an
          order stays a shareable address. */}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={() => setOpen((isOpen) => !isOpen)}
          onBlur={handleFocusOut}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30"
        >
          <ArrowUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">{t("products.sortLabelShort")}</span>
          <span>{t(activeOption.labelKey)}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-3.5 shrink-0 opacity-60 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        {open ? (
          <div
            ref={panelRef}
            id={panelId}
            onBlur={handleFocusOut}
            className="absolute start-0 top-[calc(100%+0.5rem)] z-20 w-56 rounded-2xl border border-border bg-card p-1.5 text-card-foreground shadow-panel animate-in fade-in-0 slide-in-from-top-1 duration-150"
          >
            <ul aria-label={t("products.sortLabel")}>
              {options.map((option) => {
                const isActive = option.value === active;

                return (
                  <li key={option.value}>
                    <Link
                      href={hrefFor(option.value)}
                      scroll={false}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-11 items-center justify-between gap-3 rounded-full px-3 text-sm transition-colors hover:bg-secondary",
                        isActive ? "font-semibold text-primary" : "text-foreground/80"
                      )}
                    >
                      {t(option.labelKey)}
                      {isActive ? (
                        <Check className="size-4 shrink-0" aria-hidden="true" />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
}
