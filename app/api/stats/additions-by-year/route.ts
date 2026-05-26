import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`
      SELECT EXTRACT(YEAR FROM created_at) as year, COUNT(*) as count
      FROM titles
      GROUP BY year
      ORDER BY year
    `);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}