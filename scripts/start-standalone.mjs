import { access, cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const standaloneRoot = resolve(".next/standalone");
const serverPath = resolve(standaloneRoot, "server.js");

try {
  await access(serverPath);
} catch {
  throw new Error("Standalone build not found. Run `npm run build` first.");
}

// Next's standalone output intentionally excludes public assets and the client
// chunks. Docker copies both beside server.js; mirror that documented layout
// for `npm start` so local production runs exercise the same artifact.
await mkdir(resolve(standaloneRoot, ".next"), { recursive: true });
await Promise.all([
  cp(resolve("public"), resolve(standaloneRoot, "public"), {
    recursive: true,
  }),
  cp(resolve(".next/static"), resolve(standaloneRoot, ".next/static"), {
    recursive: true,
  }),
]);

await import(pathToFileURL(serverPath).href);
