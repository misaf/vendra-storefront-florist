"use client";

import Image, { type ImageProps } from "next/image";
import {
  DARK_PLACEHOLDER_IMAGE,
  PLACEHOLDER_IMAGE,
  isPlaceholderImage,
} from "@/shared/lib/image";
import { cn } from "@/shared/lib/utils";

type ThemedProductImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

export function ThemedProductImage({
  src,
  alt,
  className,
  onError,
  ...props
}: ThemedProductImageProps) {
  if (!isPlaceholderImage(src)) {
    return (
      <Image
        {...props}
        src={src}
        alt={alt}
        className={className}
        onError={onError}
      />
    );
  }

  return (
    <>
      <Image
        {...props}
        src={PLACEHOLDER_IMAGE}
        alt={alt}
        className={cn(className, "object-cover p-0 dark:hidden")}
      />
      <Image
        {...props}
        src={DARK_PLACEHOLDER_IMAGE}
        alt={alt}
        className={cn(className, "hidden object-cover p-0 dark:block")}
      />
    </>
  );
}
