"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SyncUser() {
  const { user, isLoaded, isSignedIn } = useUser();
  const synced = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || synced.current) return;
    synced.current = true;

    const sync = async () => {
      try {
        const res  = await fetch("/api/sync-user", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          console.log("User synced, role:", data.role);
          // Rafraichir pour que le middleware lise le nouveau role
          router.refresh();
        }
      } catch (err) {
        console.error("Erreur sync:", err);
      }
    };

    sync();
  }, [isLoaded, isSignedIn, user]);

  return null; // composant invisible
}