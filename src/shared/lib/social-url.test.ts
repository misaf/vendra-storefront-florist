import assert from "node:assert/strict";
import test from "node:test";
import {
  instagramProfileUrl,
  telegramProfileUrl,
  whatsappUrl,
} from "./social-url.ts";

test("normalizes social usernames and escapes path data", () => {
  assert.equal(
    instagramProfileUrl("  @florist shop  "),
    "https://www.instagram.com/florist%20shop"
  );
  assert.equal(
    telegramProfileUrl("@@flowers/example"),
    "https://t.me/flowers%2Fexample"
  );
});

test("WhatsApp uses the digits-only international number format", () => {
  assert.equal(whatsappUrl("+98 (912) 345-6789"), "https://wa.me/989123456789");
});

test("WhatsApp safely encodes the optional message", () => {
  assert.equal(
    whatsappUrl("+98 912", "Order #42 & roses"),
    "https://wa.me/98912?text=Order%20%2342%20%26%20roses"
  );
});
