// app/layout.tsx
import "../app/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/AdminNavbar";
import { frFR } from '@clerk/localizations';
import ClientNavbar from "@/components/ClientNavbar";
import AdminNavbar from "@/components/AdminNavbar";
export const metadata = {
  title: "ParfumIA - Votre parfum parfait en 60 secondes",
  description: "Quiz IA + boutique de parfums de luxe en Tunisie",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <ClerkProvider localization={frFR}>
      <html lang="fr">
        <body className="min-h-screen">
         
          <main className="pt-20 bg-black">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}