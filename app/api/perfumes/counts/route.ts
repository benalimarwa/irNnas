// app/api/perfumes/counts/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const perfumes = await prisma.product.findMany({
      where: { category: { name: 'parfum' } },
      select: {
        name: true,
        description: true,
      },
    });

    if (perfumes.length === 0) {
      return NextResponse.json({ floraux: 0, orientaux: 0, frais: 0, boises: 0 });
    }

    const counts = {
      floraux: 0,
      orientaux: 0,
      frais: 0,
      boises: 0,
    };

    const familles = {
      floraux: ['floral', 'fleuri', 'fleur', 'rose', 'jasmin', 'pivoine', 'lilas', 'tubéreuse', 'ylang'],
      orientaux: ['oriental', 'ambré', 'ambre', 'vanille', 'gourmand', 'épicé', 'épice', 'safran', 'oud', 'patchouli'],
      frais: ['frais', 'aquatique', 'agrumes', 'citrus', 'héspéridé', 'bergamote', 'marine', 'vert', 'thé'],
      boises: ['boisé', 'bois', 'santal', 'cèdre', 'vétiver', 'oud', 'encens', 'pin', 'minéral'],
    };

    perfumes.forEach((perfume) => {
      const text = `${perfume.name} ${perfume.description ?? ''}`.toLowerCase();

      if (!text.trim()) return;

      if (familles.floraux.some((k) => text.includes(k))) {
        counts.floraux++;
      }
      if (familles.orientaux.some((k) => text.includes(k))) {
        counts.orientaux++;
      }
      if (familles.frais.some((k) => text.includes(k))) {
        counts.frais++;
      }
      if (familles.boises.some((k) => text.includes(k))) {
        counts.boises++;
      }
    });

    console.log('Compteurs de familles olfactives :', counts);

    return NextResponse.json({
      floraux: counts.floraux,
      orientaux: counts.orientaux,
      frais: counts.frais,
      boises: counts.boises,
    });
  } catch (error) {
    console.error('Erreur dans /api/perfumes/counts :', error);
    return NextResponse.json(
      { floraux: 0, orientaux: 0, frais: 0, boises: 0 },
      { status: 500 }
    );
  }
}