"use client";

import { useState } from "react";
import type { AuctionSettings, FaqItem, Milestone } from "@/lib/types";
import { adminUpdateFaq, adminUpdateMilestones, adminUpdateSettings } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function AdminSettingsForm({
  settings,
  faqs,
  milestones,
}: {
  settings: AuctionSettings;
  faqs: FaqItem[];
  milestones: Milestone[];
}) {
  const [mode, setMode] = useState(settings.mode);
  const [endAt, setEndAt] = useState(settings.endAt.slice(0, 16));
  const [startAt, setStartAt] = useState(settings.startAt.slice(0, 16));
  const [landImagePath, setLandImagePath] = useState(settings.landImagePath);
  const [faqText, setFaqText] = useState(JSON.stringify(faqs, null, 2));
  const [mileText, setMileText] = useState(JSON.stringify(milestones, null, 2));

  return (
    <div className="mt-8 grid gap-6">
      <h2 className="text-xl font-semibold">Auction settings</h2>
      <form
        className="grid gap-3 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await adminUpdateSettings({
            mode,
            startAt: new Date(startAt).toISOString(),
            endAt: new Date(endAt).toISOString(),
            landImagePath,
            statusLabel:
              mode === "live"
                ? "Auction live"
                : mode === "reservations"
                  ? "Reservations open"
                  : mode === "closed"
                    ? "Auction closed"
                    : "Preview",
          });
          toast.success("Settings saved");
        }}
      >
        <div>
          <Label htmlFor="mode">Mode</Label>
          <select
            id="mode"
            className="mt-1 h-8 w-full rounded-lg border bg-background px-2 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as AuctionSettings["mode"])}
          >
            <option value="preview">preview</option>
            <option value="reservations">reservations</option>
            <option value="live">live</option>
            <option value="closed">closed</option>
          </select>
        </div>
        <div>
          <Label htmlFor="land">Land image path</Label>
          <Input id="land" value={landImagePath} onChange={(e) => setLandImagePath(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="start">Start</Label>
          <Input id="start" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="end">End</Label>
          <Input id="end" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        </div>
        <Button type="submit">Save settings</Button>
      </form>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await adminUpdateFaq(JSON.parse(faqText));
          toast.success("FAQs saved");
        }}
      >
        <Label>FAQs (JSON)</Label>
        <Textarea className="mt-2 min-h-40 font-mono text-xs" value={faqText} onChange={(e) => setFaqText(e.target.value)} />
        <Button className="mt-2" type="submit">
          Save FAQs
        </Button>
      </form>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await adminUpdateMilestones(JSON.parse(mileText));
          toast.success("Milestones saved");
        }}
      >
        <Label>Milestones (JSON)</Label>
        <Textarea className="mt-2 min-h-40 font-mono text-xs" value={mileText} onChange={(e) => setMileText(e.target.value)} />
        <Button className="mt-2" type="submit">
          Save milestones
        </Button>
      </form>
    </div>
  );
}
