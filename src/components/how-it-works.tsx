export function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Explore the land",
      body: "Zoom into the map and choose a banner or flag based on size, position and current bid.",
    },
    {
      n: "02",
      title: "Place your bid",
      body: "Pay a refundable 20% deposit. Each placement has its own live auction.",
    },
    {
      n: "03",
      title: "Win your position",
      body: "The highest valid bid wins, subject to brand review and the project receiving the required approvals.",
    },
    {
      n: "04",
      title: "Become part of the land",
      body: "Winning artwork is produced for the planned one-year installation, filmed from above and archived permanently online.",
    },
  ];
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16">
      <h2 className="text-2xl font-semibold md:text-3xl">How it works</h2>
      <ol className="mt-8 grid gap-6 md:grid-cols-2">
        {steps.map((s) => (
          <li key={s.n} className="rounded-2xl border border-border bg-card p-6">
            <p className="font-mono text-sm text-muted-foreground">{s.n}</p>
            <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
