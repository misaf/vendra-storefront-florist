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
 * The catalogue's sort control, in the two shapes the two viewports want.
 *
 * Every option is a real link in both shapes, so an order stays a shareable
 * address and `aria-current` still marks the one in force. Only one shape is in
 * the accessibility tree at a time: the other is `display: none`, which removes
 * it from the tree entirely, so nothing is announced twice.
 *
 * The narrow shape is a disclosure — a button that reveals a list of links —
 * and deliberately not an ARIA menu, for the same reason `CategoryMenu` is not:
 * `role="menu"` describes an arrow-key-driven application widget that Tab exits,
 * which is the wrong contract for a short list of destinations.
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
      {/* Wide: every order visible and one tap away. */}
      <div
        role="group"
        aria-label={t("products.sortLabel")}
        className="hidden min-w-0 flex-wrap items-center gap-2.5 lg:flex"
      >
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <ArrowUpDown className="size-4" aria-hidden="true" />
          {t("products.sortBy")}
        </span>
        {options.map((option) => {
          const isActive = option.value === active;

          return (
            <Link
              key={option.value}
              href={hrefFor(option.value)}
              scroll={false}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full border px-3 text-xs font-semibold transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {t(option.labelKey)}
            </Link>
          );
        })}
      </div>

      {/* Narrow: one control instead of a second horizontal scroller competing
          with the category row directly above it. */}
      <div className="relative lg:hidden">
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
            className="absolute start-0 top-[calc(100%+0.5rem)] z-20 w-56 rounded-xl border border-border bg-card p-1.5 text-card-foreground shadow-panel animate-in fade-in-0 slide-in-from-top-1 duration-150"
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
                        "flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm transition-colors hover:bg-secondary",
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
