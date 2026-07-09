// app/api/locations/countries/route.ts
import { NextResponse } from "next/server";
import { Country } from "country-state-city";

export async function GET() {
  const countries = Country.getAllCountries().map((c) => ({
    code: c.isoCode,
    name: c.name,
    dial: `+${c.phonecode}`,
    flag: c.flag,
  }));
  return NextResponse.json(countries);
}