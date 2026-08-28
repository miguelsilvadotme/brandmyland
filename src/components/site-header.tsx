"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import type { AuctionSettings } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV = [
  { href: "#the-land", label: "The land" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#auction", label: "Auction" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader({ settings }: { settings: AuctionSettings }) {
  const live = settings.mode === "live" || settings.mode === "reservations";
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Brand My Land
        </Link>
        <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs md:flex">
          <span
            className="pulse-dot"
            data-mode={settings.mode}
            aria-hidden
          />
          <span className="font-medium">{settings.statusLabel}</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#the-land" className={buttonVariants()}>
            Choose your spot
          </a>
          <Sheet>
            <SheetTrigger
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-background">
              <SheetHeader>
                <SheetTitle>Brand My Land</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4 px-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="pulse-dot" data-mode={settings.mode} />
                  {settings.statusLabel}
                </div>
                {NAV.map((item) => (
                  <a key={item.href} href={item.href} className="text-lg">
                    {item.label}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {!live ? (
        <p className="sr-only">
          Current status: {settings.statusLabel}
        </p>
      ) : null}
    </header>
  );
}
