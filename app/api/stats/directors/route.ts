import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`
      SELECT director as name, COUNT(*) as count
      FROM titles
      WHERE director IS NOT NULL AND director != ''
      GROUP BY director
      ORDER BY count DESC
      LIMIT 15
    `);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}