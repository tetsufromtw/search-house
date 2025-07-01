import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Search House - 智能租屋搜尋平台",
  description: "Search House 提供多條件交集地圖搜尋與生活圈資訊整合，讓找房變得更簡單。結合 Google Maps 和 SUUMO 資料，為您找到理想租屋。",
  keywords: "租屋, 找房, 地圖搜尋, 生活圈, SUUMO, Google Maps, 交集搜尋, 房屋租賃",
  authors: [{ name: "Search House Team" }],
  creator: "Search House",
  publisher: "Search House",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "https://search-house.com",
    title: "Search House - 智能租屋搜尋平台",
    description: "多條件交集地圖搜尋，讓找房變得更簡單",
    siteName: "Search House",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search House - 智能租屋搜尋平台",
    description: "多條件交集地圖搜尋，讓找房變得更簡單",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://search-house.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
