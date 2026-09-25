"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useFocusReturn } from "@/shared/hooks/use-focus-return";
import { Search } from "lucide-react";

/**
 * Search palette. Only the trigger ships with the header; cmdk, the result
 * list and the product fetcher arrive the first time someone opens search —
 * they are worth nothing to the majority of visitors who never do.
 */
const SearchPanel = dynamic(() => import("./search-panel"), { ssr: false });

export function GlobalSearch({ full = false }: { full?: boolean }) {
  const [open, setOpen] = useState(false);
  // Kept mounted after the first open so re-opening is instant rather than
  // re-suspending on the chunk.
  const [hasOpened, setHasOpened] = useState(false);
  const { t } = useTranslations();
  const { capture, onCloseAutoFocus } = useFocusReturn();

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        capture();
        setHasOpened(true);
        setOpen((previous) => !previous);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [capture]);

  const openSearch = () => {
    capture();
    setHasOpened(true);
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={openSearch}
        /* Icon-only at every width. The bar's own composition is brand,
           navigation, then a cluster of round controls; a 14rem search field
           wedged between the links and that cluster was the one rectangle in a
           row of pills, and it took the width the navigation needs. */
        className={full ? "flex h-11 w-full items-center gap-3 rounded-sm px-2 text-start text-sm text-muted-foreground transition-colors hover:text-foreground" : /* 36px drawn, 44px targeted — matched to the Button component's own
           icon size so the three controls in the cluster are one row of discs
           rather than two sizes side by side. */
        "relative flex size-[36px] items-center justify-center rounded-full border border-border text-foreground transition-colors after:absolute after:left-1/2 after:top-1/2 after:size-[44px] after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] hover:bg-foreground/8 active:bg-foreground/14"}
        aria-label={t("search.title")}
      >
        <Search className="h-4 w-4" />
        {full ? <span>{t("search.placeholder")}</span> : null}
      </button>


      {hasOpened ? <SearchPanel open={open} onOpenChange={setOpen} onCloseAutoFocus={onCloseAutoFocus} /> : null}
    </>
  );
}
