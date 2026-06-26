// utils/stock-alert.ts
export async function sendStockAlertIfNeeded(product: {
  id: number;
  name: string;
  stock: number;
  stockStatus: "NORMAL" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
}) {
  if (product.stockStatus !== "CRITICAL" && product.stockStatus !== "OUT_OF_STOCK") {
    return; // Pas d'alerte nécessaire
  }

  const type = product.stockStatus === "OUT_OF_STOCK" ? "RUPTURE" : "CRITIQUE";

  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/emails/admin/alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alertId: `product-${product.id}-${Date.now()}`,
        type,
        produit: {
          nom: product.name,
          quantite: product.stock,
          quantiteMinimale: 0,
        },
      }),
    });
  } catch (err) {
    console.error("Erreur envoi alerte stock:", err);
  }
}