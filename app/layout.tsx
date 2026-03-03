import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/query-provider";
import { CredentialsProvider } from "@/lib/credentials-provider";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tesla Command Center",
  description: "Premium dashboard for Tesla vehicle monitoring and control",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tesla CC",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${spaceMono.variable} font-sans antialiased bg-[#0a0a0f] text-white`}
      >
        <QueryProvider>
          <CredentialsProvider>
            <Toaster
              richColors
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "#12121a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#fff",
                },
              }}
            />
            <AppShell>{children}</AppShell>
          </CredentialsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
