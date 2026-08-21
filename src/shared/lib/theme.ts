export const STOREFRONT_THEME_COOKIE = "storefront-theme";

export type StorefrontTheme = "light" | "dark";

export function isStorefrontTheme(value: unknown): value is StorefrontTheme {
  return value === "light" || value === "dark";
}

/** Mirror next-themes into a server-readable preference for the next request. */
export function writeStorefrontThemeCookie(theme: StorefrontTheme) {
  document.cookie = `${STOREFRONT_THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
