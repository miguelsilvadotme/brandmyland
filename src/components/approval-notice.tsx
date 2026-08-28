import { APPROVAL_NOTICE } from "@/lib/config";

export function ApprovalNotice() {
  return (
    <p className="border-b border-warning/40 bg-[#fff6e8] px-4 py-2 text-center text-xs text-foreground md:text-sm">
      {APPROVAL_NOTICE}{" "}
      <a href="#faq-approval" className="font-medium underline underline-offset-2">
        Read the approval FAQ
      </a>
      .
    </p>
  );
}
