"use client";

import { useEffect } from "react";
import { usePathname } from "@/shared/i18n/navigation";

/** The design's own curve and duration for a band arriving. */
const RISE = "rise 620ms cubic-bezier(0.22, 0.61, 0.36, 1) both";
/** The first band is already in view on load, so it plays at once and faster. */
const RISE_FIRST = "rise 520ms cubic-bezier(0.22, 0.61, 0.36, 1) both";

/**
 * The source design's one piece of motion: each band lifts fourteen pixels
 * into place as it comes into view, and the first plays immediately on load.
 *
 * Three things make this safe to do from an effect rather than in CSS:
 *
 *  - Nothing is hidden until JavaScript has run. The bands render at full
 *    opacity in the server HTML, and this only reaches in to hide the ones it
 *    is about to animate — so a failed chunk, a crawler or a reader with
 *    scripting off gets the page, not a blank column.
 *  - `prefers-reduced-motion` returns before anything is touched at all, which
 *    is stricter than the global duration clamp: a band that never animates is
 *    never hidden in the first place.
 *  - The marker is three-state, not two. A band that has *played* is skipped
 *    forever; a band that is merely *armed* is re-armed on every run. With a
 *    plain "seen it" flag, any second mount — React's development double-
 *    invoke, a Fast Refresh, a remount from a parent — hit the flag, returned
 *    early, and left the band at `opacity: 0` with no observer left alive to
 *    ever reveal it: a blank page below the first band.
 */
export function SectionRise() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const main = document.getElementById("main-content");
    if (!main) return;

    const play = (section: HTMLElement, animation: string) => {
      section.dataset.rise = "played";
      // Cleared as the animation takes over, so nothing depends on a CSS
      // animation out-ranking an inline style.
      section.style.opacity = "";
      section.style.animation = animation;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          play(entry.target as HTMLElement, RISE);
          observer.unobserve(entry.target);
        }
      },
      // A band counts as arrived slightly before its top edge clears the fold,
      // so the motion reads as the page settling rather than as a delay.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    // The pages compose either as `<main><section>` or, where a page wraps its
    // bands in one coloured shell, as `<main><div><section>`.
    const frame = requestAnimationFrame(() => {
      const sections = main.querySelectorAll<HTMLElement>(
        ":scope > section, :scope > div > section"
      );

      sections.forEach((section, index) => {
        if (section.dataset.rise === "played") return;

        if (index === 0) {
          play(section, RISE_FIRST);
          return;
        }

        section.dataset.rise = "armed";
        section.style.opacity = "0";
        observer.observe(section);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
