import { NextResponse } from "next/server";

export async function GET() {
  const hasServerCredentials =
    !!process.env.TESSIE_API_KEY && !!process.env.TESSIE_VIN;

  return NextResponse.json({
    mode: hasServerCredentials ? "self-hosted" : "byok",
    hasGoogleMapsKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });
}
