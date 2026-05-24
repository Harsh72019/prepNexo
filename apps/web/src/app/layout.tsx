import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.WEB_URL ?? "https://prepnexo.online"),
  title: "PrepNexo",
  description: "AI-powered interview prep where you learn, compete, and grow.",
  icons: {
    icon: [{ url: "/brand/favicon.png", sizes: "1024x1024", type: "image/png" }],
    shortcut: "/brand/favicon.png",
    apple: [{ url: "/brand/favicon.png", sizes: "1024x1024", type: "image/png" }]
  },
  openGraph: {
    title: "PrepNexo",
    description: "AI-powered interview prep where you learn, compete, and grow.",
    images: ["/brand/logo.png"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
