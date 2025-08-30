import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TestProvider } from "@/providers/TestProvider";
import { ServiceWorkerProvider } from "@/components/ServiceWorkerProvider";
import { StorageNotification } from "@/components/StorageNotification";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DAT Angle Practice | Perceptual Ability Test Prep",
  description:
    "Practice angle ranking questions for the Dental Admission Test (DAT) Perceptual Ability Test section. Improve your spatial reasoning skills with timed practice tests.",
  keywords:
    "DAT, Dental Admission Test, PAT, Perceptual Ability Test, angle ranking, spatial reasoning, dental school prep",
  authors: [{ name: "DAT Prep Tools" }],
  robots: "index, follow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DAT Angle Practice",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <ServiceWorkerProvider>
          <TestProvider>
            <div className="min-h-screen flex flex-col">
              <StorageNotification />
              <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-3">
                  <h1 className="text-xl font-semibold text-gray-900">
                    DAT Angle Practice
                  </h1>
                  <p className="text-sm text-gray-600">
                    Perceptual Ability Test Preparation
                  </p>
                </div>
              </header>
              <main className="flex-1">{children}</main>
            </div>
          </TestProvider>
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
