# Project Overview

## Overview

This is the Vendra storefront template — a multilingual storefront built with **Next.js App Router**, **React**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui** components powered by **Radix UI** primitives. The storefront consumes a **Laravel JSON:API** backend.

Use shadcn/ui as the primary UI foundation across public storefront sections, forms, and interactive surfaces. Existing `src/shared/components/ui/` primitives should be reused before custom controls are introduced.

The currently supported locales are **Persian (`fa`)** and **English (`en`)**, with additional locales expected in the future. Always write code that scales to an arbitrary number of locales rather than assuming only two languages will ever exist.

The storefront should deliver a warm, elegant, premium shopping experience that emphasizes product discovery, floral imagery, and a seamless purchasing journey.

---

## Backend Source of Truth

The backend API is maintained in the **Vendra** repository:

- `https://github.com/misaf/vendra`

When frontend work depends on backend behavior:

1. Inspect this frontend repository's existing API clients, resource mappers, hooks, and query implementations first.
2. Reuse existing abstractions whenever possible.
3. If backend behavior or API contracts are unclear, treat the Vendra repository as the authoritative source.

Never duplicate API models or introduce frontend assumptions that contradict the backend implementation.
