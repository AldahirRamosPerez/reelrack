import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json([]);
  }

  // Obtener géneros del título origen
  const source = await query('SELECT genres FROM titles WHERE id = $1', [id]);
  if (source.rows.length === 0) return NextResponse.json([]);

  const genres = source.rows[0].genres;
  if (!genres) return NextResponse.json([]);

  const genreList: string[] = genres.split('|').map((g: string) => g.trim()).filter((g: string) => g);
  if (genreList.length === 0) return NextResponse.json([]);

  // Construir condiciones con parámetros posicionales
  const placeholders = genreList.slice(0, 3).map((_, idx) => `genres ILIKE $${idx + 2}`).join(' OR ');
  const paramsArray: any[] = [id, ...genreList.slice(0, 3).map(g => `%${g}%`)];
  const sql = `
    SELECT id, title, year, rating, poster_url
    FROM titles
    WHERE id != $1 AND (${placeholders})
    ORDER BY rating DESC NULLS LAST
    LIMIT 10
  `;
  const result = await query(sql, paramsArray);
  return NextResponse.json(result.rows);
}