import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: { "User-Agent": "navyaa-app/1.0" },
      }
    );

    if (!response.ok) throw new Error("Nominatim failed");

    const data = await response.json();
    const addr = data.address || {};

    // Candidates for the city name in order of specificity
    let city = addr.city || addr.town || addr.village || addr.municipality || addr.state_district || addr.county;

    if (city) {
      // If we got an administrative district (like "Jaipur tehsil"), we often have a cleaner "Jaipur" elsewhere
      // But we can just strip common suffixes to be sure.
      city = city
        .replace(/\s+(Municipal Corporation|Corporation|Tehsil|District|Division|Cantonment|City)$/i, "")
        .trim();
    }


    return NextResponse.json({ city: city || "Unknown" });
  } catch (error: any) {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
