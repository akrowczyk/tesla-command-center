import { NextRequest, NextResponse } from "next/server";

const TESSIE_BASE = "https://api.tessie.com";

async function proxyRequest(
  req: NextRequest,
  params: { path: string[] }
) {
  // BYOK headers take precedence, then fall back to server env vars
  const apiKey =
    req.headers.get("x-tessie-key") || process.env.TESSIE_API_KEY;
  const vin =
    req.headers.get("x-tessie-vin") || process.env.TESSIE_VIN;

  if (!apiKey || !vin) {
    return NextResponse.json(
      { error: "Tessie credentials not provided. Supply API key and VIN." },
      { status: 401 }
    );
  }

  const path = params.path.join("/");

  // Build the Tessie API URL: https://api.tessie.com/{vin}/{path}
  // For commands: client calls /api/tessie/command/lock -> tessie.com/{vin}/command/lock
  const url = new URL(`${TESSIE_BASE}/${vin}/${path}`);

  // Forward all query parameters
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: HeadersInit = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  // Forward POST body if present
  if (req.method === "POST") {
    const body = await req.text();
    if (body) {
      fetchOptions.body = body;
      (headers as Record<string, string>)["Content-Type"] = "application/json";
    }
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Tessie API proxy error:", error);
    return NextResponse.json(
      { error: "Failed to reach Tessie API" },
      { status: 502 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params);
}
