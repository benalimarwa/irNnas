import { NextRequest, NextResponse } from "next/server";
import { City } from "country-state-city";
import { TUNISIA_GOVERNORATES } from "@/lib/tunisia-governorates";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const country = url.searchParams.get("country");
  const state = url.searchParams.get("state");
  if (!country || !state) return NextResponse.json({ error: "country et state requis" }, { status: 400 });

  // Pour la Tunisie, country-state-city est incomplet : on utilise nos données officielles.
  if (country === "TN") {
    const gov = TUNISIA_GOVERNORATES.find(g => g.code === state);
    return NextResponse.json(gov ? gov.cities : []);
  }

  const cities = City.getCitiesOfState(country, state).map(c => c.name);
  return NextResponse.json(cities);
}