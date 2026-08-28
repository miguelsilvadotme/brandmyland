import { formatEuroFromCents } from "@/lib/auction/money";
import { depositCents, remainderAfterDepositCents } from "@/lib/auction/rules";

export function DepositSummary({ amountCents }: { amountCents: number }) {
  const deposit = depositCents(amountCents);
  const rest = remainderAfterDepositCents(amountCents);
  return (
    <div className="rounded-xl border border-border bg-muted/60 p-3 text-sm">
      <p>
        Full bid <strong>{formatEuroFromCents(amountCents)}</strong>
      </p>
      <p>
        Deposit charged now: <strong>{formatEuroFromCents(deposit)}</strong> (20%,
        minimum €10)
      </p>
      <p>
        Remainder if you win: <strong>{formatEuroFromCents(rest)}</strong>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        The deposit is automatically refunded if you lose or the placement cannot
        proceed. Bank and card settlement timing is controlled by the payment
        provider.
      </p>
    </div>
  );
}
