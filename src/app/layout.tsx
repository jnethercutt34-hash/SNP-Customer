import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ConfigProvider } from "@/lib/config-context";

export const metadata: Metadata = {
  title: "SNP Configurator",
  description: "Interactive product configuration tool for the Secure Network Processor (SNP)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-background font-body">
        <ConfigProvider>
          <Navbar />
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
