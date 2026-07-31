# Frontend Contact Page

The Contact page should help shoppers quickly reach the store for product inquiries, custom floral arrangements, delivery coordination, and general customer support.

The page must feel warm, trustworthy, premium, and consistent with the storefront. It should not look like a generic lead-generation or SaaS contact page.

---

## Goals

The Contact page should:

- Make contacting the business effortless.
- Surface verified business information clearly.
- Build customer confidence through accurate contact details.
- Keep the inquiry process simple, especially on mobile.
- Preserve the premium flower-shop visual identity.

Never invent:

- Contact information
- Business hours
- Physical addresses
- Email addresses
- Social media accounts
- Response times
- Delivery promises
- Service coverage
- Business policies

Only display verified business information.

---

## Architecture

The Contact page lives under:

- `src/app/[locale]/contact/page.tsx`
- `src/modules/contact/components/contact-client.tsx`

Requirements:

- Keep route files inside `src/app/[locale]/contact/`.
- Use `src/app/[locale]/contact/page.tsx` as the thin route shell.
- Use `contact-client.tsx` only for browser interactivity.
- Localize metadata using `next-intl/server`.
- Preserve locale-aware routing.
- Reuse `PageShell`.
- Reuse existing storefront layout patterns.
- Follow existing project architecture.
- Avoid unnecessary Client Components.

### Contact Data Source

Verified contact values live in environment configuration, not in components or translation files.

- Read contact values with `getContactInfo()` from `src/shared/lib/config.ts`.
- Read them in `page.tsx` (Server Component) and pass them to `ContactClient` as a `contactInfo` prop.
- Because they are read server-side and passed as props, the env vars do **not** need the `NEXT_PUBLIC_` prefix.
- Env vars (with in-code defaults): `CONTACT_MOBILE_PHONE`, `CONTACT_OFFICE_PHONE`, `CONTACT_HOURS_OPEN`, `CONTACT_HOURS_CLOSE`.
- This keeps phone numbers and business hours as a single source of truth reusable across the header, footer, and other pages.
- Translation files hold only the localized labels, descriptions, address, and email — never the phone numbers or business hours.

### FAQ Data Source

The contact aside surfaces FAQs from the backend.

- Use the `src/modules/faq` public API.
- Fetch with the `useFaqs()` hook through the shared `apiClient`; never hardcode FAQ content.
- The `/faqs` JSON:API resource exposes `name` (question) and `description` (answer); map them in the API layer, not the component.
- Request `sort[position]=asc` and also sort by `position` client-side as a safety net.
- Limit the aside to a small number of records (currently `perPage: 5`).

---

## Page Structure

Organize the page into clear, separated sections.

Current order:

1. Page Header — hero with title, supporting copy, and a supporting image.
2. Contact Information — compact horizontal band of contact items (phones, address, business hours).
3. Contact Form with a sidebar aside (customer-help guidance + FAQ accordion).

Use a Store Location section only if a verified map or location action exists.

Requirements:

- Keep generous spacing between sections.
- Avoid long uninterrupted text blocks.
- Maintain a clear visual hierarchy.
- Keep important contact actions immediately visible.
- Keep the layout balanced on mobile, tablet, and desktop.

---

## Page Header

Display:

- Page title
- Short supporting description

Requirements:

- Keep copy friendly, professional, concise, and service-oriented.
- Avoid marketing slogans.
- Avoid promotional banners.
- Avoid oversized hero sections.
- Do not distract from the main contact task.

---

## Contact Information

Contact information is a prominent, scannable band placed directly under the header.

Display verified values for:

- Mobile phone
- Office phone, if available
- Address
- Business hours, if available

Email is not shown in this band; it is used for the contact form's `mailto:` action. Add it back here only if requested.

Layout and style:

