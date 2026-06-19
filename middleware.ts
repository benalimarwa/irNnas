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

  // Step 1: Try sessionClaims first (fast path — works if JWT template is configured)
  const rawRoleFromClaims = (sessionClaims?.public_metadata as { role?: string })?.role;
  let userRole = rawRoleFromClaims?.toUpperCase();

  // Step 2: Always fall back to clerkClient if claims don't have role
  // This is the reliable source of truth
  if (!userRole) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      userRole = (clerkUser.publicMetadata as { role?: string })?.role?.toUpperCase();
    } catch (err) {
      console.error("❌ clerkClient error in middleware:", err);
    }
  }

  // Step 3: Default to CLIENT only as last resort
  userRole = userRole ?? "CLIENT";

  console.log(`🔐 User: ${userId} | Role: ${userRole} | Path: ${req.nextUrl.pathname}`);

  // Step 4: Root redirect — skip for public routes other than "/"
  if (req.nextUrl.pathname === "/") {
    const redirectPath = userRole === "ADMIN" ? "/admin" : "/client";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // Step 5: Public routes pass through (after root is handled above)
  if (isPublicRoute(req)) return NextResponse.next();

  // Step 6: Admin route protection
  if (isAdminRoute(req) && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/client", req.url));
  }

  // Step 7: Prevent admin accessing client-only routes
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