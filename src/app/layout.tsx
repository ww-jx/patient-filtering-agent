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
  title: "GiraffeGuru — Weekly Research Newsletter for Your Chronic Health Conditions",
  description: "Subscribe to a weekly newsletter that curates the latest medical papers, treatment advances, and new clinical trials for chronic health conditions like type 2 diabetes, COPD, rheumatoid arthritis, chronic kidney disease, multiple sclerosis, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="8f60c801-a74d-461d-8abc-aa06931d61f6"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:bg-white focus:text-slate-900 focus:z-50">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
