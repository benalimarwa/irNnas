import { NextRequest, NextResponse } from "next/server";
import { State } from "country-state-city";
import { TUNISIA_GOVERNORATES } from "@/lib/tunisia-governorates";

export async function GET(req: NextRequest) {
  const country = new URL(req.url).searchParams.get("country");
  if (!country) return NextResponse.json({ error: "country requis" }, { status: 400 });

  // Pour la Tunisie, country-state-city est incomplet : on utilise nos données officielles.
  if (country === "TN") {
    const states = TUNISIA_GOVERNORATES.map(g => ({ code: g.code, name: g.name }));
    return NextResponse.json(states);
  }

  const states = State.getStatesOfCountry(country).map(s => ({
    code: s.isoCode,
    name: s.name,
  }));
  return NextResponse.json(states);
}