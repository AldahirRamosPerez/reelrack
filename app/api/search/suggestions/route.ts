// app/api/search/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) return NextResponse.json([]);
  const result = await query(
    'SELECT id, title, year, poster_url FROM titles WHERE title ILIKE $1 LIMIT 8',
    [`%${q}%`]
  );
  return NextResponse.json(result.rows);
}