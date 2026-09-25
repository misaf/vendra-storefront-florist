import { PriceView } from "vendra-storefront-florist";

export const Sizes = () => (
  <div className="flex flex-col items-start gap-4">
    <PriceView size="sm" value="$42.00" />
    <PriceView size="md" value="$68.00" />
    <PriceView size="lg" value="$120.00" />
  </div>
);

export const OnSale = () => (
  <div className="flex flex-col items-start gap-4">
    <PriceView size="sm" value="$36.00" originalValue="$45.00" />
    <PriceView size="md" value="$54.00" originalValue="$68.00" />
    <PriceView size="lg" value="$96.00" originalValue="$120.00" />
  </div>
);

export const Persian = () => (
  <div dir="rtl" className="locale-fa flex flex-col items-start gap-4">
    <PriceView size="md" value="۱٬۲۵۰٬۰۰۰ تومان" />
    <PriceView size="lg" value="۹۸۰٬۰۰۰ تومان" originalValue="۱٬۲۵۰٬۰۰۰ تومان" />
  </div>
);
