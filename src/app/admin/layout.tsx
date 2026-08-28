import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/auth/admin";
import { adminPasswordConfigured } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

export async function assertAdminPage() {
  if (!(await isAdminRequest())) redirect("/admin/login");
  if (!adminPasswordConfigured()) {
    // still allow login page to explain setup
  }
}
