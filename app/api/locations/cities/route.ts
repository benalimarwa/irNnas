// app/api/locations/cities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { City } from "country-state-city";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const country = url.searchParams.get("country");
  const state = url.searchParams.get("state");
  if (!country || !state) return NextResponse.json({ error: "country et state requis" }, { status: 400 });

  const cities = City.getCitiesOfState(country, state).map(c => c.name);
  return NextResponse.json(cities);
}