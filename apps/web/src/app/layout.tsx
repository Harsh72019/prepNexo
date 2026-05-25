import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.WEB_URL ?? "https://prepnexo.online"),
  applicationName: "PrepNexo",
  title: {
    default: "PrepNexo - Train for Real Technical Interviews",
    template: "%s | PrepNexo",
  },
  description:
    "PrepNexo helps candidates train for real technical interviews with AI mock interviews, daily DSA arena battles, system design practice, adaptive analytics, and focused prep plans.",
  keywords: [
    "PrepNexo",
    "prepnexo",
    "AI interview prep",
    "DSA arena",
    "coding interview practice",
    "system design practice",
    "mock interview platform",
    "technical interview preparation",
    "placement preparation",
    "software engineer interview prep",
  ],
  authors: [{ name: "PrepNexo" }],
  creator: "PrepNexo",
  publisher: "PrepNexo",
  category: "Education",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/brand/favicon.png", sizes: "1024x1024", type: "image/png" },
    ],
    shortcut: "/brand/favicon.png",
    apple: [
      { url: "/brand/favicon.png", sizes: "1024x1024", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "PrepNexo",
    url: "/",
    title: "PrepNexo - Train for Real Technical Interviews",
    description:
      "Practice realistic AI interviews, compete in daily DSA arenas, improve system design, and track prep growth with PrepNexo.",
    images: [
      {
        url: "/brand/logo.png",
        width: 1024,
        height: 1024,
        alt: "PrepNexo logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepNexo - Train for Real Technical Interviews",
    description:
      "AI mock interviews, daily DSA arena battles, system design practice, and adaptive analytics.",
    images: ["/brand/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
