# Frontend About Us Page

The About Us page should introduce the property as a premium, trustworthy shop through authentic storytelling, craftsmanship, and service quality. It should strengthen customer confidence, communicate the brand's values, and naturally guide visitors toward browsing products or contacting the shop.

The page should feel warm, elegant, editorial, and distinctly floral rather than resembling a generic corporate profile or company brochure.

---

## Goals

The About Us page should:

- Introduce the property's brand.
- Explain what makes the flower shop distinctive.
- Build customer trust before purchase.
- Showcase craftsmanship, freshness, and thoughtful service.
- Present the brand story in an engaging editorial format.
- Encourage visitors to continue shopping or contact the store.
- Preserve localization, RTL support, and future locale compatibility.

Never invent:

- Founding dates
- Years of experience
- Team size
- Customer counts
- Awards
- Certifications
- Press coverage
- Sustainability initiatives
- Business milestones
- Service coverage
- Testimonials
- Reviews
- Operational guarantees

Only display information verified by project content, backend APIs, or confirmed business data.

---

## Architecture

The About Us page lives under:

- `src/app/[locale]/about/page.tsx`
- `src/modules/about/components/about-us.tsx`

Requirements:

- Keep route files inside `src/app/[locale]/about/` thin.
- Localize metadata using `next-intl/server`.
- Preserve locale-aware navigation using `@/shared/i18n/navigation`.
- Use a Server Component as the page shell.
- Use Client Components only where browser interactivity is required.
- Reuse `PageShell`.
- Reuse existing storefront layouts.
- Reuse existing shadcn/ui components.
- Store all visible copy inside `messages/en.json` and `messages/fa.json`.
- Keep the implementation ready for additional locales.

---

## Layout

Organize the page into clear editorial sections.

Recommended order:

1. Hero
2. Brand Story
3. Mission
4. Values
5. Our Process
6. Trust Signals (optional)
7. Final Call To Action

Requirements:

- Maintain a clear visual hierarchy.
- Keep sections easy to scan.
- Use generous but balanced spacing.
- Avoid long uninterrupted paragraphs.
- Keep calls to action visible throughout the page.
- Use cards only for grouped information rather than wrapping entire sections.

---

## Hero

The hero should introduce the brand with confidence and warmth.

Display:

- Page title
- Supporting description
- Primary CTA to Products
- Optional secondary CTA to Contact Us
- Authentic floral or florist imagery

Requirements:

- Keep the headline concise and brand-specific.
- Prioritize real flowers and arrangements over decorative artwork.
- Use `next/image`.
- Preserve stable image dimensions.
- Provide meaningful alt text.
- Maintain readability in both Light Mode and Dark Mode.
- Preserve natural CTA hierarchy for both RTL and LTR layouts.

Avoid:

- Generic corporate heroes.
- SaaS-style layouts.
- Marketing badges.
- Decorative labels.
- Large promotional banners.
- Heavy gradients.
- Decorative clutter.

---

## Brand Story

The Brand Story should explain the philosophy behind the brand.

Topics may include:

- Fresh flower sourcing
- Floral craftsmanship
- Design philosophy
- Occasion-focused arrangements
- Personalized customer care
- Attention to detail

Requirements:

- Keep the story authentic.
- Focus on flowers and gifting.
- Write concise paragraphs.
- Avoid vague marketing language.
- Do not invent company history or milestones.
- Localize all user-visible content.

---

## Mission

The Mission section should communicate what customers can expect from the business.

Focus on:

- Quality
- Freshness
- Beautiful floral design
- Reliable customer service
- Thoughtful gifting experiences

Requirements:

- Keep statements realistic.
- Avoid unverifiable promises.
- Avoid exaggerated marketing claims.
- Keep the copy concise.

---

## Values

Values should represent standards customers experience while shopping.

Recommended values:

- Freshness
- Craftsmanship
- Thoughtful Service
- Attention to Detail

Requirements:

- Pair each value with a short explanation.
- Use simple Lucide icons when appropriate.
- Keep icon styling consistent with the storefront.
- Avoid decorative filler content.
- Avoid values that imply unverifiable business claims.

---

## Our Process

The process section should explain how an arrangement is prepared.

Recommended steps:

1. Select fresh flowers.
2. Design for the occasion.
3. Handcraft the arrangement.
4. Carefully package the order.
5. Coordinate delivery when applicable.

Requirements:

