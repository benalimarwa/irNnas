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
          {/* ✅ CRUCIAL — sans ça le mobile affiche en mode desktop */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className="overflow-x-hidden w-full max-w-full min-h-screen flex flex-col">
          {/* Fond vidéo fixe — derrière tout le contenu */}
          <div className="video-background">
            <video
              src="/video/pp.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          </div>
          <div className="video-overlay" />

          <SyncUser />
          <main className="pt-20 relative z-10 flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}