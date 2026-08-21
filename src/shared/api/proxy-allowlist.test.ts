import test from "node:test";
import assert from "node:assert/strict";
import { ALLOWED_COLLECTIONS, resolveUpstreamPath } from "./proxy-allowlist.ts";

test("allows every collection the storefront's own client code reads", () => {
  for (const collection of ALLOWED_COLLECTIONS) {
    assert.equal(
      resolveUpstreamPath(collection.split("/")),
      collection,
      `${collection} should be proxyable`
    );
  }
});

test("allows a single record under an allowed collection", () => {
  assert.equal(
    resolveUpstreamPath(["catalog", "products", "42"]),
    "catalog/products/42"
  );
  assert.equal(
    resolveUpstreamPath(["content", "blog-posts", "a-post-slug"]),
    "content/blog-posts/a-post-slug"
  );
});

test("refuses collections that are not on the list", () => {
  // The credential rides along, so an unlisted path would be requested with
  // this storefront's identity.
  for (const path of [
    ["admin", "users"],
    ["user", "profile"],
    ["catalog", "orders"],
    ["content", "pages"],
  ]) {
    assert.equal(resolveUpstreamPath(path), null, path.join("/"));
  }
});

test("refuses traversal, however it is spelled", () => {
  // Route segments arrive URL-decoded, so `%2e%2e` reaches this function as "..".
  for (const path of [
    ["catalog", "..", "admin"],
    ["catalog", "products", ".."],
    ["catalog", "products", "."],
    ["catalog", "products", "../../admin"],
    ["catalog", "products", "..%2f..%2fadmin"],
    ["..", "..", "admin"],
  ]) {
    assert.equal(resolveUpstreamPath(path), null, path.join("/"));
  }
});

test("refuses ids carrying a path separator or query", () => {
  for (const id of ["a/b", "a?b=1", "a#b", "a b", "", "/etc/passwd"]) {
    assert.equal(
      resolveUpstreamPath(["catalog", "products", id]),
      null,
      JSON.stringify(id)
    );
  }
});

test("refuses the wrong number of segments", () => {
  assert.equal(resolveUpstreamPath(undefined), null);
  assert.equal(resolveUpstreamPath([]), null);
  assert.equal(resolveUpstreamPath(["catalog"]), null);
  assert.equal(
    resolveUpstreamPath(["catalog", "products", "1", "reviews"]),
    null,
    "nested sub-resources are not proxyable"
  );
});

test("percent-encodes the id it returns", () => {
  // Belt and braces: the id is already constrained, but the returned string is
  // interpolated straight into a URL.
  assert.equal(
    resolveUpstreamPath(["catalog", "products", "a.b-c_1"]),
    "catalog/products/a.b-c_1"
  );
});
