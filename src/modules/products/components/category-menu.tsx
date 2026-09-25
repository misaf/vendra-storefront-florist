"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FocusEvent as ReactFocusEvent } from "react";
import { ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { useTranslations } from "@/shared/hooks/use-translations";
import { cn } from "@/shared/lib/utils";
import { useProductCategories } from "../lib/queries";
import { DynamicText } from "@/shared/components/dynamic-text";
import { Button } from "@/shared/components/ui/button";

interface CategoryMenuProps {
  /** Extra trigger classes; the bar's own link style is applied here. */
  className?: string;
  /** The catalogue is the section currently being viewed. */
  active?: boolean;
}

/**
 * Columns follow the catalogue rather than a fixed grid: a shop with four
 * categories gets a single readable column instead of a wide panel with empty
 * ones, and a shop with thirty still scans two-up.
 */
function getPanelLayout(count: number) {
  return { columns: count >= 7 ? "grid-cols-2" : "grid-cols-1" };
}

/* A destination, drawn as the system's pill. The rows used to carry a
   two-digit `font-mono` ordinal and a hairline under each one, which numbered
   the shop's collections 01…13 as though the order meant something and drew
   thirteen rules inside a panel that is itself a floating card. */
const CATEGORY_LINK_CLASS =
  "store-dynamic-text flex min-h-11 items-center rounded-full px-3.5 py-2 text-sm leading-snug text-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

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
        // Open reads exactly like current: both mean "this is the section you
        // are in", and a fainter open state let the neighbouring active link
        // out-shout the trigger whose panel was on screen.
        data-active={active || open}
        className={cn("store-nav-link gap-1.5", className)}
      >
        {t("common.shop")}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-[0.8125rem] transition-transform duration-200",
            open && "rotate-180"
          )}
          strokeWidth={2.75}
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
            "w-[min(34.5rem,calc(100vw-3rem))] overflow-hidden rounded-[1.625rem] bg-background p-4 text-foreground shadow-panel",
            /* The header is not the only chrome above the panel — the utility
               bar sits above it until the page is scrolled — so the allowance
               covers both. Without it a short viewport clips the last category
               off a panel that is a few pixels under its own scroll threshold,
               leaving it unreachable. */
            "max-h-[calc(100dvh-var(--store-header-h)-5rem)]",
            "animate-in fade-in-0 slide-in-from-top-1 duration-150"
          )}
        >
          <div className="grid max-h-[calc(100dvh-var(--store-header-h)-6rem)] grid-cols-[repeat(auto-fit,minmax(min(100%,11.125rem),1fr))] gap-5 overflow-y-auto overscroll-contain">
            <div>
              {/* Named, not just captioned: tabbing into the panel otherwise
                  announces "list, 13 items" with no clue what the list is of. */}
              <p id={listLabelId} className="sr-only">
                {t("common.browseByCategory")}
              </p>

              {isLoading ? (
                <ul className={cn("grid gap-x-1.5 gap-y-0.5", layout.columns)} aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <li key={index} className="flex min-h-11 items-center px-3.5 py-2">
                      <span className="h-3.5 w-full animate-pulse rounded-full bg-muted" />
                    </li>
                  ))}
                </ul>
              ) : categories.length === 0 ? (
                <p className="px-3.5 py-2 text-sm text-muted-foreground">{t("common.noCategories")}</p>
              ) : (
                <ul aria-labelledby={listLabelId} className={cn("grid content-start gap-x-1.5 gap-y-0.5", layout.columns)}>
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

            {/* The panel's second half: one sentence about how the shop groups
                itself, and the way through to the unfiltered catalogue. It was
                an ink slab carrying a 1.85rem display headline — a masthead
                inside a dropdown, and the only inverted surface in the header. */}
            <div className="flex flex-col items-start gap-3.5 border-border ps-5 max-[28rem]:border-t max-[28rem]:pt-4 max-[28rem]:ps-0 min-[28rem]:border-s">
              <p className="store-lede text-xs text-muted-foreground">
                {t("home.collectionsSubtitle")}
              </p>
              <Button asChild variant="outline" size="sm" onClick={close}>
                <Link href="/collections">{t("collections.viewAll")}</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
