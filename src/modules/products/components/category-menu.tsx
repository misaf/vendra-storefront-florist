"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FocusEvent as ReactFocusEvent } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { useTranslations } from "@/shared/hooks/use-translations";
import { cn } from "@/shared/lib/utils";
import { useProductCategories } from "../lib/queries";
import { DynamicText } from "@/shared/components/dynamic-text";

interface CategoryMenuProps {
  /**
   * Trigger classes, supplied by the bar it sits in so the catalogue reads as
   * one of the navigation links rather than as a control of its own kind.
   */
  className?: string;
  /** The catalogue is the section currently being viewed. */
  active?: boolean;
}

/**
 * Columns follow the catalogue rather than a fixed grid: a shop with four
 * categories gets a narrow list instead of a wide panel with empty columns,
 * and one with thirty still scans in three columns of ten.
 */
function getPanelLayout(count: number) {
  if (count >= 9) return { width: "w-[40rem]", columns: "grid-cols-3" };
  if (count >= 5) return { width: "w-[27rem]", columns: "grid-cols-2" };
  return { width: "w-[16rem]", columns: "grid-cols-1" };
}

const CATEGORY_LINK_CLASS =
  "store-dynamic-text flex min-h-10 items-center rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground";

/**
 * The catalogue entry in the main navigation: a disclosure button and the panel
 * of categories it reveals.
 *
 * It is deliberately *not* an ARIA menu. `role="menu"` describes an application
 * menu — arrow-key driven, Tab exits, the rest of the page goes inert — and a
 * modal dropdown applied that to site navigation: every link was `tabindex=-1`,
 * page scroll was locked and the whole document was `aria-hidden` while a
 * shopper browsed categories. This is a button that discloses a list of links,
 * so it is built as one and Tab walks straight through it.
 */
export function CategoryMenu({ className, active = false }: CategoryMenuProps) {
  const { t, locale } = useTranslations();
  const pathname = usePathname();
  const { data: categories = [], isLoading } = useProductCategories(locale);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const listLabelId = useId();
  const layout = getPanelLayout(categories.length);

  const close = useCallback(() => setOpen(false), []);

  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // A route change from outside the panel — a browser Back step, the logo, the
  // search panel — must not leave it hanging open over the page it opened onto.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
   * Tabbing past the last category is how a keyboard user says they are done
   * with the panel. A null `relatedTarget` is not that — it is a click on the
   * panel's own padding, or focus leaving for the browser chrome — so it is
   * left alone rather than closing the panel out from under the pointer.
   */
  const handleFocusOut = (event: ReactFocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next) return;
    if (triggerRef.current?.contains(next)) return;
    if (panelRef.current?.contains(next)) return;
    setOpen(false);
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    setOpen(true);
    // The panel mounts with this state change, so the first link only exists
    // after paint.
    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
    });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-current={active ? "true" : undefined}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={handleTriggerKeyDown}
        onBlur={handleFocusOut}
        className={cn(
          "inline-flex items-center gap-1.5",
          className,
          // Open reads exactly like current: both mean "this is the section
          // you are in", and a fainter open state let the neighbouring active
          // link out-shout the trigger whose panel was on screen.
          open && !active && "bg-secondary text-foreground"
        )}
      >
        {t("common.products")}
        <ChevronDown
          aria-hidden="true"
          className={cn("size-3.5 opacity-60 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          onBlur={handleFocusOut}
          /* Anchored to the header, not to the trigger: the nav is vertically
             centred in the bar, so its own centre plus half the header height
             lands the panel exactly on the header's bottom edge at both header
             heights. `end-0` lines its closing edge up with the last navigation
             link — one alignment that holds at every width and in both
             directions, instead of a floating panel whose position is decided
             by whichever viewport edge it collided with. */
          className={cn(
            "absolute end-0 top-[calc(50%+var(--store-header-h)/2)] z-10",
            "max-w-[calc(100vw-2rem)] overflow-y-auto rounded-b-2xl border border-t-0 border-border bg-card p-3 text-card-foreground shadow-panel",
            /* The header is not the only chrome above the panel — the utility
               bar sits above it until the page is scrolled — so the allowance
               covers both. Without it a short viewport clips the last category
               off a panel that is a few pixels under its own scroll threshold,
               leaving it unreachable. */
            "max-h-[calc(100dvh-var(--store-header-h)-5rem)]",
            "animate-in fade-in-0 slide-in-from-top-1 duration-150",
            layout.width
          )}
        >
          <Link
            href="/products"
            onClick={close}
            className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {t("common.allProducts")}
            <ArrowRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
          </Link>

          {/* Named, not just captioned: tabbing into the panel otherwise
              announces "list, 13 items" with no clue what the list is of, since
              a visual label above a list is a label to no one. */}
          <p id={listLabelId} className="mb-1 mt-4 px-3 text-xs font-bold uppercase text-muted-foreground">
            {t("common.browseByCategory")}
          </p>

          {isLoading ? (
            <ul className={cn("grid gap-x-2 gap-y-0.5", layout.columns)} aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <li key={index} className="flex min-h-10 items-center px-3 py-2">
                  <span className="h-3.5 w-full animate-pulse rounded-full bg-muted" />
                </li>
              ))}
            </ul>
          ) : categories.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">{t("common.noCategories")}</p>
          ) : (
            <ul aria-labelledby={listLabelId} className={cn("grid gap-x-2 gap-y-0.5", layout.columns)}>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={{ pathname: "/products", query: { category: category.slug } }}
                    onClick={close}
                    className={CATEGORY_LINK_CLASS}
                  >
                    <DynamicText>{category.name}</DynamicText>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </>
  );
}
