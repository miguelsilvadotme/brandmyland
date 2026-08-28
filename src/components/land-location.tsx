import Image from "next/image";
import { googleEarthUrl, landCoordinateLabel } from "@/lib/config";

export function LandLocation() {
  const coords = landCoordinateLabel();
  const earth = googleEarthUrl();
  return (
    <aside className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
      <a
        href={earth}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[16/7] bg-[#2a3324]"
      >
        <Image
          src="/images/land-earth.jpg"
          alt="Google Earth view of the plot in São Vicente, Madeira. White lines mark the land."
          fill
          className="object-cover object-[center_48%]"
          sizes="(min-width: 1024px) 960px, 100vw"
          unoptimized
        />
      </a>
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          São Vicente, Madeira · white lines mark the land
        </span>
        <a
          href={earth}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono font-medium tabular-nums underline-offset-2 hover:underline"
        >
          {coords}
        </a>
        <a
          href={earth}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground underline-offset-2 hover:underline"
        >
          Google Earth
        </a>
      </p>
    </aside>
  );
}
