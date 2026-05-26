import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingMovies } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const movies = await getUpcomingMovies(page);
  return NextResponse.json({ results: movies });
}
