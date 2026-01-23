import type { Metadata } from "next";
import { Geist, Geist_Mono, Nova_Cut } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const novaCut = Nova_Cut({
  weight: "400",
  variable: "--font-nova-cut",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "St. Joseph's List",
  description: "A community-based tool-sharing website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${novaCut.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
