import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: { default: "TripReady", template: "%s — TripReady" },
    description: "Upload your bookings. Get a realistic, conflict-free trip that adapts when plans change.",
    applicationName: "TripReady",
    openGraph: {
      title: "TripReady — Your trip, ready for reality",
      description: "Upload your bookings. Get a realistic, conflict-free plan.",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "TripReady conflict-aware itinerary preview" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "TripReady — Your trip, ready for reality",
      description: "Upload your bookings. Get a realistic, conflict-free plan.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}
