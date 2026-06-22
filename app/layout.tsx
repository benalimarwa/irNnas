import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from '@clerk/localizations';
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
        <head>
          {/* ✅ CRUCIAL — sans ça le mobile affiche en mode desktop */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className="overflow-x-hidden w-full max-w-full min-h-screen">
          <SyncUser />
          <main className="pt-20 bg-black">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}