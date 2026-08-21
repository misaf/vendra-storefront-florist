import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  hostnameOf,
  resolveApiUrl,
  resolveSiteUrl,
  resolveStorageUrl,
  resolveStorefrontKey,
  resolveStorefrontKeyHeader,
} from "./env.ts";

const MANAGED = [
  "API_BASE_URL",
  "VENDRA_API_URL",
  "STORAGE_BASE_URL",
  "SITE_URL",
  "VENDRA_STOREFRONT_KEY",
  "VENDRA_STOREFRONT_KEY_HEADER",
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_VENDRA_API_URL",
  "NEXT_PUBLIC_STORAGE_BASE_URL",
  "NEXT_PUBLIC_SITE_URL",
] as const;

function clear() {
  for (const name of MANAGED) delete process.env[name];
}

clear();
afterEach(clear);

test("accepts the API as a bare origin or with the /api suffix", () => {
  // The deploy template passes an origin; the storefront addresses resources
  // below /api. Both spellings have to land on the same base.
  process.env.VENDRA_API_URL = "https://api.example.com";
  assert.equal(resolveApiUrl(), "https://api.example.com/api");

  process.env.VENDRA_API_URL = "https://api.example.com/api";
  assert.equal(resolveApiUrl(), "https://api.example.com/api");

  process.env.VENDRA_API_URL = "https://api.example.com/";
  assert.equal(resolveApiUrl(), "https://api.example.com/api");
});

test("API_BASE_URL takes precedence over VENDRA_API_URL", () => {
  process.env.API_BASE_URL = "https://explicit.example.com";
  process.env.VENDRA_API_URL = "https://fallback.example.com";
  assert.equal(resolveApiUrl(), "https://explicit.example.com/api");
});

test("no NEXT_PUBLIC_ alias can supply a store-specific origin", () => {
  // A NEXT_PUBLIC_ value is inlined at build time, so honouring one here would
  // freeze a single store's hosts into the image the whole fleet shares.
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://leaked.example.com";
  process.env.NEXT_PUBLIC_VENDRA_API_URL = "https://leaked.example.com";
  process.env.NEXT_PUBLIC_STORAGE_BASE_URL = "https://leaked.example.com";
  process.env.NEXT_PUBLIC_SITE_URL = "https://leaked.example.com";

  assert.equal(resolveApiUrl(), null);
  assert.equal(resolveStorageUrl(), null);
  assert.equal(resolveSiteUrl(), null);
});

test("storage falls back to the API origin, which serves /storage", () => {
  process.env.VENDRA_API_URL = "https://api.example.com/api";
  assert.equal(resolveStorageUrl(), "https://api.example.com");

  process.env.STORAGE_BASE_URL = "https://cdn.example.com/";
  assert.equal(resolveStorageUrl(), "https://cdn.example.com");
});

test("unset origins resolve to null rather than a guess", () => {
  assert.equal(resolveApiUrl(), null);
  assert.equal(resolveStorageUrl(), null);
  assert.equal(resolveSiteUrl(), null);
});

test("site URL loses any trailing slash", () => {
  // It is concatenated into canonical URLs and sent as an Origin header.
  process.env.SITE_URL = "https://store.example.com///";
  assert.equal(resolveSiteUrl(), "https://store.example.com");
});

test("the storefront credential is trimmed, and blank means unset", () => {
  assert.equal(resolveStorefrontKey(), null);

  process.env.VENDRA_STOREFRONT_KEY = "   ";
  assert.equal(resolveStorefrontKey(), null);

  process.env.VENDRA_STOREFRONT_KEY = "  secret-value  ";
  assert.equal(resolveStorefrontKey(), "secret-value");
});

test("the credential header name has a default", () => {
  assert.equal(resolveStorefrontKeyHeader(), "X-Storefront-Key");

  process.env.VENDRA_STOREFRONT_KEY_HEADER = " X-Other ";
  assert.equal(resolveStorefrontKeyHeader(), "X-Other");
});

test("hostnameOf falls back rather than throwing on junk", () => {
  // next.config.ts calls this while building image remotePatterns; a throw
  // there would fail the build instead of producing an empty pattern list.
  assert.equal(hostnameOf("https://api.example.com/api", "localhost"), "api.example.com");
  assert.equal(hostnameOf("not a url", "localhost"), "localhost");
  assert.equal(hostnameOf(undefined, "localhost"), "localhost");
});
