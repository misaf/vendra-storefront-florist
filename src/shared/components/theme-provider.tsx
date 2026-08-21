"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import {
  isStorefrontTheme,
  writeStorefrontThemeCookie,
} from "@/shared/lib/theme";

function ThemeCookieSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (isStorefrontTheme(resolvedTheme)) {
      writeStorefrontThemeCookie(resolvedTheme);
    }
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>
  );
}
