import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`
      SELECT TRIM(unnest(string_to_array(production_countries, ','))) as country, COUNT(*) as count
      FROM titles
      WHERE production_countries IS NOT NULL AND production_countries != ''
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}