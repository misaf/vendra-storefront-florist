import { BlogPostCardView } from "vendra-storefront-florist";

export const Default = () => (
  <div className="grid max-w-4xl grid-cols-3 gap-6">
    <BlogPostCardView
      href="#"
      washSeed={1}
      category="Care guides"
      title="How to keep cut peonies fresh for a whole week"
      excerpt="Trim at an angle, change the water daily, and keep them away from the fruit bowl."
      dateTime="2026-09-12"
      dateLabel="September 12, 2026"
    />
    <BlogPostCardView
      href="#"
      washSeed={2}
      category="Seasonal"
      title="Autumn's best stems: dahlias, amaranth and rose hips"
      excerpt="What's arriving at the market this month, and how we arrange it."
      dateTime="2026-09-03"
      dateLabel="September 3, 2026"
    />
    <BlogPostCardView
      href="#"
      washSeed={3}
      title="A short history of the hand-tied bouquet"
      dateTime="2026-08-21"
      dateLabel="August 21, 2026"
    />
  </div>
);

export const Compact = () => (
  <div className="grid max-w-3xl grid-cols-3 gap-5">
    <BlogPostCardView href="#" compact washSeed={1} category="Care guides" title="Reviving drooping tulips" />
    <BlogPostCardView href="#" compact washSeed={2} category="Weddings" title="Choosing flowers for a winter wedding" />
    <BlogPostCardView href="#" compact washSeed={3} category="Plants" title="Five houseplants that forgive neglect" />
  </div>
);
