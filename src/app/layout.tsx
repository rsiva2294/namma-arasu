import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NammaArasu - Civic Governance Operating System",
  description: "A production-grade public accountability and manifesto tracking platform inspired by JIRA, GitHub Projects, and modern transparency boards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <Header />
        <div className="flex flex-col md:flex-row flex-1 bg-background text-foreground">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden overflow-y-auto max-w-[100vw] md:max-w-[calc(100vw-256px)] h-auto md:h-[calc(100vh-73px)] bg-background text-foreground transition-colors duration-200">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