- Keep each step concise.
- Keep the process easy to scan.
- Use only verified operational details.
- Avoid promising delivery speed or freshness duration.
- Preserve proper RTL/LTR ordering.

---

## Trust Signals

Trust signals are optional and must always be verified.

Allowed examples:

- Verified business milestones
- Verified years of experience
- Verified service areas
- Verified partnerships
- Verified certifications
- Verified customer reviews

Requirements:

- Prefer qualitative trust indicators when quantitative data is unavailable.
- Never display placeholder statistics.
- Never invent testimonials.
- Never invent review excerpts.
- Remove unused translation keys for unsupported claims.

---

## Final Call To Action

The page should naturally encourage the next customer action.

Recommended actions:

- Browse Products
- Explore Categories
- Contact Us

Requirements:

- Keep CTA copy clear and helpful.
- Use locale-aware navigation.
- Preserve clear button hierarchy.
- Encourage visitors to continue shopping or contact the store naturally.
- Keep the CTA editorial rather than promotional.
- Do not include newsletter subscription forms.
- Do not include email capture forms.
- Do not include discount offers, coupon banners, or promotional campaigns.
- Do not include countdown timers, marketing popups, or lead-generation components.
- Avoid artificial urgency or sales-driven messaging.

---

## Visual Design

The About Us page should feel like a premium flower boutique.

Requirements:

- Use authentic floral imagery.
- Use florist workshop photography when appropriate.
- Maintain warm, elegant visual styling.
- Follow the existing design system.
- Reuse theme tokens.
- Support Light Mode and Dark Mode.
- Use BYekan as the primary Persian UI font.
- Keep border radius at `rounded-lg` or smaller unless an existing component requires otherwise.
- Use subtle borders.
- Use subtle shadows.
- Maintain accessible contrast.

Avoid:

- Dashboard layouts.
- Generic corporate timelines.
- Decorative blobs.
- Heavy gradients.
- Busy overlays.
- Excessive shadows.
- Generic stock photography unrelated to flowers.

---

## Mobile Experience

Mobile is the primary experience.

Requirements:

- Design mobile-first.
- Stack sections naturally.
- Keep CTAs easy to reach.
- Prevent horizontal scrolling.
- Prevent overlapping content.
- Preserve stable image aspect ratios.
- Use comfortable touch targets.
- Verify both Persian RTL and English LTR layouts.

---

## Accessibility

Every section should remain fully accessible.

Requirements:

- Use semantic heading hierarchy.
- Use semantic HTML.
- Use real buttons and links.
- Support keyboard navigation.
- Preserve visible focus indicators.
- Maintain accessible color contrast.
- Respect `prefers-reduced-motion`.
- Avoid hover-only interactions.
- Provide meaningful alt text for informative images.
- Use empty alt text for decorative imagery.

---

## Localization

All user-visible content must be localized.

Requirements:

- Store visible strings inside `messages/en.json` and `messages/fa.json`.
- Keep translation keys synchronized.
- Avoid concatenating translated strings.
- Preserve RTL/LTR compatibility.
- Keep future locale support in mind.
- Use `dir="ltr"` for phone numbers, email addresses, URLs, and other LTR content.

---

## Performance

Requirements:

- Prefer Server Components whenever practical.
- Minimize Client Components.
- Optimize images.
- Lazy-load below-the-fold media.
- Prevent layout shifts.
- Avoid unnecessary JavaScript.
- Maintain responsive interactions.
- Preserve smooth scrolling.

---

## Content Guidelines

Copy should be:

- Warm
- Elegant
- Authentic
- Trustworthy
- Concise
- Editorial
- Shopping-oriented
- Grounded in real floristry

Only describe services, values, and capabilities that the property actually provides.

The About Us page exists to build trust and communicate the property's brand.

Do not include:

- Newsletter subscription forms
- Email capture forms
- Promotional banners
- Discount sections
- Coupon offers
- Flash sale announcements
- Marketing popups
- Lead-generation sections
- Blog subscription components
- Generic marketing widgets

Never claim:

- Same-day delivery
- Nationwide delivery
- International delivery
- Guaranteed freshness duration
- Awards
- Certifications
- Customer satisfaction metrics
- Years of experience
- Sustainability practices
- Team credentials
- Business milestones

Unless those claims are verified.

The page should remain focused on storytelling, craftsmanship, floral expertise, customer care, and helping visitors confidently continue their shopping journey.
