import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "vendra-storefront-florist";
import { Flower2, Search, Tag } from "lucide-react";

/* The header's global search, inline. */
export const GlobalSearch = () => (
  <Command className="w-[26rem] rounded-3xl border border-border">
    <CommandInput placeholder="Search bouquets, collections…" />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Bouquets">
        <CommandItem>
          <Flower2 /> Garden Party Bouquet
        </CommandItem>
        <CommandItem>
          <Flower2 /> Blush Peony Posy
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Collections">
        <CommandItem>
          <Tag /> Birthday
        </CommandItem>
        <CommandItem>
          <Tag /> Sympathy
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Suggestions">
        <CommandItem>
          <Search /> Same-day delivery
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
);
