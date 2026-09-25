// Compiles .design-sync/ds-entry.css (globals.css + fonts + preview sources)
// into a static stylesheet the design-sync converter can ship as cfg.cssEntry.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const here = dirname(fileURLToPath(import.meta.url));
const from = join(here, "ds-entry.css");
const to = join(here, ".cache", "ds-styles.css");
mkdirSync(dirname(to), { recursive: true });
const result = await postcss([tailwind({ base: join(here, "..") })]).process(
  readFileSync(from, "utf8"),
  { from, to }
);
writeFileSync(to, result.css);
console.log(`wrote ${to} (${result.css.length} bytes)`);
