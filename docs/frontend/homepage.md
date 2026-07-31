# Frontend Homepage

## Homepage

The homepage should feel like a premium flower shop rather than a generic landing page.

Goals:

- Guide customers toward products.
- Guide customers toward categories.
- Prioritize shopping.
- Keep promotional content secondary.
- Use API content whenever available.
- Never fabricate business information.

---

## Hero Section

The hero should occupy exactly one visible viewport.

Requirements:

- Use `height: 100dvh`.
- Do not use `min-height`.
- Ensure all hero content fits inside the initial viewport.
- Scale responsively.
- The first scroll should naturally transition into the next section.
- Use real floral or product imagery.
- Prioritize product discovery.
- Display:
  - headline
  - supporting description
  - primary CTA
- Optionally display one secondary CTA.
- Do **not** display a hero badge, promotional badge, announcement badge, trust pill, or any small label above the headline.
- The hero should rely on strong typography, imagery, and spacing instead of decorative badges.
- Display a compact contact information area that includes:
  - store address
  - mobile phone number
  - office phone number
- Read the contact information from the property config (`getContactInfo()` in `src/shared/lib/config.ts`, backed by `properties/<slug>/property.config.json`). The address string stays in `messages/*.json` as `contact.addressValue`, overridden per property. Never hardcode a phone number or address here.
- Display compact Instagram, Telegram, and WhatsApp icons alongside the contact information.
- Build the social links from `property.social` (`whatsappPhone`, `telegramUsername`, `instagramUsername`) — never hardcode a handle.
- Social icons should link to their corresponding pages and open in a new browser tab.
- Provide accessible labels (`aria-label`) for each social link.
- Present the contact information and social icons with a premium, elegant design that complements the hero instead of competing with the primary call-to-action.
- Keep the contact section compact, highly readable, and responsive across all screen sizes.
- Preserve RTL/LTR compatibility.
- Use API media whenever available.
- Keep text readable across all devices.
- Avoid generic SaaS hero layouts.
- Avoid heavy overlays.

---

## Category Sections

Every product category should have its own editorial section.

Each section should:

- Begin with a dedicated section header.
- Display:
  - category title
  - category description
  - category media
- Never invent descriptions.
- Keep spacing generous.
- Prioritize products over decoration.

---

## Blog Section

The homepage includes a condensed blog showcase below the category sections.

- Posts are fetched server-side in `src/modules/home/page.tsx` and passed to the client as initial data through the thin `src/app/[locale]/page.tsx` route wrapper.
- Rendered via `components/blog-section.tsx` / `blog-carousel.tsx`; reuse these rather than building a new list.
- Use real API posts only (see `docs/frontend/blog.md`); never fabricate articles.
- Keep it secondary to product discovery and link through to `/blog`.

---

## Storefront Scroll Experience

Homepage category sections should feel like independent editorial showcases.

Requirements:

- Use native CSS Scroll Snap.
- Parent container should use:
  - `scroll-snap-type: y mandatory`
- Every category section should use:
  - `snap-start`
  - `scroll-snap-stop: always`
  - `min-h-screen`
  - `w-full`
- Each section should naturally occupy one viewport.
- Users should naturally see one category per scroll.
- Never replace native scrolling.
- Never trap users.
- Allow normal scrolling inside tall sections.
- Snap only after the current section has been fully viewed.
