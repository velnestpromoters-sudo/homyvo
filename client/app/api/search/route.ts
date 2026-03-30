import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ success: false, error: 'Missing query' }, { status: 400 });
  }

  try {
    // Call Photon from Server side to explicitly bypass client browser CORS barriers
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`, {
        headers: {
            'Accept-Language': 'en',
            'User-Agent': 'Bnest-Property-App/1.0 (Development Server)'
        }
    });

    if (!response.ok) {
        throw new Error(`Photon returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, features: data.features || [] });

  } catch (error: any) {
    console.error('SERVER SIDE POI Search Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
