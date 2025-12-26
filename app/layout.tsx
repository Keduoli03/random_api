import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "随机一言 API",
  description: "基于 Next.js 和 Turso 的随机一言与图片 API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-gray-50 min-h-screen text-gray-900`}>
        <main className="max-w-5xl mx-auto px-4 py-12">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
