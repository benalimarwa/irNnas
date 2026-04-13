// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  // Récupérer le webhook secret depuis les variables d'environnement
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  // Récupérer les headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Si les headers sont manquants, retourner une erreur
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
    });
  }

  // Récupérer le body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Créer une nouvelle instance Svix avec le secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Vérifier le webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification failed', {
      status: 400,
    });
  }

  // Gérer les différents types d'événements
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      // Créer l'utilisateur dans la base de données
      await db.insert(users).values({
        clerkId: id,
        email: email_addresses[0]?.email_address || '',
        firstName: first_name || '',
        lastName: last_name || '',
        imageUrl: image_url || '',
        role: 'user', // Par défaut, role user
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ User created in database:', id);
    } catch (error) {
      console.error('❌ Error creating user:', error);
      return new Response('Error: Failed to create user', {
        status: 500,
      });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      // Mettre à jour l'utilisateur dans la base de données
      await db
        .update(users)
        .set({
          email: email_addresses[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || '',
          imageUrl: image_url || '',
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id));

      console.log('✅ User updated in database:', id);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      return new Response('Error: Failed to update user', {
        status: 500,
      });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Supprimer l'utilisateur de la base de données
      await db.delete(users).where(eq(users.clerkId, id!));

      console.log('✅ User deleted from database:', id);
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return new Response('Error: Failed to delete user', {
        status: 500,
      });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}