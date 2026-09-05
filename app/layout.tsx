import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nodes — Supply Chain Intelligence",
  description: "Benchmark supply-chain operations, trace constraints and prioritise evidence-backed interventions.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
