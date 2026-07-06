// middleware.ts
import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/client",                 // 👈 ajout : page d'accueil client, accessible aux invités
  "/client/catalog(.*)",
  "/api/products(.*)",
  "/api/webhooks(.*)",
  "/api/orders(.*)",
  "/client/panier(.*)",
  "/client/checkout(.*)",
  "/client/orders/(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isClientOnlyRoute = createRouteMatcher([
  "/client/profile(.*)",    // ← seulement ces pages nécessitent une connexion
  "/client/favorites(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (!userId) {
    if (isPublicRoute(req)) return NextResponse.next();
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  const rawRoleFromClaims = (sessionClaims?.public_metadata as { role?: string })?.role;
  let userRole = rawRoleFromClaims?.toUpperCase();

  if (!userRole) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      userRole = (clerkUser.publicMetadata as { role?: string })?.role?.toUpperCase();
    } catch (err) {
      console.error("❌ clerkClient error in middleware:", err);
    }
  }

  userRole = userRole ?? "CLIENT";

  console.log(`🔐 User: ${userId} | Role: ${userRole} | Path: ${req.nextUrl.pathname}`);

  if (req.nextUrl.pathname === "/") {
    const redirectPath = userRole === "ADMIN" ? "/admin" : "/client";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  if (isPublicRoute(req)) return NextResponse.next();

  if (isAdminRoute(req) && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/client/catalog", req.url));
  }

  if (isClientOnlyRoute(req) && userRole === "ADMIN") {
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