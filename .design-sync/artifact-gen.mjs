// Builds the component files of the "Vendra Florist" Design System artifact
// (https://claude.ai/artifact/5iBoXBHBtVp8LPgjsV7vT9) from the verified
// design-sync output in ds-bundle/. Nothing is re-authored: the bundle, CSS,
// previews and docs are the same bytes the Claude Design project renders.
//
// Run after a /design-sync:  node .design-sync/artifact-gen.mjs
// Output: .design-sync/.cache/artifact/project/ (gitignored). Publishing it to
// the artifact is a separate step; see "Design System artifact" in NOTES.md.
import fs from "node:fs";
import path from "node:path";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DS = path.join(REPO, "ds-bundle");
const OUT = path.join(REPO, ".design-sync/.cache/artifact/project");
const cfg = JSON.parse(fs.readFileSync(path.join(REPO, ".design-sync/config.json"), "utf8"));

// A component missing from these groups lands in "Other" - add it here.
const GROUPS = {
  Layout: ["HeaderView", "FooterView"],
  Storefront: ["CategoryTileView", "BlogPostCardView", "PriceView", "NewsletterFormView"],
  Actions: ["Button", "Badge", "WhatsAppIcon"],
  Forms: ["Form", "Input", "Label", "Textarea"],
  Content: ["Card", "Carousel", "Tabs"],
  Feedback: ["Alert", "Toaster", "Empty", "ErrorState", "Skeleton"],
  Overlays: ["Dialog", "Sheet", "DropdownMenu", "Command"],
};
// Row heights measured from each preview rendered at 900px (rows grow to fit).
// A component missing here falls back to 260px, or its viewport height for overlays.
const HEIGHTS = {"Alert":300,"Badge":194,"BlogPostCardView":797,"Button":561,"Card":688,"Carousel":576,"CategoryTileView":1207,"Command":407,"Dialog":420,"DropdownMenu":392,"Empty":487,"ErrorState":437,"Form":1010,"Input":310,"Label":232,"NewsletterFormView":558,"PriceView":382,"Sheet":520,"Skeleton":946,"Tabs":368,"Textarea":643,"Toaster":320,"WhatsAppIcon":222,"HeaderView":470,"FooterView":860};
// Laid out at this width and scaled down to fit: the header only shows its
// desktop nav from 1024px.
const WIDTHS = {"HeaderView":1280,"FooterView":1280};
const groupOf = Object.fromEntries(
  Object.entries(GROUPS).flatMap(([g, names]) => names.map((n) => [n, g]))
);

const w = (rel, data) => {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, data);
};
fs.rmSync(path.join(OUT, "components"), { recursive: true, force: true });

// --- bundle, stylesheet, React 19 -------------------------------------------
const bundle = fs.readFileSync(path.join(DS, "_ds_bundle.js"), "utf8");
w("components/bundle.js", bundle);

let css = fs.readFileSync(path.join(DS, "_ds_bundle.css"), "utf8");
// The page themes previews with <html data-theme="dark">; the storefront
// themes with a `.dark` class. Teach every dark rule to answer to both.
css = css
  .replaceAll(":root.dark", ':root:is(.dark, [data-theme="dark"])')
  .replaceAll(":where(.dark, .dark *)", ':where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *)');
// tokens.css (unlayered) also defines --radius-sm / --radius-lg with the
// brand book's px steps; Tailwind's copies sit in @layer theme and would lose.
// Pin the storefront's own values so rounded-sm / rounded-lg render as in code.
css += `\n/* Pinned for the Design System page: tokens.css defines these names too. */\n:root{--radius-sm:calc(var(--radius) - 4px);--radius-lg:var(--radius)}\n`;
w("components/bundle.css", css);

w("components/lib/react.js", fs.readFileSync(path.join(DS, "_vendor/react.js")));
w("components/lib/react-dom.js", fs.readFileSync(path.join(DS, "_vendor/react-dom.js")));

// --- per component ------------------------------------------------------------
const header = JSON.parse(bundle.slice(bundle.indexOf("{"), bundle.indexOf("*/")).trim());
const names = header.components.map((c) => c.name);
const report = [];

