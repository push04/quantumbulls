import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quantum Bull | Master Trading From Basics to Advanced",
  description: "Professional trading education platform with structured learning paths, daily market analysis, and protected content. Learn trading from basics to advanced strategies.",
  keywords: "trading education, learn trading, stock market courses, forex trading, trading strategies",
  openGraph: {
    title: "Quantum Bull | Master Trading From Basics to Advanced",
    description: "Professional trading education platform with structured learning paths and daily market analysis.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
