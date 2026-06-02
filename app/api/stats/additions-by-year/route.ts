import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`
      SELECT EXTRACT(YEAR FROM created_at)::int as year, COUNT(*) as count
      FROM titles
      GROUP BY EXTRACT(YEAR FROM created_at)
      ORDER BY year
    `);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error en additions-by-year:', error);
    return NextResponse.json([]);
  }
}