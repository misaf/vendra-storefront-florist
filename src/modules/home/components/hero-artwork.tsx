"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { toAbsoluteStorageUrl } from "@/shared/lib/image";
import type { StorefrontTheme } from "@/shared/lib/theme";

interface HeroArtworkProps {
  lightImage: string | null;
  darkImage: string | null;
  initialTheme: StorefrontTheme;
}

/**
 * Render exactly one responsive image. The request-time theme keeps SSR and
 * hydration aligned; next-themes changes the same image source after a toggle.
 */
export function HeroArtwork({
  lightImage,
  darkImage,
  initialTheme,
}: HeroArtworkProps) {
  const { resolvedTheme } = useTheme();
  const activeTheme =
    resolvedTheme === "light" || resolvedTheme === "dark"
      ? resolvedTheme
      : initialTheme;
  const configuredSource = activeTheme === "dark" ? darkImage : lightImage;

  if (!configuredSource) return null;

  const src = toAbsoluteStorageUrl(configuredSource);

  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(min-width: 1024px) 56vw, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
      quality={85}
      preload
      unoptimized={src.startsWith("/api/storage/")}
      className="object-cover object-center motion-reduce:transition-none"
    />
  );
}
