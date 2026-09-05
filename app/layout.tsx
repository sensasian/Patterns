import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noema — Visual Evidence Investigation",
  description: "Connect databases and documents into a provenance-aware knowledge network for visual investigation.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
