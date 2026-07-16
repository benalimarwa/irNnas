// lib/email.ts

interface OrderConfirmationEmailParams {
  toEmail: string;
  toName: string;
  orderId: number;
  items: { productName: string; quantity: number; price: number }[];
  total: number;
  deliveryMethod: string;
  address?: string | null;
}

export async function sendOrderConfirmationEmail(params: OrderConfirmationEmailParams) {
  const { toEmail, toName, orderId, items, total, deliveryMethod, address } = params;

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.productName}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${(item.price * item.quantity).toFixed(2)} TND</td>
        </tr>`
    )
    .join("");

  const deliveryLine =
    deliveryMethod === "DELIVERY"
      ? `<p>Votre commande sera livrée à l'adresse suivante : <strong>${address ?? ""}</strong></p>`
      : `<p>Votre commande est prête pour un retrait en magasin.</p>`;

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
      <h2 style="color:#D4AF37;">Votre commande #${String(orderId).padStart(6, "0")} est confirmée</h2>
      <p>Bonjour ${toName},</p>
      <p>Nous avons le plaisir de vous informer que votre commande a été <strong>confirmée</strong> et est en cours de préparation pour expédition.</p>
      ${deliveryLine}
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #D4AF37;">Article</th>
            <th style="text-align:center;padding:8px;border-bottom:2px solid #D4AF37;">Qté</th>
            <th style="text-align:right;padding:8px;border-bottom:2px solid #D4AF37;">Prix</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="text-align:right;font-size:18px;font-weight:bold;margin-top:16px;">
        Total : ${total.toFixed(2)} TND
      </p>
      <p style="margin-top:24px;">Merci de votre confiance,<br/>L'équipe ${process.env.BREVO_SENDER_NAME ?? "IRNAS"}</p>
    </div>
  `;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": process.env.BREVO_API_KEY as string,
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME,
      },
      to: [{ email: toEmail, name: toName }],
      subject: `Commande #${String(orderId).padStart(6, "0")} confirmée`,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Erreur envoi email Brevo:", errText);
    throw new Error("Échec de l'envoi de l'email de confirmation");
  }

  return res.json();
}