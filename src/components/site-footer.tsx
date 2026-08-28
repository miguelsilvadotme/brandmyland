import Link from "next/link";
import type { AuctionSettings } from "@/lib/types";
import { format } from "date-fns";
import { googleEarthUrl, landCoordinateLabel } from "@/lib/config";

export function SiteFooter({ settings }: { settings: AuctionSettings }) {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-semibold">Brand My Land</p>
          <p className="mt-2 text-sm text-muted-foreground">São Vicente, Madeira, Portugal</p>
          <p className="mt-1 text-sm">
            <a
              href={googleEarthUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono tabular-nums underline-offset-2 hover:underline"
            >
              {landCoordinateLabel()}
            </a>
          </p>
          <p className="mt-2 text-sm">
            {settings.statusLabel}
            {settings.mode !== "closed" ? (
              <> · closes {format(new Date(settings.endAt), "d MMM yyyy, HH:mm")} UTC</>
            ) : null}
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/refund-policy" className="hover:underline">
            Refund policy
          </Link>
          <a href={`mailto:${settings.contactEmail}`} className="hover:underline">
            Contact
          </a>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <a
            href={settings.founderXUrl}
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Brand My Land is an independent experimental sponsorship project. Physical
            installation is subject to regulatory and safety approval.
          </p>
        </div>
      </div>
    </footer>
  );
}
