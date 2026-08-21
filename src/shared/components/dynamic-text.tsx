import { detectTextScript } from "@/shared/lib/text-script";

/**
 * A run of catalogue text whose script is not the page's own.
 *
 * The storefront is bilingual but the catalogue is not always: this shop's
 * products carry only a `fa` name, so the English storefront correctly falls
 * back to the Persian one and then renders Persian inside a `lang="en"`
 * document. `<bdi>` already fixed how that text is *ordered*; this fixes how it
 * is *pronounced*, which is a separate requirement (WCAG 3.1.2, Language of
 * Parts) and the one a screen-reader user actually hears — an English voice
 * reading Persian produces nothing intelligible.
 *
 * The script is read off the text rather than threaded down from the API layer,
 * because the same problem runs in both directions: a shop that names a product
 * in English shows Latin text on the Persian storefront, and only the string
 * itself knows which it is.
 */
export function DynamicText({ children }: { children: string | null | undefined }) {
  if (!children) return null;

  const script = detectTextScript(children);

  return <bdi lang={script ?? undefined}>{children}</bdi>;
}
