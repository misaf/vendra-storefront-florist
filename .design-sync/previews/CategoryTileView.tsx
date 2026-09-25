import { CategoryTileView } from "vendra-storefront-florist";

/* Photography stand-in: a wash filling the plate where the app passes its
   optimized next/image. */
const Photo = ({ wash }: { wash: string }) => (
  <div className={`absolute inset-0 ${wash}`} />
);

export const Grid = () => (
  <div className="grid max-w-3xl grid-cols-3 gap-6">
    <CategoryTileView href="#" name="Roses" image={<Photo wash="organic-wash-a" />} />
    <CategoryTileView href="#" name="Seasonal bouquets" image={<Photo wash="organic-wash-b" />} />
    <CategoryTileView href="#" name="Dried flowers" tone={3} />
  </div>
);

export const Feature = () => (
  <div className="grid max-w-2xl grid-cols-2 gap-8">
    <CategoryTileView
      href="#"
      shape="arch"
      aspect="aspect-[4/5]"
      showDescription
      name="Wedding flowers"
      description="Bridal bouquets, buttonholes and table arrangements, made to order."
      image={<Photo wash="organic-wash-c" />}
    />
    <CategoryTileView
      href="#"
      shape="arch"
      aspect="aspect-[4/5]"
      showDescription
      tone={1}
      name="Indoor plants"
      description="Easy-care greenery, potted and ready to gift."
    />
  </div>
);

export const Persian = () => (
  <div dir="rtl" className="locale-fa grid max-w-xl grid-cols-2 gap-6">
    <CategoryTileView href="#" name="گل رز" image={<Photo wash="organic-wash-d" />} />
    <CategoryTileView href="#" name="دسته گل" tone={4} />
  </div>
);
