import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "vendra-storefront-florist";

const bouquets = [
  ["Blush Peony", "from-clay-200 to-clay-400"],
  ["Meadow Mix", "from-sage-200 to-sage-400"],
  ["Dried Pampas", "from-sand-200 to-sand-400"],
  ["Ruby Roses", "from-clay-300 to-rose"],
  ["White Garden", "from-sand-100 to-sage-200"],
];

/* A product rail: tiles stand in for photography. */
export const ProductRail = () => (
  <div className="w-[34rem] px-12">
    <Carousel opts={{ align: "start" }}>
      <CarouselContent>
        {bouquets.map(([name, tone]) => (
          <CarouselItem key={name} className="basis-1/3">
            <div className={`aspect-[4/5] rounded-[1.875rem] bg-gradient-to-br ${tone}`} />
            <p className="font-display mt-2 text-sm">{name}</p>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);

export const SingleSlide = () => (
  <div className="w-80 px-12">
    <Carousel>
      <CarouselContent>
        {bouquets.slice(0, 3).map(([name, tone]) => (
          <CarouselItem key={name}>
            <div className={`flex aspect-square items-end rounded-[1.875rem] bg-gradient-to-br p-5 ${tone}`}>
              <span className="font-display text-xl">{name}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);
