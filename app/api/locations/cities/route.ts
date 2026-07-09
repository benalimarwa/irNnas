// app/api/locations/cities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { City } from "country-state-city";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const country = url.searchParams.get("country");
  const state = url.searchParams.get("state");

  if (!country) {
    return NextResponse.json({ error: "country requis" }, { status: 400 });
  }

  // Si state est fourni, on filtre dessus.
  // Sinon (pays sans gouvernorats répertoriés), on prend toutes les villes du pays.
  const rawCities = state
    ? City.getCitiesOfState(country, state)
    : City.getCitiesOfCountry(country) ?? [];

  const names = Array.from(new Set(rawCities.map((c) => c.name))).sort((a, b) =>
    a.localeCompare(b)
  );

  return NextResponse.json(names);
}