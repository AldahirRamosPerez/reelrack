import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

import { GENRE_MAPPING } from '@/lib/genreMapping';

export async function GET() {
  const normalizedGenres = Object.keys(GENRE_MAPPING);
  return NextResponse.json(normalizedGenres);
}

// export async function GET() {
//   const result = await query(`
//     SELECT DISTINCT unnest(string_to_array(genres, '|')) as genre
//     FROM titles WHERE genres IS NOT NULL
//   `);
//   const genres = result.rows.map(r => r.genre).sort();
//   return NextResponse.json(genres);
// }
