import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/products(.*)",
  "/api/webhooks(.*)",
  "/api/orders(.*)",
  "/client(.*)",        // ← TOUT /client est public
  "/catalogue(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Pages qui nécessitent vraiment une connexion Clerk
const isAuthRequired = createRouteMatcher([
  "/client/profile(.*)",
  "/client/orders(.*)",  // ← seulement si vous voulez protéger la liste des commandes
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // Routes publiques → toujours laisser passer
  if (isPublicRoute(req)) {
    // Redirect root selon le rôle si connecté
    if (req.nextUrl.pathname === "/" && userId) {
      const rawRole = (sessionClaims?.public_metadata as { role?: string })?.role?.toUpperCase();
      let userRole = rawRole;
      if (!userRole) {
        try {
          const client = await clerkClient();
          const clerkUser = await client.users.getUser(userId);
          userRole = (clerkUser.publicMetadata as { role?: string })?.role?.toUpperCase();
        } catch { /* ignore */ }
      }
      userRole = userRole ?? "CLIENT";
      const redirectPath = userRole === "ADMIN" ? "/admin" : "/client";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
    return NextResponse.next();
  }

  // Routes admin
  if (isAdminRoute(req)) {
    if (!userId) return redirectToSignIn({ returnBackUrl: req.url });

    let userRole: string | undefined;
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      userRole = (clerkUser.publicMetadata as { role?: string })?.role?.toUpperCase();
    } catch { /* ignore */ }

    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/client", req.url));
    }
    return NextResponse.next();
  }

  // Autres routes protégées
  if (!userId) return redirectToSignIn({ returnBackUrl: req.url });

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};