for (const name of names) {
  const dir = path.join(DS, "components/general", name);
  const ov = cfg.overrides?.[name] ?? {};
  const mode = ov.cardMode ?? "grid";
  const [vw, vh] = (ov.viewport ?? "").split("x").map(Number);
  const previewJs = fs.readFileSync(path.join(DS, "_preview", `${name}.js`), "utf8");
  if (/<\/script|<!--/i.test(previewJs)) throw new Error(`${name}: preview holds </script or <!--`);

  const exports = [...previewJs.matchAll(/\b([A-Z]\w*):\s*\(\)\s*=>/g)].map((m) => m[1]);
  const height = HEIGHTS[name] ?? (mode === "single" ? vh || 420 : 260);
  const layoutWidth = WIDTHS[name] ?? (mode === "single" ? vw : undefined);
  const width = layoutWidth ? ` width=${layoutWidth}` : "";

  const html = `<!-- @dsCard group="${groupOf[name] ?? "Other"}" height=${height}${width} -->
<!doctype html>
<html><head><meta charset="utf-8">
<style>
  body{margin:0;padding:20px;background:var(--background);color:var(--foreground)}
  .ds-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;align-items:start}
  .ds-grid.ds-col{grid-template-columns:1fr}
  .ds-cell{border:1px solid var(--border);border-radius:12px;padding:12px;min-width:0;overflow:hidden;transform:translateZ(0)}
  .ds-cell>h4{margin:0 0 8px;font:600 11px system-ui;color:var(--muted-foreground);text-transform:uppercase;letter-spacing:.06em}
  .ds-single{position:relative;min-height:${mode === "single" ? (vh || 420) - 40 : 0}px;transform:translateZ(0)}
</style>
</head><body>
<div class="ds-grid" id="g"></div>
<script>
${previewJs}
;(function(){
  var h=React.createElement, g=document.getElementById('g'), P=window.__dsPreview||__dsPreview||{};
  var E=[]; for (var k in P) if (typeof P[k]==='function' && /^[A-Z]/.test(k)) E.push(k);
  var MODE=${JSON.stringify(mode)}, PRIMARY=${JSON.stringify(ov.primaryStory ?? "")};
  function mount(el,key){try{ReactDOM.createRoot(el).render(h(P[key]))}catch(e){el.textContent='\\u26a0 '+(e&&e.message||e)}}
  if(MODE==='single'&&E.length){
    var s=document.createElement('div'); s.className='ds-single'; g.parentNode.replaceChild(s,g);
    mount(s, E.indexOf(PRIMARY)>=0?PRIMARY:E[0]); return;
  }
  if(MODE==='column'){g.className+=' ds-col'; var i0=PRIMARY?E.indexOf(PRIMARY):-1; if(i0>0){E.splice(i0,1);E.unshift(PRIMARY)}}
  E.forEach(function(key){
    var c=document.createElement('section'); c.className='ds-cell';
    var t=document.createElement('h4'); t.textContent=key.replace(/([a-z])([A-Z])/g,'$1 $2');
    var r=document.createElement('div'); c.appendChild(t); c.appendChild(r); g.appendChild(c); mount(r,key);
  });
})();
</script>
</body></html>
`;
  w(`components/${name}/preview.html`, html);

  // Guidelines: the verified .prompt.md, with its first line (a pointer at the
  // Claude Design bundle path) rewritten for this page.
  let doc = fs.readFileSync(path.join(dir, `${name}.prompt.md`), "utf8").split("\n");
  const rest = doc.slice(1).join("\n").replace(/^\s+/, "");
  const firstPara = rest.split(/\n\n/)[0].replace(/\s+/g, " ").trim();
  const summary = firstPara && !firstPara.startsWith("#") ? "" : `The storefront's ${name} component.\n\n`;
  w(`components/${name}/README.md`, `# ${name}\n\n${summary}${rest}\n\nUse it as \`window.VendraUI.${name}\`.\n`);

  w(`components/${name}/${name}.d.ts`, fs.readFileSync(path.join(dir, `${name}.d.ts`)));
  report.push(`${name.padEnd(20)} ${groupOf[name] ?? "Other"}  ${mode}  ${exports.length} examples  h=${height}  ${(Buffer.byteLength(html) / 1024).toFixed(0)}KB`);
}

console.log(report.join("\n"));
console.log(`\n${names.length} components`);
