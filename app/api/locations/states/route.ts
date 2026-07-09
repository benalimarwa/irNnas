// app/api/locations/states/route.ts
import { NextRequest, NextResponse } from "next/server";
import { State } from "country-state-city";

export async function GET(req: NextRequest) {
  const country = new URL(req.url).searchParams.get("country");
  if (!country) return NextResponse.json({ error: "country requis" }, { status: 400 });

  const states = State.getStatesOfCountry(country).map(s => ({
    code: s.isoCode,
    name: s.name,
  }));
  return NextResponse.json(states);
}