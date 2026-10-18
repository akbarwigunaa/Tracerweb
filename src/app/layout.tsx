import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Tracer Reporting",
  description: "Sistem Web Tracer Reporting - Universitas Muhammadiyah Sidoarjo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
