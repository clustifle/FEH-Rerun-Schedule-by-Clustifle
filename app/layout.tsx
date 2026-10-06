import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clustifle’s FEH Rerun Tracker",
  description: "Track Legendary, Mythic, Emblem, and Chosen Hero reruns with confirmed schedules, estimates, and hero portraits.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: [{ url: "/feh-tab-symbol.png", type: "image/png", sizes: "192x192" }],
    shortcut: "/feh-tab-symbol.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

