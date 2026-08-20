import type { ReactNode } from "react";
import { Footer } from "@/modules/navigation";
import { Header } from "@/modules/navigation";
import { SkipLink } from "@/shared/components/layout/skip-link";
import { cn } from "@/shared/lib/utils";

/**
 * The frame every page sits in. No state of its own, so it carries no
 * "use client": rendered from a server page it stays on the server (only the
 * Header and Footer islands cross the boundary), and rendered from a client
 * page it simply joins that bundle.
 */
interface PageShellProps {
  children: ReactNode;
  showFooter?: boolean;
  showFooterNewsletter?: boolean;
  className?: string;
}

export function PageShell({
  children,
  showFooter = true,
  showFooterNewsletter = true,
  className,
}: PageShellProps) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      <SkipLink />
      <Header />
      <main id="main-content" tabIndex={-1} className="store-scroll-anchor focus:outline-none">
        {children}
      </main>
      {showFooter ? <Footer showNewsletter={showFooterNewsletter} /> : null}
    </div>
  );
}
