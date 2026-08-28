import { depositCents, remainderAfterDepositCents } from "@/lib/auction/rules";
import { euroPlain } from "@/lib/auction/money";

export function DepositSummary({ amountCents }: { amountCents: number }) {
  const deposit = depositCents(amountCents);
  const rest = remainderAfterDepositCents(amountCents);
  return (
    <div className="rounded-xl bg-muted px-4 py-3 text-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <span>Deposit, 20% of {euroPlain(amountCents)}</span>
        <span>{euroPlain(deposit)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-border/70 pt-2 font-semibold">
        <span>Due now</span>
        <span>{euroPlain(deposit)}</span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Refunded in full if you don’t win or this placement cannot proceed. If you
        do, the remaining {euroPlain(rest)} is charged to the same card after
        settlement. Timing is controlled by the payment provider.
      </p>
    </div>
  );
}
