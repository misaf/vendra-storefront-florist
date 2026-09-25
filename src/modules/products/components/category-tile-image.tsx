"use client";

import Image from "next/image";
import { useState } from "react";
import { CategoryImageFallback } from "@/shared/components/ui/category-image-fallback";

interface CategoryTileImageProps {
  src: string;
  sizes: string;
  unoptimized: boolean;
  tone: number;
}

/**
 * The category photograph, or the drawn fallback once it fails to load.
 *
 * `CategoryTile` already draws the fallback when the catalogue has no image,
 * but a URL that exists and then 404s — a moved asset, a storage host that is
 * down — used to leave the browser's broken-image glyph on a blank plate. The
 * failure is recorded per URL, as `SafeImage` does, so a new `src` gets its own
 * attempt instead of inheriting the last one's failure.
 */
export function CategoryTileImage({
  src,
  sizes,
  unoptimized,
  tone,
}: CategoryTileImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) {
    return <CategoryImageFallback tone={tone} />;
  }

  return (
    <Image
      src={src}
      /* Empty on purpose: the category's name is drawn directly below, inside
         the same link. An alt here would make the link announce itself twice. */
      alt=""
      fill
      sizes={sizes}
      unoptimized={unoptimized}
      onError={() => setFailedSrc(src)}
      /* Never priority: every caller places this below its own masthead, so
         no tile competes with the page's LCP image. */
      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  );
}
