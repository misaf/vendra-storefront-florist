import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  hostnameOf,
  resolveApiUrl,
  resolveStorageUrl,
} from "./env.ts";

const MANAGED = [
  "VENDRA_API_URL",
  "STORAGE_BASE_URL",
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

test("no NEXT_PUBLIC_ alias can supply a store-specific origin", () => {
  // A NEXT_PUBLIC_ value is inlined at build time, so honouring one here would
  // freeze a single store's hosts into the image the whole fleet shares.
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://leaked.example.com";
  process.env.NEXT_PUBLIC_VENDRA_API_URL = "https://leaked.example.com";
  process.env.NEXT_PUBLIC_STORAGE_BASE_URL = "https://leaked.example.com";
  process.env.NEXT_PUBLIC_SITE_URL = "https://leaked.example.com";

  assert.equal(resolveApiUrl(), null);
  assert.equal(resolveStorageUrl(), null);
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
});

test("hostnameOf falls back rather than throwing on junk", () => {
  // next.config.ts calls this while building image remotePatterns; a throw
  // there would fail the build instead of producing an empty pattern list.
  assert.equal(hostnameOf("https://api.example.com/api", "localhost"), "api.example.com");
  assert.equal(hostnameOf("not a url", "localhost"), "localhost");
  assert.equal(hostnameOf(undefined, "localhost"), "localhost");
});
