export function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Pick your spot and size",
      body: "85 banners and flags, priced by size and position on the field.",
    },
    {
      n: "2",
      title: "Win the bid",
      body: "The top bid at the end of the auction wins. You pay a refundable 20% deposit.",
    },
    {
      n: "3",
      title: "Your brand stays on the land",
      body: "I print and install it for a year — filmed from above, and kept on this website after that.",
    },
  ];

  return (
    <section id="how-it-works" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 md:py-20">
      <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">How it works</h2>
      <ol className="mt-12 space-y-10">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-4">
            <span
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background"
              aria-hidden
            >
              {s.n}
            </span>
            <div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 max-w-xl text-muted-foreground">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
