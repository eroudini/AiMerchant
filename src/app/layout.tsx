import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Providers from "./providers";
import { Footer } from "@/components/marketing/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AIMerchant",
  description: "Le copilote IA des commerçants pour doper ventes et marges.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.className}>
      <body>
        <Providers>
          {/* Zone aria-live pour messages d'état accessibles (toasts, validations) */}
          <div id="app-status" aria-live="polite" className="sr-only" />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