- Present items as a compact horizontal grid, not full-width stacked rows.
- Use a responsive column count: one column on mobile, two on small screens, four on large screens (`sm:grid-cols-2 lg:grid-cols-4`).
- Use a flat design: no rounded card, ring, or heavy shadow.
- Give the band a background distinct from the white header/form (the storefront cream `#fbfaf7`), with hairline dividers between cells (a `gap-px` grid over a divider-colored background).
- Each cell stacks a circular icon badge, an uppercase label, the value, and an optional short description.
- Use a distinct, meaningful icon per item (for example `Smartphone`, `PhoneCall`, `MapPin`, `CalendarClock`) — avoid repeating the same icon.
- Use the storefront's standard zinc typography; do not introduce a separate font treatment.

Data and behavior:

- Source phone numbers and business hours from `getContactInfo()` (env), passed in via props — never hardcode them and never store them in translation files.
- Source labels, descriptions, and the address from `messages/en.json` and `messages/fa.json`.
- Use `dir="ltr"` for phone numbers and business hours.
- Convert displayed digits to Persian numerals in the `fa` locale; keep `tel:` / `mailto:` targets in Latin digits so dialing and email still work.
- Keep phone numbers and the hours range on a single line (truncate long ltr values); allow the address to wrap.
- Use `tel:` links for phone numbers and `mailto:` links for email.
- Make phone cells clickable as complete cells with clear accessible labels (`aria-label` of label + value).
- Use hover, focus, and active states only when they match the storefront design system.

Address and business-hours cells use the same visual style but remain non-clickable unless a verified map link or related action exists.

---

## Contact Form

The contact form should be short, clear, and approachable.

Fields:

- Name
- Email
- Phone
- Subject
- Message

Requirements:

- Use existing `shadcn/ui` form components.
- Visible field names come from placeholders; visible `FormLabel`s are omitted.
- Always provide an `aria-label` on each input so the field name is announced to assistive tech (never rely on the placeholder alone for accessibility).
- Keep the header clean: a title and short description, with no badge/eyebrow chip.
- Validate fields before submission.
- Display validation errors beside the related field.
- Preserve entered values after validation failures.
- Prevent duplicate submissions.
- Keep the submit button visible on all screen sizes.
- Clearly display:
  - Loading state
  - Success state
  - Error state
  - Disabled state
- Localize every visible string.
- Update both translation files whenever text changes.

Submission behavior:

- No verified backend submission endpoint exists, so the form composes a `mailto:` draft to the business email and opens the user's email client.
- Privacy and helper copy must describe this behavior accurately (it prepares an email draft; it does not send directly).
- Do not invent a backend submit route or payload fields. If a verified Laravel API contract is later provided, reuse existing API clients, mutations, and error handling, and never submit to an unverified route.

---

## Visual Design

The Contact page should feel like part of a premium flower boutique.

Requirements:

- Use authentic floral imagery when appropriate.
- Use florist workshop or arrangement photography when it supports the contact task.
- Prefer `next/image`.
- Preserve image aspect ratios.
- Prevent layout shifts.
- Maintain readable contrast.
- Support Light Mode and Dark Mode.
- Reuse the existing `shadcn/ui` design language.
- Keep borders, shadows, spacing, and typography consistent with the storefront.
- Use imagery as supporting content, not as the main focus.

Avoid:

- Generic SaaS layouts
- Dashboard aesthetics
- Heavy gradients
- Decorative clutter
- Excessive glassmorphism
- Busy backgrounds
- Oversized hero sections
- Visual elements that compete with contact actions

---

## Mobile Experience

Mobile is the primary experience.

Requirements:

- Design mobile-first.
- Stack content naturally (contact band collapses to one column on mobile).
- Keep contact actions easy to reach with one hand.
- Prevent horizontal scrolling.
- Prevent overlapping content.
- Use comfortable touch targets.
- Maintain consistent spacing.
- Ensure forms remain easy to complete on smaller screens.
- Keep inputs at `text-base` (16px) so mobile browsers do not zoom on focus.
- Ensure contact cells remain easy to tap.
- Keep the submit button easy to find and tap.
- Scale headings down on small screens; scale up at larger breakpoints.
- Test the page in both Persian and English layouts.

---

## Accessibility

