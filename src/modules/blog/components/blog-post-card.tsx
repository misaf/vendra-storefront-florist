"use client";

import { Link } from "@/shared/i18n/navigation";
import Image from "next/image";
import { useState } from "react";
import { BlogPostCardView } from "@/shared/components/ui/blog-post-card-view";
import { normalizeImageUrl } from "@/shared/lib/utils";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import type { Post as BlogPost } from "../types";

interface BlogPostCardProps {
  post: BlogPost;
  formatDate: (dateString: string) => string;
  /** The dated line under the title; off where the grid is a preview rail. */
  showDate?: boolean;
  showExcerpt?: boolean;
  showCategory?: boolean;
  /** A denser step for the home page's preview, where three sit beside a
   *  section heading rather than filling the page. */
  compact?: boolean;
}

/**
 * One entry in the journal, as the Organic system draws a content card: a solid
 * plate of the warm surface with the picture bled to its top edge, then a
 * kicker, the title and whatever supporting line the surface calls for.
 *
 * It replaces two different cards that had drifted apart — this one, which drew
 * a borderless transparent box, and a "featured" variant that laid white text
 * over a black gradient scrim on the photograph. The scrim is the pattern this
 * design system explicitly trades away: it costs the picture two thirds of its
 * contrast to make type survive on top of it, when the same type is legible for
 * free on the surface directly below.
 *
 * The drawing is `BlogPostCardView`, in the shared kit; this wrapper supplies
 * the route, the optimized image and the locale's date.
 */
export function BlogPostCard({
  post,
  formatDate,
  showDate = true,
  showExcerpt = true,
  showCategory = true,
  compact = false,
}: BlogPostCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const date = post.publishedAt || post.createdAt;

  return (
    <BlogPostCardView
      asChild
      title={post.title}
      category={showCategory ? post.category : null}
      excerpt={showExcerpt ? post.excerpt : null}
      dateTime={showDate ? date : null}
      dateLabel={showDate && date ? formatDate(date) : null}
      washSeed={post.id}
      compact={compact}
      image={
        hasImageError ? undefined : (
          <Image
            src={normalizeImageUrl(post.thumbnail || post.image)}
            /* Empty on purpose: the title is inside the same link, so an alt
               here would make the link announce its own name twice. */
            alt=""
            fill
            sizes={
              compact
                ? "(min-width: 1024px) 24rem, (min-width: 640px) 45vw, calc(100vw - 2rem)"
                : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(100vw - 2rem)"
            }
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            unoptimized
            onError={() => setHasImageError(true)}
          />
        )
      }
    >
      <Link href={`/blog/${createReadableResourcePath(post.id, post.slug)}`} />
    </BlogPostCardView>
  );
}
