export function StorySection({
  heading,
  body,
}: {
  heading: string;
  body: string;
}) {
  const facts = [
    { k: "1,300 m²", v: "of land" },
    { k: "85", v: "auction positions" },
    { k: "1 year", v: "planned physical installation" },
  ];
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{heading}</h2>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{body}</p>
      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        {facts.map((f) => (
          <div key={f.k} className="rounded-2xl border border-border bg-card p-5">
            <dt className="text-2xl font-semibold">{f.k}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{f.v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-muted-foreground">
        When the year ends, the physical installation comes down. The website stays online
        as a permanent snapshot of everyone who made it happen.
      </p>
    </section>
  );
}
