import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crushable",
  description: "Linkable dating profiles and structured crush connections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
