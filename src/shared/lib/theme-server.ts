import "server-only";

import { cookies } from "next/headers";
import {
  isStorefrontTheme,
  STOREFRONT_THEME_COOKIE,
  type StorefrontTheme,
} from "@/shared/lib/theme";

/** Theme known at request time; light matches the storefront's default. */
export async function getRequestTheme(): Promise<StorefrontTheme> {
  const value = (await cookies()).get(STOREFRONT_THEME_COOKIE)?.value;
  return isStorefrontTheme(value) ? value : "light";
}
