// app/layout.tsx
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/AdminNavbar";
import { frFR } from '@clerk/localizations';
import ClientNavbar from "@/components/ClientNavbar";
import AdminNavbar from "@/components/AdminNavbar";
import SyncUser from "@/components/SyncUser";
export const metadata = {
  title: "IRNAS",
  description: "Boutique de luxe en Tunisie",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <ClerkProvider localization={frFR}>
      <html lang="fr">
        <body className="overflow-x-hidden w-full max-w-full">
         <SyncUser />
          <main className="pt-20 bg-black">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}