import type { AuctionSettings } from "@/lib/types";
import { siteUrl } from "@/lib/config";

export function JsonLd({ settings }: { settings: AuctionSettings }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Brand My Land auction",
    description: settings.heroBody,
    startDate: settings.startAt,
    endDate: settings.endAt,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: "São Vicente, Madeira, Portugal",
      address: {
        "@type": "PostalAddress",
        addressLocality: "São Vicente",
        addressRegion: "Madeira",
        addressCountry: "PT",
      },
    },
    organizer: {
      "@type": "Organization",
      name: settings.legalEntityName,
      url: siteUrl(),
      email: settings.contactEmail,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
