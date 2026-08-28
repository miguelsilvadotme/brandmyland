"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { AuctionMode, PublicPlacement } from "@/lib/types";
import { formatEuroFromCents, parseEuroInputToCents } from "@/lib/auction/money";
import { nextMinimumBidCents } from "@/lib/auction/rules";
import { REGULATORY_ACKNOWLEDGEMENT } from "@/lib/config";
import { submitBidAction } from "@/app/actions";
import { DepositSummary } from "@/components/deposit-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trackClientEvent } from "@/lib/analytics";

export function BidForm({
  placement,
  mode,
}: {
  placement: PublicPlacement;
  mode: AuctionMode;
}) {
  const min = nextMinimumBidCents(placement.currentBidCents, placement.minBidCents);
  const [amount, setAmount] = useState(String(Math.round(min / 100)));
  const [pending, setPending] = useState(false);
  const [terms, setTerms] = useState(false);
  const [reg, setReg] = useState(false);
  const cents = parseEuroInputToCents(amount) ?? 0;
  const disabled =
    mode === "preview" || mode === "closed" || pending || placement.status === "closed";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    trackClientEvent("bid_started", { placementId: placement.id });
    setPending(true);
    try {
      const result = await submitBidAction({
        placementId: placement.id,
        amountCents: cents,
        fullName: String(data.get("fullName") ?? ""),
        workEmail: String(data.get("workEmail") ?? ""),
        companyName: String(data.get("companyName") ?? ""),
        companyWebsite: String(data.get("companyWebsite") ?? ""),
        twitterHandle: String(data.get("twitterHandle") ?? "") || undefined,
        publicMessage: String(data.get("publicMessage") ?? "") || undefined,
        hidePublicName: data.get("hidePublicName") === "on",
        acceptTerms: terms,
        acceptRegulatory: reg,
      });
      if (result && "ok" in result && !result.ok) {
        toast.error(result.error);
        return;
      }
      if (result && "kind" in result && result.kind === "reservation") {
        trackClientEvent("reservation_submitted", { placementId: placement.id });
        toast.success("Interest recorded. We’ll contact you before charging a card.");
      }
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error) {
        trackClientEvent("checkout_started", { placementId: placement.id });
        return;
      }
      toast.error("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      {mode === "preview" ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs">
          Preview mode: the map is explorable, but bids are not accepted yet.
        </p>
      ) : null}
      {mode === "reservations" ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs">
          Reservations are open. We will collect verified interest without charging a
          card.
        </p>
      ) : null}
      {mode === "closed" ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs">
          This auction is closed. The map remains as a public archive.
        </p>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="amount">Bid amount (EUR)</Label>
        <Input
          id="amount"
          name="amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-describedby="min-bid"
        />
        <p id="min-bid" className="text-xs text-muted-foreground">
          Minimum valid next bid: {formatEuroFromCents(min)}
        </p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" required autoComplete="name" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="workEmail">Work email</Label>
        <Input id="workEmail" name="workEmail" type="email" required autoComplete="email" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="companyName">Company / brand name</Label>
        <Input id="companyName" name="companyName" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="companyWebsite">Company website</Label>
        <Input id="companyWebsite" name="companyWebsite" type="url" required placeholder="https://" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="twitterHandle">X / Twitter handle (optional)</Label>
        <Input id="twitterHandle" name="twitterHandle" placeholder="@brand" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="logo">Logo upload (optional at bidding)</Label>
        <Input id="logo" name="logo" type="file" accept="image/*" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="publicMessage">Short public message (optional)</Label>
        <Textarea id="publicMessage" name="publicMessage" maxLength={280} />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <Checkbox
          checked={terms}
          onCheckedChange={(v) => setTerms(v === true)}
        />
        <span>
          I accept the{" "}
          <a href="/terms" className="underline" target="_blank" rel="noreferrer">
            auction terms
          </a>
          .
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <Checkbox checked={reg} onCheckedChange={(v) => setReg(v === true)} />
        <span>{REGULATORY_ACKNOWLEDGEMENT}</span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="hidePublicName" className="mt-1 size-4" />
        Hide my personal name on the public bid history
      </label>
      <DepositSummary amountCents={Math.max(cents, min)} />
      <Button type="submit" disabled={disabled || !terms || !reg} className="h-11">
        {pending
          ? "Working…"
          : mode === "reservations"
            ? "Register interest"
            : `Outbid ${formatEuroFromCents(min)}`}
      </Button>
    </form>
  );
}
