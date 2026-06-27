// hooks/useSyncGuestCart.ts
"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { guestCart } from "@/lib/guestCart";

export function useSyncGuestCart() {
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;
    const items = guestCart.get();
    if (items.length === 0) return;

    // Fusionner chaque item dans le vrai panier
    Promise.all(
      items.map(item =>
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        })
      )
    ).then(() => guestCart.clear());
  }, [isSignedIn]);
}