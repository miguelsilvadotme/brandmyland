"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MapControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Map controls">
      <Button variant="outline" size="icon" onClick={onZoomIn} aria-label="Zoom in">
        <Plus />
      </Button>
      <Button variant="outline" size="icon" onClick={onZoomOut} aria-label="Zoom out">
        <Minus />
      </Button>
      <Button variant="outline" size="sm" onClick={onReset}>
        <RotateCcw />
        Reset
      </Button>
    </div>
  );
}
