import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getMemoryStore } from "@/lib/data/adapter";
import { formatEuroFromCents } from "@/lib/auction/money";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = getMemoryStore();
  const rows = [
    [
      "bidId",
      "placementId",
      "status",
      "amount",
      "deposit",
      "company",
      "email",
      "createdAt",
      "winnerBalance",
    ],
    ...store.bids.map((bid) => {
      const bidder = store.bidders.find((b) => b.id === bid.bidderId);
      return [
        bid.id,
        bid.placementId,
        bid.status,
        formatEuroFromCents(bid.amountCents),
        formatEuroFromCents(bid.depositCents),
        bidder?.companyName ?? "",
        bidder?.email ?? "",
        bid.createdAt,
        bid.winnerBalanceStatus,
      ];
    }),
  ];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=brand-my-land-bids.csv",
    },
  });
}
