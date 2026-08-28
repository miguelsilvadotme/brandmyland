const bullets = [
  "A physical banner or flag in the position you win, for a year — if the install is approved",
  "A permanent, clickable place on this website, with a link to yours",
  "A seat in the drone reveal and in the photos this project will keep generating",
  "A media kit you can send when someone asks if it’s real",
];

export function SponsorBenefits() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
      <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
        This is not a banner.
        <br />
        It’s a picture of the planet.
      </h2>
      <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
        <p>
          1,300 m² in São Vicente, Madeira. From the road it’s a field. From a drone
          it’s a composition. From a satellite it’s a tiny, ridiculous rectangle of
          logos sitting in the Atlantic — and that is the kind of image television
          cannot leave alone.
        </p>
        <p>
          News helicopters, tourist phones, Google Earth, a plane on the way into
          Funchal. One photograph and the eyeballs go feral. Not because anyone
          clicked a display ad. Because the picture is too large, too stupid and too
          real to ignore. You are not buying impressions. You are buying a seat in
          that picture.
        </p>
      </div>
      <p className="mt-10 text-sm font-medium uppercase tracking-[0.14em] text-foreground">
        What you actually get
      </p>
      <ul className="mt-4 space-y-3">
        {bullets.map((item) => (
          <li key={item} className="flex gap-3 text-[1.05rem] leading-snug">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lime" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted-foreground">
        This is an experiment, not a media plan. No impressions, press hits or ROI
        are guaranteed — the whole point is that the picture might travel further
        than anyone can promise.
      </p>
    </section>
  );
}
