import { redirect } from "next/navigation";
import { PLACEMENT_DEFINITIONS } from "@/lib/auction/inventory";

export default async function SpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exists = PLACEMENT_DEFINITIONS.some((p) => p.id === id);
  if (!exists) redirect("/");
  redirect(`/?spot=${id}`);
}
