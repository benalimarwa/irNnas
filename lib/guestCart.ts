// lib/guestCart.ts
export type GuestCartItem = { productId: number; quantity: number; size?: string };

const KEY = "irnas_guest_cart";

export const guestCart = {
  get(): GuestCartItem[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  },
  add(productId: number, quantity = 1) {
    const items = guestCart.get();
    const existing = items.find(i => i.productId === productId);
    if (existing) existing.quantity += quantity;
    else items.push({ productId, quantity });
    localStorage.setItem(KEY, JSON.stringify(items));
  },
  clear() { localStorage.removeItem(KEY); },
  count(): number {
    return guestCart.get().reduce((s, i) => s + i.quantity, 0);
  }
};