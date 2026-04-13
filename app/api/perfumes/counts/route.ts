// app/api/perfumes/counts/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const perfumes = await prisma.perfume.findMany({
      select: {
        style: true,
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
      const styles = (perfume.style ?? [])
        .map((s) => s.toLowerCase().trim())
        .filter(Boolean);

      if (styles.length === 0) return;

      if (styles.some((s) => familles.floraux.some((k) => s.includes(k) || k.includes(s)))) {
        counts.floraux++;
      }
      if (styles.some((s) => familles.orientaux.some((k) => s.includes(k) || k.includes(s)))) {
        counts.orientaux++;
      }
      if (styles.some((s) => familles.frais.some((k) => s.includes(k) || k.includes(s)))) {
        counts.frais++;
      }
      if (styles.some((s) => familles.boises.some((k) => s.includes(k) || k.includes(s)))) {
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