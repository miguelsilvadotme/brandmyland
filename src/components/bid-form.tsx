"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import type { AuctionMode, PublicPlacement } from "@/lib/types";
import { euroPlain, parseEuroInputToCents } from "@/lib/auction/money";
import { nextMinimumBidCents } from "@/lib/auction/rules";
import { submitBidAction } from "@/app/actions";
import { DepositSummary } from "@/components/deposit-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trackClientEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-10 rounded-lg border-border bg-background px-3 text-sm focus-visible:border-foreground focus-visible:ring-0";

export function BidForm({
  placement,
  mode,
}: {
  placement: PublicPlacement;
  mode: AuctionMode;
}) {
  const min = nextMinimumBidCents(placement.currentBidCents, placement.minBidCents);
  const [amount, setAmount] = useState(String(Math.round(min / 100)));
  const [brand, setBrand] = useState("");
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cents = parseEuroInputToCents(amount) ?? 0;
  const disabled =
    mode === "preview" || mode === "closed" || pending || placement.status === "closed";
  const rival = placement.leadingBrand?.displayName;
  const cta =
    mode === "reservations"
      ? "Register interest"
      : rival
        ? `Outbid ${rival}`
        : "Place a bid";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const website = String(data.get("companyWebsite") ?? "").trim();
    trackClientEvent("bid_started", { placementId: placement.id });
    setPending(true);
    try {
      const result = await submitBidAction({
        placementId: placement.id,
        amountCents: cents,
        fullName: brand.trim(),
        workEmail: String(data.get("workEmail") ?? ""),
        companyName: brand.trim(),
        companyWebsite: website,
        twitterHandle: String(data.get("twitterHandle") ?? "") || undefined,
        acceptTerms: accepted,
        acceptRegulatory: accepted,
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
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {mode !== "live" ? (
        <p className="text-xs text-muted-foreground">
          {mode === "preview"
            ? "Preview — you can fill this in, but bids are not charged yet."
            : mode === "reservations"
              ? "Reservations are open. No card is charged yet."
              : "This auction is closed."}
        </p>
      ) : null}

      <div>
        <Label htmlFor="amount" className="text-xs font-semibold text-foreground">
          Your bid (EUR)
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="amount"
            name="amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-describedby="min-bid"
            className={cn(fieldClass, "pr-8")}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
            €
          </span>
        </div>
        <p id="min-bid" className="mt-1 text-xs text-muted-foreground">
          Minimum {euroPlain(min)}
        </p>
      </div>

      <DepositSummary amountCents={Math.max(cents, min)} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="companyName" className="text-xs font-semibold">
            Brand name
          </Label>
          <Input
            id="companyName"
            name="companyName"
            required
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className={cn(fieldClass, "mt-1.5")}
          />
        </div>
        <div>
          <Label htmlFor="workEmail" className="text-xs font-semibold">
            Email
          </Label>
          <Input
            id="workEmail"
            name="workEmail"
            type="email"
            required
            autoComplete="email"
            className={cn(fieldClass, "mt-1.5")}
          />
        </div>
        <div>
          <Label htmlFor="companyWebsite" className="text-xs font-semibold">
            Website <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="companyWebsite"
            name="companyWebsite"
            type="url"
            placeholder="https://"
            className={cn(fieldClass, "mt-1.5")}
          />
        </div>
        <div>
          <Label htmlFor="twitterHandle" className="text-xs font-semibold">
            X handle <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="twitterHandle"
            name="twitterHandle"
            placeholder="@"
            className={cn(fieldClass, "mt-1.5")}
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold">Logo</Label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative mt-1.5 flex h-24 w-full items-center justify-center rounded-xl bg-muted px-4"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="max-h-16 max-w-[40%] object-contain" />
          ) : (
            <span className="absolute left-4 size-10 rounded-md bg-foreground" aria-hidden />
          )}
          <span className="font-medium">{brand || "Your brand"}</span>
          <Upload className="absolute top-3 right-3 size-4 text-muted-foreground" />
        </button>
        <input
          ref={fileRef}
          id="logo"
          name="logo"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setLogoName(file?.name ?? null);
            if (logoUrl) URL.revokeObjectURL(logoUrl);
            setLogoUrl(file ? URL.createObjectURL(file) : null);
          }}
        />
        {logoName ? (
          <p className="mt-1 text-[11px] text-muted-foreground">{logoName}</p>
        ) : null}
        <label className="mt-2 flex items-start gap-2 text-xs leading-snug">
          <Checkbox className="mt-0.5" />
          <span>
            My artwork already includes my brand name.{" "}
            <span className="text-muted-foreground">
              Tick this and the file is used full size.
            </span>
          </span>
        </label>
      </div>

      <label className="flex items-start gap-2 text-xs leading-snug text-muted-foreground">
        <Checkbox
          checked={accepted}
          onCheckedChange={(v) => setAccepted(v === true)}
          className="mt-0.5"
        />
        <span>
          I accept the{" "}
          <a href="/terms" className="underline underline-offset-2" target="_blank" rel="noreferrer">
            terms
          </a>{" "}
          and that physical installation needs approval.
        </span>
      </label>

      <Button
        type="submit"
        disabled={disabled || !accepted}
        className="h-12 w-full rounded-full text-base font-semibold"
      >
        {pending ? "Working…" : cta}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        I check every brand by hand before it goes on the land.
      </p>
    </form>
  );
}
