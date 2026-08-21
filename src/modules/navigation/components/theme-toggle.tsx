"use client";

import { useTheme } from "next-themes";
import { Button } from "@/shared/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "@/shared/hooks/use-translations";
import { writeStorefrontThemeCookie } from "@/shared/lib/theme";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslations();
  const [mounted, setMounted] = useState(false);
  const isLightTheme = resolvedTheme !== "dark";

  function toggleTheme() {
    const nextTheme = isLightTheme ? "dark" : "light";
    // Write before changing React state so an immediate refresh agrees with
    // the artwork and class selected by next-themes.
    writeStorefrontThemeCookie(nextTheme);
    setTheme(nextTheme);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={t("common.toggleTheme")}
      aria-pressed={mounted ? !isLightTheme : undefined}
    >
      {!mounted ? (
        <Sun className="size-5 opacity-0" />
      ) : isLightTheme ? (
        <Moon className="size-5" />
      ) : (
        <Sun className="size-5" />
      )}
    </Button>
  );
}
