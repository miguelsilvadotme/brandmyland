export function SponsorBenefits() {
  const items = [
    "A physical banner or flag in the won position for the approved campaign period",
    "A permanent clickable placement on the Brand My Land website",
    "Link to the sponsor’s website",
    "Inclusion in the final drone reveal, subject to production and flight conditions",
    "Inclusion in public project content where applicable",
    "Downloadable digital winner badge / media kit",
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="text-2xl font-semibold">What sponsors receive</h2>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
        This is an experimental sponsorship, not conventional performance advertising. No
        minimum impressions, clicks, press coverage or ROI are guaranteed.
      </p>
    </section>
  );
}