Every interaction should remain fully accessible.

Requirements:

- Use semantic HTML.
- Give every input an accessible name via `aria-label` (visible labels are omitted in favor of placeholders).
- Support keyboard navigation.
- Preserve visible focus indicators.
- Maintain accessible color contrast.
- Respect `prefers-reduced-motion`.
- Provide meaningful alt text for informative images.
- Use empty alt text for decorative images.
- Verify layouts in English and Persian.
- Verify RTL and LTR rendering.
- Ensure clickable phone cells have clear accessible labels.
- Use a native `<details>`/`<summary>` accordion for the FAQ so it is keyboard- and screen-reader friendly.
- Do not rely on background color alone to communicate clickability.
- Ensure validation errors are announced or clearly associated with fields.

---

## Localization

All user-visible content must be localized.

Requirements:

- Store visible strings inside translation files.
- Use `messages/en.json`.
- Use `messages/fa.json`.
- Keep English and Persian translations synchronized.
- Avoid embedding translated text inside React components.
- Exception: verified contact values (phone numbers, business hours) live in env config, not translations. Only their labels and descriptions are translated.
- Convert displayed digits to Persian numerals in the `fa` locale; keep machine targets (`tel:`, `mailto:`) in Latin digits.
- Format the business-hours range per locale (localized separator; Persian digits in `fa`).
- Preserve RTL/LTR compatibility throughout the page.
- Use localized metadata for the page title and description.
- Use `dir="ltr"` for phone numbers, business hours, email addresses, and URLs.

---

## Content Guidelines

Copy should be:

- Warm
- Helpful
- Professional
- Concise
- Service-oriented

When appropriate and verified, mention:

- Product guidance
- Custom floral arrangements
- Order assistance
- Delivery coordination
- General customer support

Only mention services the business actually provides.

Never claim:

- Instant replies
- Same-day delivery
- Free delivery
- Nationwide coverage
- Guaranteed response times
- Unverified services
- Unverified policies

Do not generate:

- Fake testimonials
- Fake customer reviews
- Fake addresses
- Fake maps
- Fake social media accounts
- Fake business statistics
- Fake trust badges

---

## Store Location

Only include a Store Location section when a verified address or map link exists.

Requirements:

- Do not embed a fake map.
- Do not invent map coordinates.
- Do not invent a Google Maps URL.
- If a verified map link exists, make it accessible and localized.
- If only a verified address exists, display the address clearly without pretending it is interactive.
- Keep the location section visually secondary to the main contact information.

---

## Business Hours

Only display business hours when verified.

Requirements:

- Store hours as `CONTACT_HOURS_OPEN` / `CONTACT_HOURS_CLOSE` (24h, locale-neutral) in env config.
- Format the range for display per locale (localized separator; Persian digits in `fa`).
- Do not invent opening days.
- Do not invent opening or closing times.
- Do not claim holiday availability unless verified.
- Only times are currently verified — do not add day names unless verified.
- Keep the format easy to scan and on a single line.
- Localize the label.
- Preserve RTL/LTR rendering.

---

## Additional Customer Information

The form's sidebar aside carries two blocks:

1. A short, static customer-help guidance card (localized strings) covering what customers can ask about — product guidance, custom arrangements, order/delivery coordination, and what to include in a message.
2. An FAQ card that fetches records from the backend (see Architecture → FAQ Data Source).

Requirements:

- Keep guidance brief.
- Avoid policy claims unless verified.
- Avoid promises about response time or delivery.
- Do not distract from the form or direct contact actions.
- Render the FAQ as a native `<details>` accordion below the static guidance.
- Hide the FAQ card entirely when the query returns no records or errors (degrade gracefully).
- Do not hardcode or invent FAQ content; it must come from the `/faqs` API.

---

## Design Principles

Every implementation of the Contact page should feel:

- Premium
- Elegant
- Warm
- Trustworthy
- Professional
- Helpful
- Calm

The page should reduce friction, encourage communication, and make it effortless for customers to contact the store.
