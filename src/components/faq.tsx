"use client";

import type { FaqItem } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trackClientEvent } from "@/lib/analytics";

export function FAQ({ items }: { items: FaqItem[] }) {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16">
      <h2 className="text-2xl font-semibold">FAQ</h2>
      <Accordion className="mt-6">
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            id={item.id === "approval" ? "faq-approval" : undefined}
          >
            <AccordionTrigger
              onClick={() => trackClientEvent("faq_opened", { faqId: item.id })}
            >
              {item.question}
            </AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
