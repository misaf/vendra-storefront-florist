"use client";

import type { MouseEvent } from "react";
import { useTranslations } from "@/shared/hooks/use-translations";

/**
 * Keyboard/screen-reader "skip to main content" link. Visually hidden until
 * focused, it must be the first focusable element so AT users can bypass the
 * header on every page.
 */
export function SkipLink() {
  const { t } = useTranslations();

  function handleSkipToContent(event: MouseEvent<HTMLAnchorElement>) {
    const mainContent = document.getElementById("main-content");

    if (!mainContent) {
      return;
    }

    event.preventDefault();
    window.history.pushState(null, "", "#main-content");
    mainContent.focus({ preventScroll: true });
    mainContent.scrollIntoView({ block: "start" });
  }

  return (
    <a
      href="#main-content"
      onClick={handleSkipToContent}
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-primary-foreground focus-visible:shadow-lg"
    >
      {t("common.skipToContent")}
    </a>
  );
}
