import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { siteUrl } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Brand My Land — Your brand on 1,300 m² of Madeira";
const description =
  "A live 30-day auction for 85 physical banners and flags on 1,300 m² of land in São Vicente, Madeira. Pick a position, place your bid, become part of the experiment.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: title,
    template: "%s — Brand My Land",
  },
  description,
  applicationName: "Brand My Land",
  authors: [{ name: "Miguel" }],
  openGraph: {
    title,
    description,
    locale: "en_PT",
    type: "website",
    url: siteUrl(),
    siteName: "Brand My Land",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  alternates: { canonical: siteUrl() },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col grain">
        <TooltipProvider>
          <div className="relative z-10 flex min-h-full flex-1 flex-col">
            {children}
          </div>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
