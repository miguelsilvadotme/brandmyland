"use client";

import { adminMarkWinnerBalance, adminModerateBrand, adminRetryRefund } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BrandActions({ brandId, isDemo }: { brandId: string; isDemo: boolean }) {
  if (isDemo) return <span className="text-xs">sample</span>;
  return (
    <div className="flex flex-col gap-1">
      <Button
        size="xs"
        onClick={async () => {
          await adminModerateBrand(brandId, "approved");
          toast.success("Brand approved");
        }}
      >
        Approve
      </Button>
      <Button
        size="xs"
        variant="destructive"
        onClick={async () => {
          await adminModerateBrand(brandId, "rejected");
          toast.success("Rejected — refund queued");
        }}
      >
        Reject + refund
      </Button>
    </div>
  );
}

export function WinnerActions({ bidId }: { bidId: string }) {
  return (
    <Button
      size="xs"
      variant="outline"
      onClick={async () => {
        await adminMarkWinnerBalance(bidId, "requested");
        toast.success("Remainder marked requested");
      }}
    >
      Mark remainder requested
    </Button>
  );
}

export function RefundRetry({ refundId }: { refundId: string }) {
  return (
    <Button
      size="xs"
      variant="outline"
      onClick={async () => {
        const result = await adminRetryRefund(refundId);
        if (result && "ok" in result && !result.ok) toast.error(result.error ?? "Refund not confirmed");
        else toast.success("Refund updated");
      }}
    >
      Retry refund
    </Button>
  );
}
