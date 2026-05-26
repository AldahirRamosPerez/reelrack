import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`
      SELECT FLOOR(rating) as rating_bucket, COUNT(*) as count
      FROM titles
      WHERE rating IS NOT NULL
      GROUP BY rating_bucket
      ORDER BY rating_bucket
    `);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}