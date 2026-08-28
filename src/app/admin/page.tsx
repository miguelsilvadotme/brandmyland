import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminRequest } from "@/lib/auth/admin";
import { adminLogoutAction, getAdminData } from "@/app/actions";
import { formatEuroFromCents } from "@/lib/auction/money";
import { Button } from "@/components/ui/button";
import { AdminSettingsForm } from "@/components/admin-settings-form";
import { BrandActions, WinnerActions, RefundRetry } from "@/components/admin-bid-actions";

export default async function AdminHome() {
  if (!(await isAdminRequest())) redirect("/admin/login");
  const data = await getAdminData();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <form action={adminLogoutAction}>
          <Button variant="outline" type="submit">
            Log out
          </Button>
        </form>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border p-3">
          <dt className="text-xs text-muted-foreground">Leading total</dt>
          <dd className="text-lg font-semibold">
            {formatEuroFromCents(data.summary.leadingBidTotalCents)}
          </dd>
        </div>
        <div className="rounded-xl border p-3">
          <dt className="text-xs text-muted-foreground">Deposits held</dt>
          <dd className="text-lg font-semibold">
            {formatEuroFromCents(data.summary.depositHeldCents)}
          </dd>
        </div>
        <div className="rounded-xl border p-3">
          <dt className="text-xs text-muted-foreground">Pending refunds</dt>
          <dd className="text-lg font-semibold">
            {formatEuroFromCents(data.summary.pendingRefundCents)}
          </dd>
        </div>
        <div className="rounded-xl border p-3">
          <dt className="text-xs text-muted-foreground">Valid bids</dt>
          <dd className="text-lg font-semibold">{data.summary.validBidCount}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm">
        <a className="underline" href="/api/admin/export">
          Export bids CSV
        </a>
      </p>
      <AdminSettingsForm settings={data.settings} faqs={data.faqs} milestones={data.milestones} />
      <h2 className="mt-10 text-xl font-semibold">Bids</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              {["Spot", "Company", "Email", "Amount", "Status", "Brand", "Balance"].map((h) => (
                <th key={h} className="px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.bids.map((bid) => {
              const bidder = data.bidders.find((b) => b.id === bid.bidderId);
              const brand = data.brands.find((b) => b.id === bid.brandId);
              return (
                <tr key={bid.id} className="border-t">
                  <td className="px-3 py-2">{bid.placementId}</td>
                  <td className="px-3 py-2">{bidder?.companyName}</td>
                  <td className="px-3 py-2">{bidder?.email}</td>
                  <td className="px-3 py-2">{formatEuroFromCents(bid.amountCents)}</td>
                  <td className="px-3 py-2">{bid.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <span>{brand?.moderationStatus}</span>
                      {brand ? <BrandActions brandId={brand.id} isDemo={brand.isDemo} /> : null}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {bid.status === "leading" || bid.status === "won" ? (
                      <WinnerActions bidId={bid.id} />
                    ) : (
                      bid.winnerBalanceStatus
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <h2 className="mt-10 text-xl font-semibold">Refunds</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {data.refunds.map((r) => (
          <li key={r.id} className="rounded-lg border p-3">
            {r.bidId} · {formatEuroFromCents(r.amountCents)} · {r.status}
            {r.error ? ` · ${r.error}` : ""}{" "}
            {r.status === "failed" || r.status === "queued" ? <RefundRetry refundId={r.id} /> : null}
          </li>
        ))}
        {data.refunds.length === 0 ? <li>No refunds queued.</li> : null}
      </ul>
      <h2 className="mt-10 text-xl font-semibold">Audit</h2>
      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
        {data.audit.slice(0, 30).map((e) => (
          <li key={e.id}>
            {e.createdAt} · {e.actor} · {e.action} · {e.detail}
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm">
        <Link href="/" className="underline">
          Back to site
        </Link>
      </p>
    </div>
  );
}
