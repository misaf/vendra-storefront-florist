# Vendra Florist — the Organic design system

A warm, rounded storefront kit (shadcn/ui on Tailwind v4): sand surfaces, a rust primary, a rose accent for prices, pill-shaped controls, and soft 1.875rem-radius plates. English (LTR) and Persian (RTL) are both first-class.

## Setup

No provider is required — every component styles itself from `styles.css` tokens. Two root conventions matter:

- **Persian / RTL:** put `dir="rtl"` and the class `locale-fa` on the page root. `locale-fa` swaps Figtree/Caprasimo for Vazirmatn/Lalezar and switches buttons to Vazirmatn 600. Use logical utilities (`ms-*`, `pe-*`, `text-start`, `end-*`) and add `rtl:rotate-180` to directional arrows.
- **Toasts:** render one `<Toaster />` and call `toast.success(...)` / `toast.error(...)` — both come from this bundle and must stay together.

```jsx
<div dir="rtl" className="locale-fa bg-background text-foreground">…</div>
```

## Styling idiom — Tailwind utilities over CSS-variable tokens

Style your own layout with Tailwind classes; never invent hex colors.

| Family | Real names |
|---|---|
| Surfaces | `bg-background`, `bg-card`, `bg-secondary`, `bg-muted` + matching `text-*-foreground` |
| Brand | `bg-primary` / `text-primary` (rust), `text-rose` (prices, emphasis), `text-leaf`, `text-destructive` (all with `bg-`/`text-`/`border-` forms) |
| Tonal ramps | `clay-100…900` (terracotta), `sage-100…900` (green), `sand-100…900` (warm neutral) — pair a ramp's 100 background with its 800 text |
| Type | `font-display` (Caprasimo, headings, prices, weight 400 only), default body is Figtree; `store-page-title`, `store-eyebrow`, `store-lede`, `store-label` |
| Shape | controls are `rounded-full`; plates `rounded-[1.875rem]`, cards `rounded-3xl`, summary panels `rounded-[2rem]`; lift with `shadow-panel` |
| Decoration | `organic-blob` (soft blob shape), `organic-washed` (image wash) |
| Layout | `store-container` for page gutters |

Buttons are floored at 44px tall and set in the display face automatically; `size="sm"` only tightens padding. A `Button` passed through a Radix trigger with `asChild` loses the display face (the trigger's `data-slot` replaces `button`).

## Where the truth lives

Read `styles.css` (and `_ds_bundle.css`, which it imports) for every token and `store-*` / `organic-*` class; read each `components/general/<Name>/<Name>.prompt.md` and `.d.ts` for props.

## Example

```jsx
<Card className="max-w-sm">
  <CardHeader>
    <CardTitle className="font-display text-xl font-normal">Garden Party Bouquet</CardTitle>
    <CardDescription>Peonies, garden roses and eucalyptus.</CardDescription>
    <CardAction><Badge variant="sage">Same-day</Badge></CardAction>
  </CardHeader>
  <CardContent><p className="font-display text-2xl text-rose">$68.00</p></CardContent>
  <CardFooter className="gap-3">
    <Button className="flex-1">Add to cart</Button>
    <Button variant="outline">Details</Button>
  </CardFooter>
</Card>
```

**Class availability:** designs load a precompiled stylesheet — there is no Tailwind compiler at runtime. The token families above (every ramp step 100–900, the surface and brand colors) are guaranteed; standard spacing, flex/grid, radius and type-size utilities used across the storefront are present. For anything else — especially arbitrary values like `w-[37rem]` — use an inline `style` with the CSS variable, e.g. `style={{ background: "var(--clay-500)" }}`.
