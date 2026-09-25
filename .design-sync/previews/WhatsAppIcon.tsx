import { InstagramIcon, TelegramIcon, WhatsAppIcon } from "vendra-storefront-florist";

/* The three social marks, drawn in currentColor. The storefront sets them
   inside round 44px links in the footer and on the contact page. */
export const Set = () => (
  <div className="flex items-center gap-4 text-foreground">
    <WhatsAppIcon className="size-7" />
    <TelegramIcon className="size-7" />
    <InstagramIcon className="size-7" />
  </div>
);

export const InLinks = () => (
  <div className="flex items-center gap-2">
    {[
      [WhatsAppIcon, "WhatsApp"],
      [TelegramIcon, "Telegram"],
      [InstagramIcon, "Instagram"],
    ].map(([Icon, label]) => {
      const I = Icon as typeof WhatsAppIcon;
      return (
        <a
          key={label as string}
          href="#"
          aria-label={label as string}
          className="flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
        >
          <I className="size-5" />
        </a>
      );
    })}
  </div>
);

export const Tinted = () => (
  <div className="flex items-center gap-4">
    <WhatsAppIcon className="size-7 text-sage-700" />
    <TelegramIcon className="size-7 text-clay-600" />
    <InstagramIcon className="size-7 text-rose" />
  </div>
);
