import { Button, HeaderView } from "vendra-storefront-florist";
import { ChevronDown, Flower2, Globe, Heart, Moon, Search, ShoppingBag } from "lucide-react";

/* Stand-ins for the app's live controls (search, cart, account, language,
   theme and the shop's category menu), drawn with the kit's own Button. */
const UtilityControls = ({ lang }: { lang: string }) => (
  <>
    <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
      <Globe />
      {lang}
    </Button>
    <Button variant="ghost" size="icon" aria-label="Dark theme">
      <Moon />
    </Button>
  </>
);

const Actions = () => (
  <>
    <Button variant="ghost" size="icon" aria-label="Search">
      <Search />
    </Button>
    <Button size="icon" aria-label="Cart">
      <ShoppingBag />
    </Button>
  </>
);

const Account = () => (
  <Button variant="outline" size="icon" aria-label="Favourites">
    <Heart />
  </Button>
);

const ShopMenu = ({ label }: { label: string }) => (
  <button type="button" className="store-nav-link inline-flex items-center gap-1">
    {label}
    <ChevronDown className="size-3.5" aria-hidden="true" />
  </button>
);

export const Default = () => (
  <HeaderView
    storeName="Houshang Flowers"
    tagline="Fresh flowers and plants, arranged by hand"
    mobileTagline="Quick flower shopping"
    brandIcon={Flower2}
    promises={["Fresh flowers every day", "Same-day delivery"]}
    phone={{ href: "tel:+989129333034", label: "0912-933-3034" }}
    utilityControls={<UtilityControls lang="EN" />}
    navItems={[
      { key: "home", href: "#", label: "Home", active: true },
      { key: "shop", element: <ShopMenu label="Shop" /> },
      { key: "blog", href: "#", label: "Journal" },
      { key: "contact", href: "#", label: "Contact" },
    ]}
    actions={<Actions />}
    account={<Account />}
  />
);

export const Persian = () => (
  <div dir="rtl" className="locale-fa">
    <HeaderView
      rtl
      localeClassName="locale-fa"
      storeName="مجتمع گل و گیاه هوشنگ"
      tagline="گل تازه و چیدمان خاص"
      brandIcon={Flower2}
      promises={["گل‌های تازه روز", "ارسال سریع"]}
      phone={{ href: "tel:+989129333034", label: "۰۹۱۲-۹۳۳۳۰۳۴" }}
      utilityControls={<UtilityControls lang="FA" />}
      navItems={[
        { key: "home", href: "#", label: "خانه" },
        { key: "shop", element: <ShopMenu label="فروشگاه" /> },
        { key: "blog", href: "#", label: "وبلاگ", active: true },
        { key: "contact", href: "#", label: "تماس با ما" },
      ]}
      actions={<Actions />}
      account={<Account />}
    />
  </div>
);

export const Minimal = () => (
  <HeaderView
    storeName="Houshang Flowers"
    tagline="Checkout keeps only the brand and the cart"
    brandIcon={Flower2}
    promises={["Secure checkout"]}
    showNav={false}
    actions={
      <Button size="icon" aria-label="Cart">
        <ShoppingBag />
      </Button>
    }
  />
);
