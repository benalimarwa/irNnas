// app/(client)/layout.tsx
import ClientNavbar from "@/components/ClientNavbar";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IRNAS",
  description: "Trouvez votre parfum idéal grâce à notre intelligence artificielle",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div className="flex bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="flex-1 flex flex-col">
          <ClientNavbar />

          <main className="flex-1">{children}</main>

          <footer className="text-center text-sm text-gray-600 dark:text-gray-400 border-t border-purple-100 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
            <p>© IRNAS</p>
            <div className="mt-3 flex justify-center gap-6 text-xs">
              <a href="/mentions-legales" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
                Mentions légales
              </a>
              <a href="/confidentialite" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
                Confidentialité
              </a>
              <a href="/contact" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
                Contact
              </a>
            </div>
          </footer>
        </div>
      </div>
    </ClerkProvider>
  );
}