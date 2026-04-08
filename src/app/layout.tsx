import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "M&G Mensajeros",
  description: "Sistema de gestión logística",
  manifest: "/manifest.json",
 }

export const viewport: Viewport = {
  themeColor: "#B8860B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
