"use client";

import { format } from "date-fns";
import type { AuctionMode, PublicBid, PublicPlacement } from "@/lib/types";
import { formatEuroFromCents } from "@/lib/auction/money";
import { nextMinimumBidCents } from "@/lib/auction/rules";
import { BidForm } from "@/components/bid-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { trackClientEvent } from "@/lib/analytics";

function useDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return desktop;
}

function Body({
  placement,
  bids,
  mode,
}: {
  placement: PublicPlacement;
  bids: PublicBid[];
  mode: AuctionMode;
}) {
  const min = nextMinimumBidCents(placement.currentBidCents, placement.minBidCents);
  const end = new Date(placement.endsAt);
  return (
    <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
      <p className="text-sm text-muted-foreground">
        {placement.type} · {placement.tier} · {placement.sizeLabel}
      </p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Current bid</dt>
          <dd className="font-semibold">
            {placement.currentBidCents
              ? formatEuroFromCents(placement.currentBidCents)
              : `Opening ${formatEuroFromCents(placement.minBidCents)}`}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Bids</dt>
          <dd className="font-semibold">{placement.bidCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Leading brand</dt>
          <dd>
            {placement.leadingBrand?.isDemo ? "Sample · " : ""}
            {placement.leadingBrand?.displayName ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Closes</dt>
          <dd>
            {format(end, "d MMM yyyy, HH:mm")} local
            <span className="block text-xs text-muted-foreground">
              {format(end, "d MMM yyyy, HH:mm")} UTC clock on the server
            </span>
          </dd>
        </div>
      </dl>
      <p className="text-sm">{placement.locationNote}</p>
      <p className="text-sm">
        Minimum next bid: <strong>{formatEuroFromCents(min)}</strong>
      </p>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Bid history</h3>
        {bids.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bids yet on this placement.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {bids.map((bid) => (
              <li key={bid.id} className="flex justify-between gap-2 border-b border-border/60 py-1">
                <span>
                  {bid.publicBidderName}
                  {bid.brand?.isDemo ? " (sample)" : ""}
                </span>
                <span>{formatEuroFromCents(bid.amountCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const url = `${window.location.origin}/spot/${placement.id}`;
            await navigator.clipboard.writeText(url);
            trackClientEvent("share_clicked", { placementId: placement.id });
          }}
        >
          Copy share link
        </Button>
      </div>
      <BidForm placement={placement} mode={mode} />
    </div>
  );
}

export function PlacementDialog({
  placement,
  bids,
  mode,
  onClose,
}: {
  placement: PublicPlacement | null;
  bids: PublicBid[];
  mode: AuctionMode;
  onClose: () => void;
}) {
  const desktop = useDesktop();
  const open = Boolean(placement);
  if (!placement) return null;
  const inner = <Body placement={placement} bids={bids} mode={mode} />;
  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {placement.id} · {placement.name}
            </DialogTitle>
            <DialogDescription>
              Place a bid on this Madeira field position.
            </DialogDescription>
          </DialogHeader>
          {inner}
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="p-4">
        <DrawerHeader>
          <DrawerTitle>
            {placement.id} · {placement.name}
          </DrawerTitle>
          <DrawerDescription>Bid on this placement</DrawerDescription>
        </DrawerHeader>
        {inner}
      </DrawerContent>
    </Drawer>
  );
}
