// app/api/quiz/route.ts
import { NextResponse } from 'next/server';
import { recommendPerfumes } from "@/lib/recommend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { gender, styles, occasion, intensity } = body;

    console.log('📩 Quiz request:', { gender, styles, occasion, intensity });

    // Obtenir les recommandations (incluent déjà la relation house)
    const recommendations = await recommendPerfumes({
      gender,
      styles,
      occasion,
      intensity,
    });

    console.log('✅ Recommendations found:', recommendations.length);

    return NextResponse.json({ 
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('❌ Error in /api/quiz:', error);
    return NextResponse.json(
      { 
        recommendations: [], 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}