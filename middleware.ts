import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/catalogue(.*)",
  "/api/webhooks(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isClientOnlyRoute = createRouteMatcher([
  "/client(.*)",
  "/quiz(.*)",
  "/cart(.*)",
  "/orders(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (!userId) {
    if (isPublicRoute(req)) return NextResponse.next();
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 1️⃣ Lecture depuis sessionClaims (JWT token)
  const rawRoleFromClaims = (sessionClaims?.public_metadata as { role?: string })?.role;
  let userRole = rawRoleFromClaims?.toUpperCase();

  console.log("🔐 SessionClaims public_metadata:", sessionClaims?.public_metadata);

  // 2️⃣ Fallback : lecture directe depuis Clerk si sessionClaims ne contient pas le rôle
  //    Cela se produit quand le JWT template Clerk n'inclut pas public_metadata,
  //    ou quand la session a été créée avant que les métadonnées soient ajoutées.
  if (!userRole) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const fallbackRole = (clerkUser.publicMetadata as { role?: string })?.role;
      userRole = fallbackRole?.toUpperCase();
      console.log(`⚠️ Fallback clerkClient utilisé → publicMetadata.role: ${userRole ?? "non défini"}`);
    } catch (err) {
      console.error("❌ Erreur lecture clerkClient dans middleware:", err);
    }
  }

  // 3️⃣ Valeur par défaut si toujours undefined
  if (!userRole) {
    userRole = "CLIENT";
    console.warn("⚠️ Aucun rôle trouvé, rôle par défaut appliqué: CLIENT");
  }

  console.log(`🔐 Middleware - User: ${userId} | Role final: ${userRole}`);

  // 4️⃣ Redirection depuis la racine "/"
  if (req.nextUrl.pathname === "/") {
    const redirectPath = userRole === "ADMIN" ? "/admin" : "/client";
    console.log(`➡️ Redirection depuis / vers : ${redirectPath}`);
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // 5️⃣ Protection des routes Admin
  if (isAdminRoute(req) && userRole !== "ADMIN") {
    console.warn(`🚫 Accès admin refusé pour rôle: ${userRole}`);
    return NextResponse.redirect(new URL("/client", req.url));
  }

  // 6️⃣ Empêcher un Admin d'accéder aux routes client-only
  if (isClientOnlyRoute(req) && userRole === "ADMIN") {
    console.log(`🔄 Admin détecté sur route client → redirection /admin`);
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};