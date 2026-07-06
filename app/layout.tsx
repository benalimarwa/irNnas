import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from '@clerk/localizations';
import SyncUser from "@/components/SyncUser";
import Footer from "@/components/Footer";

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
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className="overflow-x-hidden w-full max-w-full min-h-screen flex flex-col">
          {/* Fond plat, sombre et professionnel */}
          <div className="video-background" />
          <div className="video-overlay" />

          <SyncUser />
          <main className="pt-20 relative z-10 flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}