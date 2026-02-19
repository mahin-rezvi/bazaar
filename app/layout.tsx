import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: {
    default: "Hudai — Modern Marketplace",
    template: "%s · Hudai",
  },
  description:
    "A modern marketplace experience built with Next.js, Firebase Auth, and Firestore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background font-sans antialiased"
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
