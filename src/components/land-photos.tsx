import Image from "next/image";

const PHOTOS = [
  {
    src: "/images/land-ground-01.jpg",
    alt: "The plot from ground level, looking toward neighbouring houses and the São Vicente mountains.",
  },
  {
    src: "/images/land-ground-02.jpg",
    alt: "Standing on the land: open field, a small shed, and the mountain ridge behind São Vicente.",
  },
  {
    src: "/images/land-ground-03.jpg",
    alt: "The cleared plot on a clear day, with houses and mountains across the valley.",
  },
];

export function LandPhotos() {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="space-y-3 px-4 py-4 text-sm leading-relaxed text-muted-foreground md:px-5">
        <p className="text-foreground">
          This is not a scam. The land is mine. I kept this page as simple as possible so
          I could launch the project.
        </p>
        <p>
          If it gets traction I will keep improving it — better photos, drone footage,
          videos, the landing page, the whole thing. I wanted it live before it was
          polished.
        </p>
        <p>
          Opening bids are the floor on purpose. Below that, prints, crew and municipality
          licences don’t add up, and the project can’t happen.
        </p>
      </div>
      <ul className="grid gap-px border-t border-border bg-border sm:grid-cols-3">
        {PHOTOS.map((photo) => (
          <li key={photo.src} className="relative aspect-[3/4] bg-[#2a3324]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="(min-width: 640px) 33vw, 100vw"
              unoptimized
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
