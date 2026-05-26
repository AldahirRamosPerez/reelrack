import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const totalRes = await query('SELECT COUNT(*) as total FROM titles');
    const avgRes = await query('SELECT AVG(rating) as avg FROM titles WHERE rating IS NOT NULL');
    
    // Distribución por tipo normalizando valores extraños
    const typeRes = await query(`
      SELECT 
        CASE 
          WHEN media_type = 'PelÝcula' THEN 'Película'
          WHEN media_type = 'movie' THEN 'Película'
          WHEN media_type = 'Serie' THEN 'Serie'
          ELSE media_type
        END as type,
        COUNT(*) as count
      FROM titles 
      WHERE media_type IS NOT NULL AND media_type != ''
      GROUP BY type
    `);
    
    const ratingYearRes = await query(`
      SELECT year, AVG(rating) as avg 
      FROM titles 
      WHERE rating IS NOT NULL AND year IS NOT NULL 
      GROUP BY year 
      ORDER BY year
    `);
    
    return NextResponse.json({
      total: parseInt(totalRes.rows[0].total),
      avgRating: parseFloat(avgRes.rows[0].avg) || 0,
      typeCounts: typeRes.rows,
      ratingOverYears: ratingYearRes.rows.map(r => ({ year: r.year, avg: parseFloat(r.avg) })),
    });
  } catch (error) {
    console.error('Error en /api/stats:', error);
    return NextResponse.json({ total: 0, avgRating: 0, typeCounts: [], ratingOverYears: [] });
  }
}