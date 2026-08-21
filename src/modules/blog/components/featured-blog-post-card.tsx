"use client";

import { Link } from "@/shared/i18n/navigation";
import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { normalizeImageUrl } from "@/shared/lib/utils";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import { DynamicText } from "@/shared/components/dynamic-text";
import type { Post as BlogPost } from "../types";

interface FeaturedBlogPostCardProps {
  post: BlogPost;
  imageUnavailableText: string;
}

export function FeaturedBlogPostCard({
  post,
  imageUnavailableText,
}: FeaturedBlogPostCardProps) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <Link
      href={`/blog/${createReadableResourcePath(post.id, post.slug)}`}
      className="group relative block h-full min-h-72 overflow-hidden rounded-2xl ring-1 ring-white/10"
    >
      {hasImageError ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-storefront-brand/40 text-storefront-brand-foreground">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs font-semibold">{imageUnavailableText}</span>
        </div>
      ) : (
        <Image
          src={normalizeImageUrl(post.image)}
          /* Empty on purpose: the title this picture illustrates is drawn over
             it, inside the same link. Repeating it here makes the link announce
             its own name twice — "Floral Design… , Floral Design…" — and adds
             nothing, because the alt would only ever restate the heading. */
          alt=""
          fill
          /* Inert while `unoptimized` is set — next/image emits a single `src`
             and no `srcset`, so one rendition has to serve every device. That is
             why `image` (extra-large, 1200px) is used and not a card-sized one:
             the worst case here is 100vw on a 430px phone at DPR 3, ~1290px. */
          sizes="(min-width: 1024px) 40vw, 100vw"
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setHasImageError(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <h3 className="store-dynamic-text line-clamp-3 text-xl font-bold leading-snug text-white transition-colors group-hover:text-white/80 sm:text-2xl lg:text-3xl">
          <DynamicText>{post.title}</DynamicText>
        </h3>
      </div>
    </Link>
  );
}
