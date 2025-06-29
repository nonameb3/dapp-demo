import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeFi Token Farm - Stake • Earn • Prosper",
  description: "A decentralized staking platform where you can stake DIA tokens and earn DAPP rewards. Built with Next.js, Solidity, and Web3 technologies for the Base Sepolia testnet.",
  keywords: [
    "DeFi",
    "staking",
    "cryptocurrency",
    "blockchain",
    "Web3",
    "Ethereum",
    "Base",
    "token farm",
    "yield farming",
    "smart contracts"
  ],
  authors: [{ name: "DeFi Token Farm Demo" }],
  creator: "DeFi Token Farm",
  publisher: "DeFi Token Farm",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com", // Update this with your actual domain
    title: "DeFi Token Farm - Stake • Earn • Prosper",
    description: "A decentralized staking platform where you can stake DIA tokens and earn DAPP rewards. Demo built with Next.js and Solidity.",
    siteName: "DeFi Token Farm",
    images: [
      {
        url: "/og-image.png", // You can create this later
        width: 1200,
        height: 630,
        alt: "DeFi Token Farm - Decentralized Staking Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeFi Token Farm - Stake • Earn • Prosper",
    description: "A decentralized staking platform demo. Stake DIA tokens and earn DAPP rewards on Base Sepolia testnet.",
    images: ["/og-image.png"],
    creator: "@yourhandle", // Update with your Twitter handle
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://your-domain.com"), // Update this with your actual domain
  alternates: {
    canonical: "/",
  },
  category: "technology",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
