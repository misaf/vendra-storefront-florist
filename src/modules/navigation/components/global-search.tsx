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
  const [isMac, setIsMac] = useState(false);
  const { t } = useTranslations();
  const { capture, onCloseAutoFocus } = useFocusReturn();

  // Which modifier to draw in the hint. `navigator.platform` is deprecated, so
  // the UA-data platform is preferred where it exists and it is the fallback.
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ?? navigator.platform;
    setIsMac(/mac/i.test(platform));
  }, []);

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
        className={full ? "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-start text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground" : "flex size-[44px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground xl:hidden"}
        aria-label={t("search.title")}
      >
        <Search className="h-4 w-4" />
        {full ? <span>{t("search.placeholder")}</span> : null}
      </button>

      {!full ? <button
        onClick={openSearch}
        /* The width is capped against the viewport as well as stated in rem.
           A bare `w-56` is 14rem, which at a doubled root font size becomes
           448px of unshrinkable control and pushed the whole header cluster
           past the right edge of a 1280px window — content loss under WCAG
           1.4.4. `min()` leaves the resting width untouched and only bites
           once the text is scaled up. */
        className="hidden h-11 min-w-0 items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-card hover:text-foreground xl:flex xl:w-[min(14rem,22vw)] 2xl:w-[min(16rem,22vw)]"
        aria-label={t("search.title")}
      >
        <Search className="h-4 w-4" />
        <span className="min-w-0 flex-1 truncate whitespace-nowrap text-start">{t("search.placeholder")}</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded-full border border-border bg-card px-1.5 font-mono text-xs font-medium xl:flex">
          <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>
          {isMac ? "K" : "+K"}
        </kbd>
      </button> : null}

      {hasOpened ? <SearchPanel open={open} onOpenChange={setOpen} onCloseAutoFocus={onCloseAutoFocus} /> : null}
    </>
  );
}
