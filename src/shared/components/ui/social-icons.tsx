import type { SVGProps } from "react";

/**
 * The three accounts this storefront links out to, drawn as their own marks.
 *
 * They are here rather than imported because the icon set the rest of the
 * storefront uses (lucide) carries no brand glyphs — a WhatsApp link wearing a
 * generic speech bubble and a Telegram link wearing a paper plane are the same
 * icon twice, which is exactly the ambiguity a brand mark exists to remove.
 * Inline SVG, so they cost no request and follow `currentColor` into both
 * themes and onto the ink footer.
 *
 * Every one is decorative: the control around it carries the accessible name.
 */
type IconProps = SVGProps<SVGSVGElement>;

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.03.24-3.5-.73-2.98-1.17-4.85-4.29-5-4.49-.14-.2-1.19-1.6-1.19-3.05 0-1.45.75-2.16 1.02-2.46.27-.29.58-.36.78-.36l.56.01c.18 0 .42-.07.65.5l.9 2.19c.07.15.12.32.02.51l-.39.58c-.12.17-.26.26-.12.51.14.24.63 1.09 1.35 1.76.93.87 1.71 1.14 1.95 1.27.24.12.39.1.53-.06.15-.17.63-.73.8-.99.17-.25.34-.2.56-.12l2.05.97c.24.12.4.17.46.27.06.1.06.61-.18 1.29z" />
    </svg>
  );
}

export function TelegramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.9 4.3 18.7 19.4c-.24 1.07-.88 1.33-1.78.83l-4.9-3.62-2.37 2.28c-.26.26-.48.48-.98.48l.35-4.97 9.04-8.17c.39-.35-.09-.54-.61-.19L6.28 13.1 1.5 11.6c-1.04-.32-1.06-1.04.22-1.54L20.4 2.83c.86-.32 1.62.2 1.5 1.47z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      aria-hidden="true"
      {...props}
    >
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.4" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
