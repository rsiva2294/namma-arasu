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
  title: "NammaArasu – Tamil Nadu Civic Governance & Manifesto Tracker",
  description: "An open-source, public accountability and manifesto tracking platform for Tamil Nadu. Audit policy progress, localized district investments, and citizen evidence logs.",
  keywords: [
    "NammaArasu",
    "Tamil Nadu",
    "Manifesto Tracker",
    "Civic Tech",
    "TVK Manifesto",
    "Governance Tracker",
    "Aram Porul Inbam",
    "Public Accountability",
    "Open Source India",
    "Citizen Auditing"
  ],
  authors: [{ name: "NammaArasu Contributors" }],
  creator: "NammaArasu",
  publisher: "NammaArasu",
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
    title: "NammaArasu – Tamil Nadu Civic Governance & Manifesto Tracker",
    description: "Monitor localized investments, track manifesto commitments, and audit civic progress across Tamil Nadu with 100% transparency.",
    url: "https://namma-arasu.web.app",
    siteName: "NammaArasu",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NammaArasu – Tamil Nadu Civic Governance & Manifesto Tracker",
    description: "Bringing JIRA-style accountability to public policy manifestos in Tamil Nadu. 100% open-source.",
    creator: "@NammaArasu",
  },
  category: "technology",
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
