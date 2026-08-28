"use client";

import type { AuctionMode, PublicBid, PublicPlacement } from "@/lib/types";
import { euroPlain } from "@/lib/auction/money";
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

function useDesktop() {
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return desktop;
}

function Header({ placement }: { placement: PublicPlacement }) {
  const current = placement.currentBidCents ?? placement.minBidCents;
  const brand = placement.leadingBrand?.displayName;
  return (
    <div className="pr-8">
      <p className="text-[15px] font-semibold tracking-tight">
        {placement.id} · {placement.name}
      </p>
      <p className="mt-1 text-sm capitalize text-muted-foreground">
        {placement.tier} {placement.type} · {placement.sizeLabel}
      </p>
      <p className="mt-1 text-sm">
        {placement.currentBidCents ? "Current bid" : "Opening bid"}{" "}
        <span className="font-semibold">{euroPlain(current)}</span>
        {brand ? ` by ${brand}` : ""}
        {placement.bidCount ? ` · ${placement.bidCount} bids` : " · no bids yet"}
      </p>
    </div>
  );
}

export function PlacementDialog({
  placement,
  mode,
  onClose,
}: {
  placement: PublicPlacement | null;
  bids?: PublicBid[];
  mode: AuctionMode;
  onClose: () => void;
}) {
  const desktop = useDesktop();
  const open = Boolean(placement);
  if (!placement || desktop === null) return null;
  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:max-w-[420px]">
          <DialogHeader className="gap-0">
            <DialogTitle className="sr-only">
              {placement.id} · {placement.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Place a bid on this Madeira field position.
            </DialogDescription>
            <Header placement={placement} />
          </DialogHeader>
          <BidForm placement={placement} mode={mode} />
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="max-h-[92vh] overflow-y-auto p-5">
        <DrawerHeader className="px-0 text-left">
          <DrawerTitle className="sr-only">
            {placement.id} · {placement.name}
          </DrawerTitle>
          <DrawerDescription className="sr-only">Bid on this placement</DrawerDescription>
          <Header placement={placement} />
        </DrawerHeader>
        <BidForm placement={placement} mode={mode} />
      </DrawerContent>
    </Drawer>
  );
}
