"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { UserPanel } from "./user-panel";
import { Heart } from "lucide-react";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useFocusReturn } from "@/shared/hooks/use-focus-return";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { useFavorites } from "../hooks/favorites-context";

/**
 * The saved-items entry in the header bar.
 *
 * Drawn as the design's outlined round control, with the count pinned to its
 * corner in the sage — the second accent, which this system reserves for a
 * settled fact rather than for an action. It used to be a bookmark glyph with
 * no count at all, so the one thing the control could have told a shopper
 * before they opened it — that they have saved anything — it did not.
 *
 * The count only renders after hydration: the list lives in localStorage, so
 * the server has no opinion about it and rendering one would mismatch.
 */
export function UserButton() {
  const [open, setOpen] = useState(false);
  const { t, locale } = useTranslations();
  const { capture, onCloseAutoFocus } = useFocusReturn();
  const hydrated = useHydrated();
  const { favorites } = useFavorites();
  const count = favorites.length;
  const showCount = hydrated && count > 0;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => {
          capture();
          setOpen(true);
        }}
        aria-label={t("common.myAccount")}
      >
        <Heart className={showCount ? "size-4 fill-current" : "size-4"} />
        {showCount ? (
          <span
            aria-hidden="true"
            className="absolute -top-1 -end-1 flex min-h-[1.0625rem] min-w-[1.0625rem] items-center justify-center rounded-full bg-leaf px-1 text-[0.625rem] font-semibold leading-none text-background"
          >
            {new Intl.NumberFormat(locale).format(Math.min(count, 99))}
          </span>
        ) : null}
      </Button>
      <UserPanel open={open} onOpenChange={setOpen} onCloseAutoFocus={onCloseAutoFocus} />
    </>
  );
}
