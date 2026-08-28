"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ConsentBanner({ hasConsent }: { hasConsent: boolean }) {
  const [hidden, setHidden] = useState(hasConsent);
  if (hidden) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-4 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          We only measure anonymous product events after you opt in. Payment and personal data
          are never sent to analytics.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              document.cookie = "bml_consent=necessary; path=/; max-age=31536000";
              setHidden(true);
            }}
          >
            Necessary only
          </Button>
          <Button
            onClick={() => {
              document.cookie = "bml_consent=all; path=/; max-age=31536000";
              setHidden(true);
            }}
          >
            Allow analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
