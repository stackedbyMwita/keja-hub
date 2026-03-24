import type { Metadata } from "next";
import Providers from '@/components/providers/providers';
import { EB_Garamond, Geist_Mono, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
})

const fontSerif = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontHeading.variable} ${fontMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
