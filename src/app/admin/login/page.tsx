import { adminLoginAction } from "@/app/actions";
import { adminPasswordConfigured, isAdminRequest } from "@/lib/auth/admin";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminRequest()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-sm text-muted-foreground">
        Placeholder credentials gate. Replace with Supabase Auth when you are ready.
        {!adminPasswordConfigured()
          ? " Set ADMIN_PASSWORD in the environment before signing in."
          : null}
      </p>
      {error ? (
        <p className="text-sm text-destructive">Invalid credentials.</p>
      ) : null}
      <form action={adminLoginAction} className="flex flex-col gap-3">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
        <Button type="submit">Enter</Button>
      </form>
    </div>
  );
}
