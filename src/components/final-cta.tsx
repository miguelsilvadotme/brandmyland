import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 text-center">
      <h2 className="text-3xl font-semibold md:text-5xl">The land is empty. For now.</h2>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
        Choose the position people will remember when this either becomes a global internet
        story—or the most ambitious field in Madeira.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="#marketplace" className={cn(buttonVariants(), "h-11 px-6")}>
          Choose your spot
        </a>
        <a href="#auction" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-6")}>
          See all placements
        </a>
      </div>
    </section>
  );
}
