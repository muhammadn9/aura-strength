import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ToastProvider";
import { WorkoutSessionProvider } from "@/components/workout/WorkoutSessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuraStrength AI - Your Personal Strength Coach",
  description: "AI-powered workout tracking with intelligent progressive overload and visual muscle recovery heatmap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <WorkoutSessionProvider>
              {children}
            </WorkoutSessionProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
