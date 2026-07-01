'use client';

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs/legacy"; // ← changement clé

export default function GuestAutoSignIn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useUser();
  const ranRef = useRef(false); // évite double exécution (React strict mode)

  useEffect(() => {
    const ticket = searchParams.get("ticket");
    if (!ticket || !signInLoaded || isSignedIn || ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const signInAttempt = await signIn.create({ strategy: "ticket", ticket });

        if (signInAttempt.status === "complete") {
          await setActive({ session: signInAttempt.createdSessionId });
        } else {
          console.warn("Auto sign-in incomplet:", signInAttempt.status);
        }
      } catch (err) {
        console.error("Échec de la connexion automatique:", err);
      } finally {
        // Nettoie l'URL (retire ?ticket=...) sans reload
        const url = new URL(window.location.href);
        url.searchParams.delete("ticket");
        router.replace(pathname + (url.search || ""), { scroll: false });
      }
    })();
  }, [searchParams, signInLoaded, isSignedIn, signIn, setActive, router, pathname]);

  return null;
}