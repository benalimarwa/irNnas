// app/ClientLayout.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const roles = ["ADMIN", "CLIENT"] as const;
type Role = typeof roles[number];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      console.log("User not signed in, redirecting to /sign-in");
      router.push("/sign-in");
    } else if (user) {
      const fetchRoleWithRetry = async (retries = 3, delay = 1000): Promise<void> => {
        try {
          const email = user.primaryEmailAddress?.emailAddress;
          if (!email) {
            console.error("No primary email found for user:", user.id);
            setError("No email address found for user.");
            setRole(null);
            return;
          }

          console.log("Fetching role for email:", email);
          const response = await fetch(`/api/auth/get-role?email=${encodeURIComponent(email)}`, {
            cache: "no-store",
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("API request failed:", response.status, errorData);
            throw new Error(errorData.error || `API request failed: ${response.status}`);
          }

          const data = await response.json();
          console.log("API Response from /api/auth/get-role:", data);
          
          const roleFromApi = data.role ? data.role.toUpperCase() : null;
          if (roleFromApi && roles.includes(roleFromApi as Role)) {
            console.log("Valid role received:", roleFromApi);
            setRole(roleFromApi as Role);
            setError(null);
          } else {
            console.error("Invalid or undefined role from API:", roleFromApi);
            throw new Error("Invalid or undefined role from API");
          }
        } catch (error) {
          console.error("Error fetching role (attempt):", error);
          if (retries > 0) {
            console.log(`Retrying role fetch... (${retries} attempts left)`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchRoleWithRetry(retries - 1, delay * 2);
          }
          setError(error instanceof Error ? error.message : "Failed to fetch role after retries");
          setRole(null);
        }
      };
      
      fetchRoleWithRetry();
    }
  }, [isLoaded, isSignedIn, user, router]);

  useEffect(() => {
    if (role && isLoaded && isSignedIn) {
      const redirectMap: Record<string, string> = {
        ADMIN: "/admin",
        CLIENT: "/client",
      };
      
      const redirectPath = redirectMap[role.toUpperCase()] || "/client";
      console.log("Redirecting based on role:", role, "to:", redirectPath);

      // Check if the current path is allowed for the user's role
      const roleRouteMap: Record<string, RegExp> = {
        ADMIN: /^\/admin(\/.*)?$/,
        CLIENT: /^\/(client|quiz|catalogue|cart|orders)(\/.*)?$/,
      };
      
      const currentPath = window.location.pathname;
      const isAllowedPath = roleRouteMap[role]?.test(currentPath);

      // Redirection depuis la page d'accueil
      if (currentPath === "/") {
        console.log("Homepage detected, redirecting to:", redirectPath);
        router.push(redirectPath);
      }
      // Accès non autorisé
      else if (!isAllowedPath && currentPath !== "/") {
        console.log(`Unauthorized access attempt by ${role} to ${currentPath}`);
        router.push(redirectPath);
      }
    }
  }, [role, isLoaded, isSignedIn, router]);

  // Loading state
  if (!isLoaded || (isSignedIn && !role && !error)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}