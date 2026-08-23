"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { PLACEHOLDER_IMAGE } from "@/shared/lib/image";
import { normalizeImageUrl } from "@/shared/lib/utils";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src: string | null | undefined;
  alt: string;
};

/**
 * `next/image` that falls back to the placeholder when the source 404s.
 *
 * State records *which URL failed*, not which URL to draw. Mirroring the prop
 * into state needed an effect to re-sync it on every change, which cost a
 * second render per source change and left one frame drawing the previous
 * product's photo. Deriving the source instead means a new `src` is honoured in
 * the same render that delivers it, and a URL that failed once stays fallen
 * back for as long as it is the one being asked for.
 */
export function SafeImage({ src, alt, onError, ...props }: SafeImageProps) {
  const normalizedSrc = normalizeImageUrl(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <Image
      {...props}
      src={failedSrc === normalizedSrc ? PLACEHOLDER_IMAGE : normalizedSrc}
      alt={alt}
      onError={(event) => {
        setFailedSrc(normalizedSrc);
        onError?.(event);
      }}
    />
  );
}
