import { NextRequest, NextResponse } from 'next/server';
import { searchTMDB } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  const media_type = request.nextUrl.searchParams.get('media_type') as 'movie' | 'tv' || 'movie';
  if (!query || query.length < 2) return NextResponse.json([]);
  const results = await searchTMDB(query, media_type);
  return NextResponse.json(results);
}
