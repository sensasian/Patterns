import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noema — Visual Evidence Investigation",
  description: "Explore patterns, challenge hypotheses, and trace every finding back to its evidence.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
