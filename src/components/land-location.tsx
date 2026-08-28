import {
  googleEarthUrl,
  googleMapsEmbedUrl,
  landCoordinateLabel,
} from "@/lib/config";

export function LandLocation() {
  const coords = landCoordinateLabel();
  const earth = googleEarthUrl();
  return (
    <aside className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
      <iframe
        title="Satellite view of the Brand My Land plot in São Vicente, Madeira"
        src={googleMapsEmbedUrl()}
        className="h-52 w-full border-0 md:h-64"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm">
        <span className="text-muted-foreground">São Vicente, Madeira</span>
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
