import { FooterView, InstagramIcon, TelegramIcon, WhatsAppIcon } from "vendra-storefront-florist";

const socials = [
  { label: "WhatsApp", href: "#", icon: <WhatsAppIcon aria-hidden="true" /> },
  { label: "Telegram", href: "#", icon: <TelegramIcon aria-hidden="true" /> },
  { label: "Instagram", href: "#", icon: <InstagramIcon aria-hidden="true" /> },
];

export const Default = () => (
  <FooterView
    storeName="Houshang Flowers"
    tagline="Fresh flowers and plants, arranged by hand in a small Tehran studio."
    phone={{ href: "tel:+989129333034", label: "0912-933-3034" }}
    details={[
      { glyph: "◉", value: "Tehran, Iran" },
      { glyph: "◷", value: "08:00 – 21:00" },
    ]}
    email="contact@houshang-flowers.com"
    socials={socials}
    columns={[
      {
        title: "Shop",
        links: [
          { key: "all", href: "#", label: "All products" },
          { key: "collections", href: "#", label: "All collections" },
          { key: "roses", href: "#", label: "Roses" },
          { key: "bouquets", href: "#", label: "Bouquets" },
        ],
      },
      {
        title: "Studio",
        links: [
          { key: "about", href: "#", label: "About us" },
          { key: "journal", href: "#", label: "Journal" },
        ],
      },
      {
        title: "Help",
        links: [
          { key: "faq", href: "#", label: "FAQ" },
          { key: "contact", href: "#", label: "Contact" },
        ],
      },
    ]}
    copyright="© 2026 Houshang Flowers. All rights reserved."
    madeIn="Made in Tehran"
  />
);

export const Persian = () => (
  <div dir="rtl" className="locale-fa">
    <FooterView
      storeName="مجتمع گل و گیاه هوشنگ"
      tagline="گل تازه و چیدمان خاص"
      phone={{ href: "tel:+989129333034", label: "۰۹۱۲-۹۳۳۳۰۳۴" }}
      details={[{ glyph: "◷", value: "۰۸:۰۰ تا ۲۱:۰۰" }]}
      socials={socials}
      columns={[
        {
          title: "فروشگاه",
          links: [
            { key: "all", href: "#", label: "همه محصولات" },
            { key: "vase", href: "#", label: "ظرف گل" },
            { key: "box", href: "#", label: "باکس گل" },
          ],
        },
        {
          title: "پشتیبانی",
          links: [
            { key: "faq", href: "#", label: "سوالات متداول" },
            { key: "contact", href: "#", label: "تماس با ما" },
          ],
        },
      ]}
      copyright="© ۲۰۲۶ گل‌های هوشنگ. تمامی حقوق محفوظ است."
    />
  </div>
);
