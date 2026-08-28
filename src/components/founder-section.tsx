"use client";

import type { AuctionSettings } from "@/lib/types";
import Image from "next/image";

export function FounderSection({ settings }: { settings: AuctionSettings }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 md:flex-row md:items-center">
        <Image
          src={settings.founderPortraitPath}
          alt={`Portrait of ${settings.founderName}`}
          width={112}
          height={112}
          className="size-28 rounded-2xl object-cover bg-muted"
          unoptimized
        />
        <div>
          <h2 className="text-2xl font-semibold">Hey, I’m {settings.founderName} 👋</h2>
          <p className="mt-3 text-muted-foreground">{settings.founderBio}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <a
              className="underline"
              href={settings.founderXUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
