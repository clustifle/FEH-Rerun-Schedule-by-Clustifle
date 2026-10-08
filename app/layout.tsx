import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FEH Rerun Schedule by Clustifle",
  description: "The unofficial Fire Emblem Heroes rerun schedule tracker",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "192x192" }],
    shortcut: "/favicon.png",
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

