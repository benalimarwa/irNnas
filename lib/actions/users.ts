// lib/actions/users.ts
"use server";

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Récupère l'utilisateur connecté depuis la base de données
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth(); // ← AWAIT ajouté
    
    if (!userId) {
      return null;
    }
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);
    
    return user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Récupère les informations complètes de Clerk + DB
 */
export async function getCurrentUserWithClerk() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }
    
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUser.id))
      .limit(1);
    
    return {
      clerk: clerkUser,
      db: dbUser || null,
    };
  } catch (error) {
    console.error('Error getting user with Clerk:', error);
    return null;
  }
}

/**
 * Récupère un utilisateur par son email
 */
export async function getUserByEmail(email: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return user || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Récupère un utilisateur par son Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    
    return user || null;
  } catch (error) {
    console.error('Error getting user by Clerk ID:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur est admin
 */
export async function isAdmin() {
  try {
    const user = await getCurrentUser();
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Met à jour le rôle d'un utilisateur (admin seulement)
 */
export async function updateUserRole(clerkId: string, role: 'user' | 'admin') {
  try {
    const currentUserData = await getCurrentUser();
    
    // Vérifier que l'utilisateur actuel est admin
    if (currentUserData?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    
    await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, clerkId));
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

/**
 * Récupère tous les utilisateurs (admin seulement)
 */
export async function getAllUsers() {
  try {
    const currentUserData = await getCurrentUser();
    
    // Vérifier que l'utilisateur actuel est admin
    if (currentUserData?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(users.createdAt);
    
    return allUsers;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

/**
 * Supprime un utilisateur de la DB (généralement appelé par le webhook)
 */
export async function deleteUser(clerkId: string) {
  try {
    await db.delete(users).where(eq(users.clerkId, clerkId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}