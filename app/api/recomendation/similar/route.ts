// app/api/recommendations/similar/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  // Obtener géneros del título origen
  const source = await query('SELECT genres FROM titles WHERE id = $1', [id]);
  if (source.rows.length === 0) return NextResponse.json([]);
  const genres = source.rows[0].genres;
  if (!genres) return NextResponse.json([]);
  const genreList = genres.split('|').map((g: string) => g.trim()).slice(0, 2);
  // Buscar títulos que compartan al menos un género (excluyendo el mismo)
  const similar = await query(`
    SELECT id, title, year, rating, poster_url
    FROM titles
    WHERE id != $1 AND (genres ILIKE $2 OR genres ILIKE $3)
    ORDER BY rating DESC NULLS LAST
    LIMIT 10
  `, [id, `%${genreList[0]}%`, genreList[1] ? `%${genreList[1]}%` : '%']);
  return NextResponse.json(similar.rows);
}