import type { Catalog } from "@/components/auction-experience";

export function ActivityFeed({
  items,
}: {
  items: Catalog["activity"];
}) {
  return (
    <aside className="mt-8 rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Live activity</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Quiet for now. The field is waiting.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {items.slice(0, 12).map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>{item.message.replace(/ bid /, " bid on ")}</span>
              <time className="shrink-0 text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("en-GB", {
                  timeZone: "UTC",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(item.createdAt))}{" "}
                UTC
              </time>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
