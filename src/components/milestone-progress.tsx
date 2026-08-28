import type { Milestone } from "@/lib/types";
import { formatEuroFromCents } from "@/lib/auction/money";

export function MilestoneProgress({
  currentCents,
  milestones,
}: {
  currentCents: number;
  milestones: Milestone[];
}) {
  const max = milestones[milestones.length - 1]?.amountCents ?? 1;
  const pct = Math.min(100, (currentCents / max) * 100);
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-2xl font-semibold">Progress and targets</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Totals below use confirmed current/winning bids. Hitting a number does not mean
        the installation is approved, and it is not a profit figure.
      </p>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-lime" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-sm font-medium">{formatEuroFromCents(currentCents)} raised so far</p>
      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {milestones.map((m) => (
          <li key={m.id} className="rounded-2xl border border-border bg-card p-4">
            <p className="font-semibold">{m.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
