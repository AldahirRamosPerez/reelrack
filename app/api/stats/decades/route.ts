import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`
      SELECT FLOOR(year/10)*10 as decade, COUNT(*) as count
      FROM titles
      WHERE year IS NOT NULL
      GROUP BY decade
      ORDER BY decade
    `);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}