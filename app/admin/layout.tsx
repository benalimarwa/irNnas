// app/admin/layout.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminNavbar from "@/components/AdminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Récupérer l'utilisateur Clerk actuel
  const clerkUser = await currentUser();

  // 2. Si personne n'est connecté → redirection immédiate
  if (!clerkUser) {
    redirect("/sign-in");
  }

  // 3. Vérifier le rôle depuis les métadonnées Clerk (rapide)
  const role = (clerkUser.publicMetadata as { role?: string })?.role;

  if (role !== "ADMIN") {
    console.warn(
      `⚠️ Accès admin refusé pour ${clerkUser.emailAddresses[0]?.emailAddress} (rôle: ${role || "non défini"})`
    );
    redirect("/client");
  }

  // 4. Double vérification dans la DB (sécurité renforcée)
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  // Si l'utilisateur n'existe pas dans Prisma, le créer (fallback)
  if (!dbUser) {
    const email = clerkUser.emailAddresses.find(
      (addr) => addr.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;

    if (!email) {
      console.error(`❌ Utilisateur Clerk sans email: ${clerkUser.id}`);
      redirect("/sign-in");
    }

    // Vérifier si un user existe déjà avec cet email (ex: seed avec un clerkId différent/placeholder)
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      // Mettre à jour le clerkId pour le faire correspondre à l'utilisateur Clerk actuel
      dbUser = await prisma.user.update({
        where: { email },
        data: {
          clerkId: clerkUser.id,
          firstName: clerkUser.firstName || existingByEmail.firstName,
          lastName: clerkUser.lastName || existingByEmail.lastName,
        },
      });

      console.log(`ℹ️ Utilisateur existant mis à jour (clerkId synchronisé): ${dbUser.email}`);
    } else {
      // Correction ici : utiliser firstName + lastName au lieu de name
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          role: "CLIENT", // Par défaut CLIENT (tu peux le changer plus tard via admin)
        },
      });

      console.log(`ℹ️ Utilisateur créé en fallback: ${dbUser.email}`);
    }
  }

  // 5. Vérification finale du rôle dans la DB
  if (dbUser.role !== "ADMIN") {
    console.warn(
      `⚠️ Rôle DB incorrect pour ${dbUser.email}: ${dbUser.role} (attendu: ADMIN)`
    );
    redirect("/client");
  }

  // 6. Tout est OK → rendu du layout admin
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar admin */}
      <AdminNavbar />

      {/* Contenu principal avec padding pour la navbar sticky */}
     <main className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} ParfumIA Admin • Tous droits réservés
      </footer>
    </div>
  );
}