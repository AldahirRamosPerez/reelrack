import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`
      SELECT unnest(string_to_array(genres, '|')) as name, COUNT(*) as count
      FROM titles
      WHERE genres IS NOT NULL
      GROUP BY name
      ORDER BY count DESC
      LIMIT 10
    `);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}